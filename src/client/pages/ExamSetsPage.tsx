import { useState, useEffect, FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getExamSetsForCourse, getCourse, createExamSet, updateExamSet, deleteExamSet } from '../api';
import type { ExamSet, Course } from '../types';
import Modal from '../components/Modal';

export default function ExamSetsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [examSets, setExamSets] = useState<ExamSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExamSet, setEditingExamSet] = useState<ExamSet | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [formData, setFormData] = useState<Partial<ExamSet>>({
    name: '',
    description: '',
    year: new Date().getFullYear(),
    exam_type: 'Mock',
    is_published: 1,
  });

  useEffect(() => {
    if (courseId) {
      loadCourse();
      loadExamSets();
    }
  }, [courseId, selectedYear]);

  const loadCourse = async () => {
    if (!courseId) return;
    try {
      const response = await getCourse(courseId);
      setCourse(response.data.data || null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load course');
    }
  };

  const loadExamSets = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const response = await getExamSetsForCourse(courseId, selectedYear || undefined);
      setExamSets(response.data.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load exam sets');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (examSet?: ExamSet) => {
    if (examSet) {
      setEditingExamSet(examSet);
      setFormData(examSet);
    } else {
      setEditingExamSet(null);
      setFormData({
        name: '',
        description: '',
        year: new Date().getFullYear(),
        exam_type: 'Mock',
        is_published: 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExamSet(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    
    try {
      const dataToSubmit = {
        ...formData,
        course_id: courseId,
      };

      if (editingExamSet) {
        await updateExamSet(editingExamSet.id, dataToSubmit);
      } else {
        const id = `examset_${courseId}_${Date.now()}`;
        await createExamSet({ ...dataToSubmit, id });
      }
      handleCloseModal();
      loadExamSets();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save exam set');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam set?')) return;
    try {
      await deleteExamSet(id);
      loadExamSets();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete exam set');
    }
  };

  const getUniqueYears = () => {
    const years = examSets.map(es => es.year).filter(year => year !== undefined) as number[];
    return [...new Set(years)].sort((a, b) => b - a);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getExamTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'mock': return 'badge-primary';
      case 'kcpe': return 'badge-success';
      case 'cat': return 'badge-warning';
      case 'end term': return 'badge-info';
      default: return 'badge-secondary';
    }
  };

  if (loading && examSets.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!courseId) {
    return (
      <div className="error-message">
        Course ID is required
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Exam Sets {course && `- ${course.name}`}
          </h1>
          <div className="breadcrumb">
            <Link to="/">Home</Link> / 
            <Link to="/courses">Courses</Link> / 
            {course && <span>{course.name}</span>} / 
            <span>Exam Sets</span>
          </div>
        </div>
        <div className="page-actions">
          <select
            className="form-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : '')}
            style={{ marginRight: '1rem' }}
          >
            <option value="">All Years</option>
            {getUniqueYears().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            + Add Exam Set
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        {examSets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">No exam sets yet</div>
            <p>Get started by adding your first exam set for this course</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Year</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {examSets.map((examSet) => (
                  <tr key={examSet.id}>
                    <td>
                      <strong>{examSet.name}</strong>
                      {examSet.description && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {examSet.description}
                        </div>
                      )}
                    </td>
                    <td>{examSet.year || 'N/A'}</td>
                    <td>
                      <span className={`badge ${getExamTypeColor(examSet.exam_type || '')}`}>
                        {examSet.exam_type || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${examSet.is_published ? 'badge-success' : 'badge-warning'}`}>
                        {examSet.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>{formatDate(examSet.created_at)}</td>
                    <td>
                      <div className="actions">
                        <Link 
                          to={`/examsets/${examSet.id}/pastpapers`} 
                          className="btn btn-secondary action-btn"
                        >
                          Past Papers
                        </Link>
                        <button 
                          className="btn btn-secondary action-btn" 
                          onClick={() => handleOpenModal(examSet)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger action-btn" 
                          onClick={() => handleDelete(examSet.id)}
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
        title={editingExamSet ? 'Edit Exam Set' : 'Add Exam Set'}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" form="examset-form" className="btn btn-primary">
              {editingExamSet ? 'Update' : 'Create'}
            </button>
          </>
        }
      >
        <form id="examset-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Grade 10 Mock Exam 2024"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this exam set"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Year</label>
              <input
                type="number"
                className="form-input"
                value={formData.year || ''}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                min="2020"
                max="2030"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Exam Type</label>
              <select
                className="form-select"
                value={formData.exam_type || ''}
                onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
              >
                <option value="">Select Type</option>
                <option value="Mock">Mock</option>
                <option value="KCPE">KCPE</option>
                <option value="CAT">CAT</option>
                <option value="End Term">End Term</option>
                <option value="Mid Term">Mid Term</option>
                <option value="Assignment">Assignment</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={formData.is_published === 1}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked ? 1 : 0 })}
              />
              <span>Published</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
