import { apiClient } from '../config/api';
import { Topic, TopicFormData } from '../models/Topic';

export const topicsApi = {
  // Get all topics for a subject
  getAll: async (subjectId?: string) => {
    const params = subjectId ? { subject_id: subjectId } : {};
    const response = await apiClient.get<{ data: Topic[] }>('/topics', { params });
    return response.data;
  },

  // Get topic by ID
  getById: async (id: string) => {
    const response = await apiClient.get<{ data: Topic }>(`/topics/${id}`);
    return response.data;
  },

  // Create or update topic
  save: async (data: TopicFormData) => {
    const payload = {
      ...data,
      free_topic: data.free_topic ? 1 : 0,
      is_published: data.is_published ? 1 : 0
    };
    const response = await apiClient.post<{ data: Topic }>('/topics', payload);
    return response.data;
  },

  // Delete topic
  delete: async (id: string) => {
    const response = await apiClient.delete(`/topics/${id}`);
    return response.data;
  }
};
