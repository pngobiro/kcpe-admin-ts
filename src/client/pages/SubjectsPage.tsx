import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSubjects, createSubject, updateSubject, deleteSubject, getCourse } from '../api';
import type { Subject, Course } from '../types';
import Modal from '../components/Modal';

export default function SubjectsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<Partial<Subject>>({
    name: '',
    course_id: courseId,
    is_free: 0,
    is_published: 1,
  });

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [courseRes, subjectsRes] = await Promise.all([
        getCourse(courseId!),
        getSubjects(courseId),
      ]);
      setCourse(courseRes.data.data || null);
      setSubjects(subjectsRes.data.data || []);
    } catch (err) {
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, formData);
      } else {
        const id = `subject_${Date.now()}`;
        await createSubject({ ...formData, id, course_id: courseId });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert('Failed to save subject');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Subjects - {course?.name}</h1>
          <div className="breadcrumb">
            <Link to="/courses">Courses</Link> / {course?.name} / Subjects
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Add Subject
        </button>
      </div>

      <div className="card">
        {subjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📖</div>
            <div className="empty-state-title">No subjects yet</div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.id}>
                    <td><strong>{subject.name}</strong></td>
                    <td>
                      <span className={`badge ${subject.is_published ? 'badge-success' : 'badge-warning'}`}>
                        {subject.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <Link to={`/courses/${courseId}/subjects/${subject.id}/topics`} className="btn btn-secondary action-btn">
                          Topics
                        </Link>
                        <Link to={`/subjects/${subject.id}/pastpapers`} className="btn btn-secondary action-btn">
                          Past Papers
                        </Link>
                        <button className="btn btn-secondary action-btn" onClick={() => {
                          setEditingSubject(subject);
                          setFormData(subject);
                          setIsModalOpen(true);
                        }}>
                          Edit
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
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Edit Subject' : 'Add Subject'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button form="subject-form" className="btn btn-primary">Save</button>
          </>
        }
      >
        <form id="subject-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
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
