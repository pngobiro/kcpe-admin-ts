import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const TopicQuizzes: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch quizzes for the topic
    setLoading(false);
  }, [topicId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading quizzes...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Topic Quizzes</h1>
          <p className="text-gray-600 mt-1">Manage quizzes for topic: {topicId}</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Add Quiz
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          Quiz management feature coming soon...
          <br />
          Topic ID: {topicId}
        </div>
      </div>
    </div>
  );
};

export default TopicQuizzes;
