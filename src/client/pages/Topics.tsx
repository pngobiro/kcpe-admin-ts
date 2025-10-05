import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getSubjects, getTopics, createTopic, updateTopic, deleteTopic } from '../api';
import { Topic, TopicFormData, Subject } from '../types';
import TopicModal from './TopicModal';

const Topics: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { courseId, subjectId: paramSubjectId } = useParams<{ courseId: string; subjectId: string }>();
  const navigate = useNavigate();
  const subjectId = paramSubjectId || searchParams.get('subject_id');
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectId || '');
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlFormData, setUrlFormData] = useState({ topicId: '', url: '' });

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (subjectId) {
      setSelectedSubject(subjectId);
    }
  }, [subjectId]);

  useEffect(() => {
    if (selectedSubject) {
      fetchTopics();
      // Find and set the current subject for breadcrumb
      const subject = subjects.find(s => s.id === selectedSubject);
      setCurrentSubject(subject || null);
    }
  }, [selectedSubject, subjects]);

  const fetchSubjects = async () => {
    try {
      const response = await getSubjects();
      setSubjects(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await getTopics(selectedSubject);
      setTopics(response.data.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch topics');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTopic(null);
    setIsModalOpen(true);
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;

    try {
      await deleteTopic(id);
      fetchTopics();
    } catch (err: any) {
      alert('Failed to delete topic: ' + err.message);
    }
  };

  const handleSave = async (data: TopicFormData) => {
    try {
      if (editingTopic) {
        await updateTopic(editingTopic.id, data);
      } else {
        await createTopic(data);
      }
      setIsModalOpen(false);
      fetchTopics();
    } catch (err: any) {
      throw new Error('Failed to save topic: ' + err.message);
    }
  };

  const handleEditUrl = (topic: Topic) => {
    setUrlFormData({ topicId: topic.id, url: topic.topic_url || '' });
    setIsUrlModalOpen(true);
  };

  const handleSaveUrl = async () => {
    try {
      const topic = topics.find(t => t.id === urlFormData.topicId);
      if (!topic) return;

      const updateData: TopicFormData = {
        name: topic.name,
        subject_id: topic.subject_id,
        free_topic: Boolean(topic.free_topic),
        summary_pdf: topic.summary_pdf || '',
        quiz_pdf: topic.quiz_pdf || '',
        topic_url: urlFormData.url,
        order_index: topic.order_index,
        is_published: Boolean(topic.is_published)
      };

      await updateTopic(topic.id, updateData);
      setIsUrlModalOpen(false);
      setUrlFormData({ topicId: '', url: '' });
      fetchTopics();
    } catch (err: any) {
      alert('Failed to update URL: ' + err.message);
    }
  };

  const handleCancelUrl = () => {
    setIsUrlModalOpen(false);
    setUrlFormData({ topicId: '', url: '' });
  };

  if (loading && !topics.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading topics...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      {currentSubject && courseId && (
        <nav className="mb-4 text-sm text-gray-600">
          <span>Courses</span>
          <span className="mx-2">/</span>
          <span>{courseId}</span>
          <span className="mx-2">/</span>
          <span>Subjects</span>
          <span className="mx-2">/</span>
          <span>{currentSubject.name}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Topics</span>
        </nav>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Topics {currentSubject && `- ${currentSubject.name}`}
          </h1>
          {currentSubject && (
            <div className="text-sm text-gray-600 mt-1">
              <span>Course: {currentSubject.course_id}</span>
            </div>
          )}
          <p className="text-gray-600 mt-1">Manage course topics and their content</p>
        </div>
        <button
          onClick={handleAdd}
          disabled={!selectedSubject}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          + Add Topic
        </button>
      </div>

      {/* Subject Filter - only show if no specific subject in route */}
      {!paramSubjectId && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Select a Subject --</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.course_id})
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {!selectedSubject ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
          Please select a subject to view topics.
        </div>
      ) : (
        <>
          {/* Topics Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Free
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topics.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No topics found. Create your first topic!
                    </td>
                  </tr>
                ) : (
                  topics.map((topic) => (
                    <tr key={topic.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{topic.name}</div>
                        <div className="text-xs mt-1 flex items-center space-x-2">
                          {topic.topic_url ? (
                            <a 
                              href={topic.topic_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline truncate max-w-xs"
                              title={topic.topic_url}
                            >
                              {topic.topic_url}
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">No URL set</span>
                          )}
                          <button
                            onClick={() => handleEditUrl(topic)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium ml-2"
                            title="Edit URL"
                          >
                            Edit URL
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          topic.free_topic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {topic.free_topic ? 'Free' : 'Paid'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {topic.order_index}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          topic.is_published ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {topic.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/topics/${topic.id}/quizzes`)}
                          className="text-purple-600 hover:text-purple-900 mr-3"
                        >
                          Quizzes
                        </button>
                        <button
                          onClick={() => handleEdit(topic)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(topic.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Topic Modal */}
      <TopicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        topic={editingTopic}
        subjects={subjects}
        defaultSubjectId={selectedSubject}
      />

      {/* URL Edit Modal */}
      {isUrlModalOpen && createPortal(
        <>
          <style>{`
            @keyframes modalSlideIn {
              from { 
                opacity: 0; 
                transform: scale(0.95) translateY(-10px); 
              }
              to { 
                opacity: 1; 
                transform: scale(1) translateY(0); 
              }
            }
            @keyframes modalBackdropIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
          <div 
            className="modal-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              zIndex: 10000,
              backdropFilter: 'blur(4px)',
              animation: 'modalBackdropIn 0.2s ease-out'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCancelUrl();
              }
            }}
          >
            <div 
              className="modal-content"
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                animation: 'modalSlideIn 0.2s ease-out'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: '2rem 2rem 0 2rem',
                borderBottom: '1px solid #e5e7eb',
                position: 'relative'
              }}>
                <button
                  onClick={handleCancelUrl}
                  style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    background: '#f3f4f6',
                    border: 'none',
                    fontSize: '1.25rem',
                    color: '#6b7280',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2rem',
                    height: '2rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.backgroundColor = '#e5e7eb';
                    target.style.color = '#374151';
                  }}
                  onMouseOut={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.backgroundColor = '#f3f4f6';
                    target.style.color = '#6b7280';
                  }}
                >
                  ✕
                </button>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    backgroundColor: '#dbeafe',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    fontSize: '1.5rem'
                  }}>
                    🔗
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: '1.75rem',
                      fontWeight: 'bold',
                      color: '#111827',
                      margin: '0'
                    }}>
                      {urlFormData.url ? 'Edit Topic URL' : 'Add Topic URL'}
                    </h2>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginTop: '0.25rem'
                    }}>
                      Topic: <span style={{ fontWeight: '600', color: '#374151' }}>
                        {topics.find(t => t.id === urlFormData.topicId)?.name || 'Unknown Topic'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.75rem'
                  }}>
                    Topic URL *
                  </label>
                  <input
                    type="url"
                    value={urlFormData.url}
                    onChange={(e) => setUrlFormData({ ...urlFormData, url: e.target.value })}
                    placeholder="https://example.com/topic-content"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.style.borderColor = '#3b82f6';
                      target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.style.borderColor = '#e5e7eb';
                      target.style.boxShadow = 'none';
                    }}
                  />
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginTop: '0.75rem',
                    lineHeight: '1.5'
                  }}>
                    {urlFormData.url ? 
                      '✏️ Update the URL where students can access this topic\'s content' : 
                      '📝 Enter the URL where students can access this topic\'s content'
                    }
                  </p>
                  
                  {urlFormData.url && (
                    <div style={{ 
                      marginTop: '1rem',
                      padding: '0.75rem',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '8px',
                      border: '1px solid #e0f2fe'
                    }}>
                      <a 
                        href={urlFormData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.875rem',
                          color: '#0369a1',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontWeight: '500'
                        }}
                        onMouseOver={(e) => {
                          const target = e.target as HTMLAnchorElement;
                          target.style.textDecoration = 'underline';
                        }}
                        onMouseOut={(e) => {
                          const target = e.target as HTMLAnchorElement;
                          target.style.textDecoration = 'none';
                        }}
                      >
                        � Preview URL
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '1.5rem 2rem 2rem',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem'
              }}>
                <button
                  type="button"
                  onClick={handleCancelUrl}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    background: 'white',
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.backgroundColor = '#f9fafb';
                    target.style.borderColor = '#d1d5db';
                  }}
                  onMouseOut={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.backgroundColor = 'white';
                    target.style.borderColor = '#e5e7eb';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUrl}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.transform = 'translateY(-1px)';
                    target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    const target = e.target as HTMLButtonElement;
                    target.style.transform = 'translateY(0)';
                    target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  {urlFormData.url ? '💾 Update URL' : '➕ Add URL'}
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default Topics;
