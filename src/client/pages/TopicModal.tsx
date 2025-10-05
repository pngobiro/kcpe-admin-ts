import React, { useState, useEffect } from 'react';
import { Topic, TopicFormData, Subject } from '../types';

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TopicFormData) => Promise<void>;
  topic: Topic | null;
  subjects: Subject[];
  defaultSubjectId?: string;
}

const TopicModal: React.FC<TopicModalProps> = ({
  isOpen,
  onClose,
  onSave,
  topic,
  subjects,
  defaultSubjectId
}) => {
  const [formData, setFormData] = useState<TopicFormData>({
    name: '',
    subject_id: defaultSubjectId || '',
    free_topic: false,
    summary_pdf: '',
    quiz_pdf: '',
    topic_url: '',
    order_index: 0,
    is_published: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (topic) {
      setFormData({
        name: topic.name,
        subject_id: topic.subject_id,
        free_topic: Boolean(topic.free_topic),
        summary_pdf: topic.summary_pdf || '',
        quiz_pdf: topic.quiz_pdf || '',
        topic_url: topic.topic_url || '',
        order_index: topic.order_index,
        is_published: Boolean(topic.is_published)
      });
    } else {
      setFormData({
        name: '',
        subject_id: defaultSubjectId || '',
        free_topic: false,
        summary_pdf: '',
        quiz_pdf: '',
        topic_url: '',
        order_index: 0,
        is_published: true
      });
    }
    setError(null);
  }, [topic, isOpen, defaultSubjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {topic ? 'Edit Topic' : 'Add New Topic'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Introduction to Algebra"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <select
                  required
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select Subject --</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic URL
                </label>
                <input
                  type="url"
                  value={formData.topic_url}
                  onChange={(e) => setFormData({ ...formData, topic_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/topic-content"
                />
                {formData.topic_url && (
                  <div className="mt-1">
                    <a 
                      href={formData.topic_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Preview URL →
                    </a>
                  </div>
                )}
              </div>

              {/* Summary PDF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary PDF URL
                </label>
                <input
                  type="url"
                  value={formData.summary_pdf}
                  onChange={(e) => setFormData({ ...formData, summary_pdf: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/summary.pdf"
                />
                {formData.summary_pdf && (
                  <div className="mt-1">
                    <a 
                      href={formData.summary_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Preview PDF →
                    </a>
                  </div>
                )}
              </div>

              {/* Quiz PDF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quiz PDF URL
                </label>
                <input
                  type="url"
                  value={formData.quiz_pdf}
                  onChange={(e) => setFormData({ ...formData, quiz_pdf: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/quiz.pdf"
                />
                {formData.quiz_pdf && (
                  <div className="mt-1">
                    <a 
                      href={formData.quiz_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Preview PDF →
                    </a>
                  </div>
                )}
              </div>

              {/* Order Index */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Index
                </label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.free_topic}
                    onChange={(e) => setFormData({ ...formData, free_topic: e.target.checked })}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Free Topic</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Published</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Topic'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TopicModal;
