import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../api';
import type { Course } from '../types';
import Modal from '../components/Modal';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<Partial<Course>>({
    name: '',
    description: '',
    level: 'KCPE',
    country: 'Kenya',
    is_free: 0,
    is_published: 1,
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await getCourses();
      setCourses(response.data.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData(course);
    } else {
      setEditingCourse(null);
      setFormData({
        name: '',
        description: '',
        level: 'KCPE',
        country: 'Kenya',
        is_free: 0,
        is_published: 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, formData);
      } else {
        const id = `course_${Date.now()}`;
        await createCourse({ ...formData, id });
      }
      handleCloseModal();
      loadCourses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save course');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourse(id);
      loadCourses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete course');
    }
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
          <h1 className="page-title">Courses</h1>
          <div className="breadcrumb">Home / Courses</div>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          + Add Course
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        {courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <div className="empty-state-title">No courses yet</div>
            <p>Get started by adding your first course</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Level</th>
                  <th>Country</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <strong>{course.name}</strong>
                      {course.description && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {course.description}
                        </div>
                      )}
                    </td>
                    <td>{course.level}</td>
                    <td>{course.country}</td>
                    <td>
                      <span className={`badge ${course.is_published ? 'badge-success' : 'badge-warning'}`}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <Link to={`/courses/${course.id}/subjects`} className="btn btn-secondary action-btn">
                          Subjects
                        </Link>
                        <Link to={`/courses/${course.id}/examsets`} className="btn btn-secondary action-btn">
                          Exam Sets
                        </Link>
                        <button className="btn btn-secondary action-btn" onClick={() => handleOpenModal(course)}>
                          Edit
                        </button>
                        <button className="btn btn-danger action-btn" onClick={() => handleDelete(course.id)}>
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
        title={editingCourse ? 'Edit Course' : 'Add Course'}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" form="course-form" className="btn btn-primary">
              {editingCourse ? 'Update' : 'Create'}
            </button>
          </>
        }
      >
        <form id="course-form" onSubmit={handleSubmit}>
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
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Level</label>
            <input
              type="text"
              className="form-input"
              value={formData.level || ''}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Country</label>
            <input
              type="text"
              className="form-input"
              value={formData.country || ''}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={formData.is_free === 1}
                onChange={(e) => setFormData({ ...formData, is_free: e.target.checked ? 1 : 0 })}
              />
              <span>Free Course</span>
            </label>
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
