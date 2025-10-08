import { useState, useEffect, FormEvent } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getPastPapers, getSubjects, getExamSet, createPastPaper, updatePastPaper, deletePastPaper } from '../api';
import type { PastPaper, Subject, ExamSet } from '../types';
import Modal from '../components/Modal';

export default function PastPapersPage() {
  const { subjectId, examSetId } = useParams<{ subjectId?: string; examSetId?: string }>();
  const navigate = useNavigate();
  const [pastPapers, setPastPapers] = useState<PastPaper[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examSet, setExamSet] = useState<ExamSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<PastPaper | null>(null);
  const [formData, setFormData] = useState<Partial<PastPaper>>({
    paper_number: 1,
    paper_level: 1,
    paper_type: 'main',
    is_free: false,
    is_published: true,
    order_index: 0,
  });

  useEffect(() => {
    if (examSetId) {
      loadExamSet();
    }
    loadPastPapers();
  }, [subjectId, examSetId]);

  const loadExamSet = async () => {
    if (!examSetId) return;
    try {
      const response = await getExamSet(examSetId);
      const examSetData = response.data.data;
      setExamSet(examSetData || null);
      // Load subjects for this exam set's course
      if (examSetData?.course_id) {
        loadSubjects(examSetData.course_id);
      }
    } catch (err: any) {
      console.error('Failed to load exam set:', err);
    }
  };

  const loadPastPapers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (subjectId) params.subject_id = subjectId;
      if (examSetId) params.exam_set_id = examSetId;
      
      const response = await getPastPapers(params);
      setPastPapers(response.data.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load past papers');
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async (courseId?: string) => {
    try {
      const response = await getSubjects(courseId);
      setSubjects(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to load subjects:', err);
    }
  };

  const handleOpenModal = (paper?: PastPaper) => {
    if (paper) {
      setEditingPaper(paper);
      setFormData(paper);
    } else {
      setEditingPaper(null);
      setFormData({
        subject_id: subjectId || '',
        exam_set_id: examSetId || '',
        paper_number: 1,
        paper_level: 1,
        paper_type: 'main',
        is_free: false,
        is_published: true,
        order_index: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPaper(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const dataToSubmit = {
        ...formData,
        subject_id: formData.subject_id || subjectId,
        exam_set_id: formData.exam_set_id || examSetId,
      };

      if (editingPaper) {
        await updatePastPaper(editingPaper.id, dataToSubmit);
      } else {
        const id = `paper_${Date.now()}`;
        await createPastPaper({ ...dataToSubmit, id });
      }
      handleCloseModal();
      loadPastPapers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save past paper');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this past paper?')) return;
    try {
      await deletePastPaper(id);
      loadPastPapers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete past paper');
    }
  };

  const handleManageQuestions = (paperId: string) => {
    navigate(`/pastpapers/${paperId}/questions`);
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Past Papers {examSet && `- ${examSet.name}`}
          </h1>
          <div className="breadcrumb">
            <Link to="/">Home</Link> / 
            <Link to="/courses">Courses</Link> / 
            {examSet && (
              <>
                <Link to={`/courses/${examSet.course_id}/examsets`}>Exam Sets</Link> / 
              </>
            )}
            <span>Past Papers</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          + Add Past Paper
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        {pastPapers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <div className="empty-state-title">No past papers yet</div>
            <p>Get started by adding your first past paper</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Paper</th>
                  <th>Type</th>
                  <th>Year</th>
                  <th>Resources</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pastPapers.map((paper) => (
                  <tr key={paper.id}>
                    <td>
                      <strong>{getSubjectName(paper.subject_id)}</strong>
                    </td>
                    <td>
                      Paper {paper.paper_number} - Level {paper.paper_level}
                    </td>
                    <td>
                      <span className="badge badge-secondary">
                        {paper.paper_type}
                      </span>
                    </td>
                    <td>{paper.year || 'N/A'}</td>
                    <td>
                      <div style={{ fontSize: '0.75rem' }}>
                        {paper.questions_data_url && <div>✅ Questions</div>}
                        {paper.question_paper_url && <div>📄 Paper PDF</div>}
                        {paper.marking_scheme_url && <div>📝 Marking</div>}
                        {paper.solution_video_url && <div>🎥 Video</div>}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${paper.is_free ? 'badge-success' : 'badge-warning'}`}>
                        {paper.is_free ? 'Free' : 'Paid'}
                      </span>
                      <span className={`badge ${paper.is_published ? 'badge-success' : 'badge-warning'}`}>
                        {paper.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>{formatDate(paper.created_at)}</td>
                    <td>
                      <div className="actions">
                        <button 
                          className="btn btn-secondary action-btn" 
                          onClick={() => handleOpenModal(paper)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-primary action-btn" 
                          onClick={() => handleManageQuestions(paper.id)}
                        >
                          Questions
                        </button>
                        <button 
                          className="btn btn-danger action-btn" 
                          onClick={() => handleDelete(paper.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPaper ? 'Edit Past Paper' : 'Add Past Paper'}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" form="paper-form" className="btn btn-primary">
              {editingPaper ? 'Update' : 'Create'}
            </button>
          </>
        }
      >
        <form id="paper-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Subject *</label>
            <select
              className="form-select"
              value={formData.subject_id || ''}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              required
              disabled={!!subjectId}
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Paper Number</label>
              <input
                type="number"
                className="form-input"
                value={formData.paper_number || 1}
                onChange={(e) => setFormData({ ...formData, paper_number: Number(e.target.value) })}
                min="1"
                max="10"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Paper Level</label>
              <input
                type="number"
                className="form-input"
                value={formData.paper_level || 1}
                onChange={(e) => setFormData({ ...formData, paper_level: Number(e.target.value) })}
                min="1"
                max="5"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Paper Type</label>
              <select
                className="form-select"
                value={formData.paper_type || 'main'}
                onChange={(e) => setFormData({ ...formData, paper_type: e.target.value })}
              >
                <option value="main">Main</option>
                <option value="supplementary">Supplementary</option>
                <option value="alternative">Alternative</option>
                <option value="practical">Practical</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Year</label>
              <input
                type="number"
                className="form-input"
                value={formData.year || ''}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                min="2000"
                max="2030"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Questions Data URL</label>
            <input
              type="url"
              className="form-input"
              value={formData.questions_data_url || ''}
              onChange={(e) => setFormData({ ...formData, questions_data_url: e.target.value })}
              placeholder="https://example.com/questions.json"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Question Paper PDF URL</label>
            <input
              type="url"
              className="form-input"
              value={formData.question_paper_url || ''}
              onChange={(e) => setFormData({ ...formData, question_paper_url: e.target.value })}
              placeholder="https://example.com/paper.pdf"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Marking Scheme URL</label>
            <input
              type="url"
              className="form-input"
              value={formData.marking_scheme_url || ''}
              onChange={(e) => setFormData({ ...formData, marking_scheme_url: e.target.value })}
              placeholder="https://example.com/marking-scheme.pdf"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Solution Video URL</label>
            <input
              type="url"
              className="form-input"
              value={formData.solution_video_url || ''}
              onChange={(e) => setFormData({ ...formData, solution_video_url: e.target.value })}
              placeholder="https://example.com/solution-video.mp4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={formData.is_free || false}
                  onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                />
                <span>Free Access</span>
              </label>
            </div>

            <div className="form-group">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={formData.is_published || false}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                />
                <span>Published</span>
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
