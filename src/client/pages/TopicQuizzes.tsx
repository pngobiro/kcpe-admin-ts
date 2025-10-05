import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getQuizzes, getTopics, createQuiz, updateQuiz, deleteQuiz } from '../api';
import { Topic as TopicType } from '../types';

interface Quiz {
  id: string;
  name: string;
  topic_id: string;
  order_index: number;
  quiz_type: string;
  quiz_data_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  question_count?: number;
}

interface QuizFormData {
  name: string;
  quiz_type: string;
  quiz_data_url: string;
  order_index: number;
  is_published: boolean;
}

const TopicQuizzes: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [topic, setTopic] = useState<TopicType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [formData, setFormData] = useState<QuizFormData>({
    name: '',
    quiz_type: 'multiple_choice',
    quiz_data_url: '',
    order_index: 1,
    is_published: false
  });

  useEffect(() => {
    if (topicId) {
      fetchQuizzes();
      fetchTopic();
    }
  }, [topicId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await getQuizzes({ topic_id: topicId });
      setQuizzes(response.data.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quizzes');
      console.error('Error fetching quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopic = async () => {
    try {
      // Get all topics and find the current one
      const response = await getTopics();
      const allTopics = response.data.data || [];
      const currentTopic = allTopics.find((t: TopicType) => t.id === topicId);
      setTopic(currentTopic || null);
    } catch (err: any) {
      console.error('Error fetching topic:', err);
    }
  };

  const handleTogglePublished = async (quiz: Quiz) => {
    alert(`Toggle publish status for quiz: ${quiz.name}\nCurrent status: ${quiz.is_published ? 'Published' : 'Draft'}\n\nUpdate API endpoint needed to implement this feature.`);
  };

  const handleDelete = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    alert(`Delete quiz: ${quizId}\n\nDelete API endpoint needed to implement this feature.`);
  };

  const handleAddQuiz = () => {
    // Set the next order index
    const nextOrderIndex = quizzes.length > 0 ? Math.max(...quizzes.map(q => q.order_index)) + 1 : 1;
    setFormData({
      name: '',
      quiz_type: 'multiple_choice',
      quiz_data_url: '',
      order_index: nextOrderIndex,
      is_published: false
    });
    setIsEditMode(false);
    setEditingQuizId(null);
    setIsModalOpen(true);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setFormData({
      name: quiz.name,
      quiz_type: quiz.quiz_type,
      quiz_data_url: quiz.quiz_data_url || '',
      order_index: quiz.order_index,
      is_published: quiz.is_published
    });
    setIsEditMode(true);
    setEditingQuizId(quiz.id);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      quiz_type: 'multiple_choice',
      quiz_data_url: '',
      order_index: 1,
      is_published: false
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingQuizId(null);
    resetForm();
  };

  const handleSaveQuiz = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a quiz name');
      return;
    }

    try {
      if (isEditMode && editingQuizId) {
        // Edit existing quiz
        const quizData = {
          ...formData,
          topic_id: topicId,
          id: editingQuizId
        };

        console.log('Updating quiz:', quizData);
        const response = await updateQuiz(editingQuizId, quizData);
        
        if (response.data.success) {
          // Update local state with the updated quiz
          setQuizzes(quizzes.map(quiz => 
            quiz.id === editingQuizId 
              ? { 
                  ...quiz, 
                  ...formData, 
                  updated_at: new Date().toISOString() 
                }
              : quiz
          ));
          
          setIsModalOpen(false);
          setIsEditMode(false);
          setEditingQuizId(null);
          resetForm();
          alert('Quiz updated successfully!');
        } else {
          alert('Failed to update quiz: ' + (response.data.error || 'Unknown error'));
        }
      } else {
        // Create new quiz
        const quizData = {
          ...formData,
          topic_id: topicId
        };

        console.log('Creating quiz:', quizData);
        const response = await createQuiz(quizData);
        
        if (response.data.success) {
          // Add the new quiz to local state
          const newQuiz: Quiz = {
            ...response.data.data,
            question_count: 0
          };
          
          setQuizzes([...quizzes, newQuiz]);
          setIsModalOpen(false);
          resetForm();
          alert('Quiz created successfully!');
        } else {
          alert('Failed to create quiz: ' + (response.data.error || 'Unknown error'));
        }
      }
    } catch (error: any) {
      console.error('Error saving quiz:', error);
      alert('Error saving quiz: ' + (error.response?.data?.error || error.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
          <div className="text-xl font-semibold text-gray-700">Loading quizzes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center space-x-2 text-sm">
          <button 
            onClick={() => navigate(-1)}
            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full font-medium hover:bg-gray-200 transition-colors"
          >
            ← Back to Topics
          </button>
          <span className="text-gray-400">→</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-semibold">❓ Quizzes</span>
        </nav>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-2xl">
                <span className="text-3xl">❓</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Topic Quizzes
                </h1>
                {topic && (
                  <div className="flex items-center space-x-3 mt-3">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
                      📖 Topic: {topic.name}
                    </span>
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
                      📊 {quizzes.length} Quiz{quizzes.length !== 1 ? 'es' : ''}
                    </span>
                  </div>
                )}
                <p className="text-gray-600 mt-2 flex items-center">
                  <span className="mr-2">✨</span>
                  Manage quizzes and assessments for this topic
                </p>
              </div>
            </div>
            <button 
              className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              onClick={handleAddQuiz}
            >
              <span className="flex items-center space-x-2">
                <span className="text-lg">➕</span>
                <span>Add Quiz</span>
              </span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-center space-x-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold">Error</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Quizzes Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-purple-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
              <span>📋</span>
              <span>Quizzes Overview</span>
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <span className="flex items-center space-x-1">
                      <span>❓</span>
                      <span>Quiz Name</span>
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
                      <span>📝</span>
                      <span>Type</span>
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <span className="flex items-center space-x-1">
                      <span>🔗</span>
                      <span>Data URL</span>
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
                {quizzes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="bg-gray-100 p-6 rounded-full">
                          <span className="text-4xl">❓</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-700">No quizzes found</h3>
                          <p className="text-gray-500 mt-1">Create your first quiz for this topic!</p>
                        </div>
                        <button
                          onClick={handleAddQuiz}
                          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          ➕ Create First Quiz
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  quizzes.map((quiz, index) => (
                    <tr key={quiz.id} className={`hover:bg-gradient-to-r hover:from-purple-25 hover:to-pink-25 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-gray-25' : 'bg-white'
                    }`}>
                      <td className="px-6 py-5">
                        <div className="flex items-start space-x-3">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg flex-shrink-0">
                            <span className="text-white text-sm font-bold">#{quiz.order_index}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-lg font-semibold text-gray-900 mb-1">{quiz.name}</div>
                            <div className="text-sm text-gray-500">
                              Created: {new Date(quiz.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-full shadow-lg">
                          {quiz.order_index}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200 capitalize">
                          {quiz.quiz_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {quiz.quiz_data_url ? (
                          <a 
                            href={quiz.quiz_data_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors border border-green-200"
                          >
                            <span>🔗</span>
                            <span className="font-medium">View Data</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-200">
                            <span>🚫</span>
                            <span>No URL</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center space-x-2 px-4 py-2 text-sm font-bold rounded-full shadow-sm border-2 ${
                            quiz.is_published 
                              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-300' 
                              : 'bg-gradient-to-r from-red-400 to-pink-500 text-white border-red-300'
                          }`}>
                            <span>{quiz.is_published ? '✅' : '⏸️'}</span>
                            <span>{quiz.is_published ? 'Published' : 'Draft'}</span>
                          </span>
                          
                          {/* Toggle Switch */}
                          <button
                            onClick={() => handleTogglePublished(quiz)}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-lg ${
                              quiz.is_published 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 focus:ring-green-300' 
                                : 'bg-gradient-to-r from-gray-400 to-gray-500 focus:ring-gray-300'
                            }`}
                            title={quiz.is_published ? 'Click to unpublish' : 'Click to publish'}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                                quiz.is_published ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/quizzes/${quiz.id}/questions`)}
                            className="inline-flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                          >
                            <span>📝</span>
                            <span>Questions</span>
                          </button>
                          <button
                            onClick={() => handleEditQuiz(quiz)}
                            className="inline-flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
                          >
                            <span>✏️</span>
                            <span className="font-medium">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(quiz.id)}
                            className="inline-flex items-center space-x-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
                          >
                            <span>🗑️</span>
                            <span className="font-medium">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Quiz Modal */}
        {isModalOpen && createPortal(
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
                  handleCloseModal();
                }
              }}
            >
              <div 
                className="modal-content"
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  maxWidth: '600px',
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
                    onClick={handleCloseModal}
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
                      backgroundColor: '#ddd6fe',
                      borderRadius: '12px',
                      padding: '0.75rem',
                      fontSize: '1.5rem'
                    }}>
                      ❓
                    </div>
                    <div>
                      <h2 style={{
                        fontSize: '1.75rem',
                        fontWeight: 'bold',
                        color: '#111827',
                        margin: '0'
                      }}>
                        {isEditMode ? 'Edit Quiz' : 'Add New Quiz'}
                      </h2>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        marginTop: '0.25rem'
                      }}>
                        {isEditMode ? 'Update quiz details' : 'Create a new quiz'} for: <span style={{ fontWeight: '600', color: '#374151' }}>
                          {topic?.name || 'This Topic'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '2rem' }}>
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* Quiz Name */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.75rem'
                      }}>
                        Quiz Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter quiz name..."
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
                          target.style.borderColor = '#8b5cf6';
                          target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.style.borderColor = '#e5e7eb';
                          target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Quiz Type */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.75rem'
                      }}>
                        Quiz Type
                      </label>
                      <select
                        value={formData.quiz_type}
                        onChange={(e) => setFormData({ ...formData, quiz_type: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '1rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          outline: 'none',
                          transition: 'all 0.2s',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                          backgroundColor: 'white'
                        }}
                        onFocus={(e) => {
                          const target = e.target as HTMLSelectElement;
                          target.style.borderColor = '#8b5cf6';
                          target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          const target = e.target as HTMLSelectElement;
                          target.style.borderColor = '#e5e7eb';
                          target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="fill_in_blank">Fill in the Blank</option>
                        <option value="essay">Essay</option>
                        <option value="mixed">Mixed Questions</option>
                      </select>
                    </div>

                    {/* Quiz Data URL */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.75rem'
                      }}>
                        Quiz Data URL
                      </label>
                      <input
                        type="url"
                        value={formData.quiz_data_url}
                        onChange={(e) => setFormData({ ...formData, quiz_data_url: e.target.value })}
                        placeholder="https://example.com/quiz-data..."
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
                          target.style.borderColor = '#8b5cf6';
                          target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
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
                        marginTop: '0.5rem'
                      }}>
                        URL where quiz questions and answers are stored
                      </p>
                    </div>

                    {/* Order Index */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.75rem'
                      }}>
                        Order Index
                      </label>
                      <input
                        type="number"
                        value={formData.order_index}
                        onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })}
                        min="1"
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
                          target.style.borderColor = '#8b5cf6';
                          target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.style.borderColor = '#e5e7eb';
                          target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Published Status */}
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.is_published}
                          onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                          style={{
                            width: '1.25rem',
                            height: '1.25rem',
                            accentColor: '#8b5cf6',
                            cursor: 'pointer'
                          }}
                        />
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          Publish quiz immediately
                        </span>
                      </label>
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginTop: '0.5rem',
                        marginLeft: '2rem'
                      }}>
                        Published quizzes are visible to students
                      </p>
                    </div>
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
                    onClick={handleCloseModal}
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
                    onClick={handleSaveQuiz}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: 'none',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.transform = 'translateY(-1px)';
                      target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.transform = 'translateY(0)';
                      target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                    }}
                  >
                    {isEditMode ? '💾 Update Quiz' : '➕ Create Quiz'}
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
      </div>
    </div>
  );
};

export default TopicQuizzes;
