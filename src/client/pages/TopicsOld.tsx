import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getSubjects, getTopics, createTopic, updateTopic, deleteTopic, getQuizzes } from '../api';
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
  const [quizCounts, setQuizCounts] = useState<{ [topicId: string]: number }>({});

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
      const topicsData = response.data.data || [];
      setTopics(topicsData);
      
      // Fetch quiz counts for each topic
      await fetchQuizCounts(topicsData);
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch topics');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizCounts = async (topicsData: Topic[]) => {
    try {
      const counts: { [topicId: string]: number } = {};
      
      // Fetch quiz count for each topic
      for (const topic of topicsData) {
        try {
          const quizResponse = await getQuizzes({ topic_id: topic.id });
          counts[topic.id] = quizResponse.data.data?.length || 0;
        } catch (err) {
          counts[topic.id] = 0; // Default to 0 if failed to fetch
        }
      }
      
      setQuizCounts(counts);
    } catch (err) {
      console.error('Error fetching quiz counts:', err);
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
      fetchTopics(); // This will also refresh quiz counts
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

  const handleToggleFreeStatus = async (topic: Topic) => {
    try {
      const updateData: TopicFormData = {
        name: topic.name,
        subject_id: topic.subject_id,
        free_topic: !topic.free_topic, // Toggle the current status
        summary_pdf: topic.summary_pdf || '',
        quiz_pdf: topic.quiz_pdf || '',
        topic_url: topic.topic_url || '',
        order_index: topic.order_index,
        is_published: Boolean(topic.is_published)
      };

      await updateTopic(topic.id, updateData);
      fetchTopics(); // Refresh the topics list and quiz counts
    } catch (err: any) {
      alert('Failed to toggle free status: ' + err.message);
    }
  };

  if (loading && !topics.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading topics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        {currentSubject && courseId && (
          <nav className="mb-6 flex items-center space-x-2 text-sm">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">📚 Courses</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">{courseId}</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">📖 Subjects</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-medium">{currentSubject.name}</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-semibold">🗂️ Topics</span>
          </nav>
        )}

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl">
                <span className="text-3xl">🗂️</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Topics {currentSubject && `· ${currentSubject.name}`}
                </h1>
                {currentSubject && (
                  <div className="flex items-center space-x-3 mt-3">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
                      📚 Course: {currentSubject.course_id}
                    </span>
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
                      📊 {topics.length} Topic{topics.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                <p className="text-gray-600 mt-2 flex items-center">
                  <span className="mr-2">✨</span>
                  Manage course topics, content URLs, and quiz assignments
                </p>
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={!selectedSubject}
              className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="flex items-center space-x-2">
                <span className="text-lg">➕</span>
                <span>Add Topic</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
            </button>
          </div>
        </div>

        {/* Subject Filter - only show if no specific subject in route */}
        {!paramSubjectId && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-lg">
                <span className="text-lg">🔍</span>
              </div>
              <label className="text-lg font-semibold text-gray-800">
                Filter by Subject
              </label>
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            >
              <option value="">🔽 Select a Subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  📚 {subject.name} ({subject.course_id})
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-center space-x-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold">Error</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!selectedSubject ? (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 text-yellow-800 p-6 rounded-xl flex items-center space-x-4">
            <span className="text-3xl">📝</span>
            <div>
              <h3 className="font-semibold text-lg">Select a Subject</h3>
              <p>Please select a subject to view and manage topics.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Topics Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                  <span>📋</span>
                  <span>Topics Overview</span>
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <span className="flex items-center space-x-1">
                          <span>📖</span>
                          <span>Topic Name</span>
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <span className="flex items-center space-x-1">
                          <span>💰</span>
                          <span>Access Type</span>
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <span className="flex items-center space-x-1">
                          <span>❓</span>
                          <span>Quizzes</span>
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <span className="flex items-center space-x-1">
                          <span>📊</span>
                          <span>Order</span>
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <span className="flex items-center space-x-1">
                          <span>🌐</span>
                          <span>Status</span>
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <span className="flex items-center space-x-1">
                          <span>⚙️</span>
                          <span>Actions</span>
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {topics.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="bg-gray-100 p-6 rounded-full">
                              <span className="text-4xl">📝</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-700">No topics found</h3>
                              <p className="text-gray-500 mt-1">Create your first topic to get started!</p>
                            </div>
                            <button
                              onClick={handleAdd}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              ➕ Create First Topic
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      topics.map((topic, index) => (
                        <tr key={topic.id} className={`hover:bg-gradient-to-r hover:from-blue-25 hover:to-purple-25 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-gray-25' : 'bg-white'
                        }`}>
                          <td className="px-6 py-5">
                            <div className="flex items-start space-x-3">
                              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg flex-shrink-0">
                                <span className="text-white text-sm font-bold">#{topic.order_index}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-lg font-semibold text-gray-900 mb-1">{topic.name}</div>
                                <div className="flex items-center space-x-2 text-sm">
                                  {topic.topic_url ? (
                                    <a 
                                      href={topic.topic_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                                      title={topic.topic_url}
                                    >
                                      <span>🔗</span>
                                      <span className="font-medium">View Content</span>
                                    </a>
                                  ) : (
                                    <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-200">
                                      <span>🚫</span>
                                      <span>No URL set</span>
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleEditUrl(topic)}
                                    className="inline-flex items-center space-x-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full hover:bg-orange-100 transition-colors border border-orange-200"
                                    title="Edit URL"
                                  >
                                    <span>✏️</span>
                                    <span className="font-medium">Edit URL</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            topic.free_topic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {topic.free_topic ? 'Free' : 'Paid'}
                          </span>
                          
                          {/* Toggle Switch */}
                          <button
                            onClick={() => handleToggleFreeStatus(topic)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              topic.free_topic ? 'bg-green-600' : 'bg-gray-200'
                            }`}
                            title={topic.free_topic ? 'Click to make paid' : 'Click to make free'}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                topic.free_topic ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900 font-medium">
                            {quizCounts[topic.id] || 0}
                          </span>
                          <button
                            onClick={() => navigate(`/topics/${topic.id}/quizzes`)}
                            className="text-purple-600 hover:text-purple-900 text-xs underline"
                            title="View quizzes"
                          >
                            View
                          </button>
                        </div>
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
