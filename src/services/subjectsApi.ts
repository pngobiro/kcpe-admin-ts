import { apiClient } from '../config/api';
import { Subject } from '../client/types';

export const subjectsApi = {
  // Get all subjects for a course
  getAll: async (courseId?: string) => {
    const params = courseId ? { course_id: courseId } : {};
    const response = await apiClient.get<{ data: Subject[] }>('/subjects', { params });
    return response.data;
  },

  // Get subject by ID
  getById: async (id: string) => {
    const response = await apiClient.get<{ data: Subject }>(`/subjects/${id}`);
    return response.data;
  },

  // Create or update subject
  save: async (data: Partial<Subject>) => {
    const payload = {
      ...data,
      is_free: data.is_free ? 1 : 0,
      is_published: data.is_published ? 1 : 0
    };
    
    if (data.id) {
      // Update existing subject
      const response = await apiClient.post<{ data: Subject }>('/subjects', payload);
      return response.data;
    } else {
      // Create new subject
      const response = await apiClient.post<{ data: Subject }>('/subjects', payload);
      return response.data;
    }
  },

  // Delete subject
  delete: async (id: string) => {
    const response = await apiClient.delete(`/subjects/${id}`);
    return response.data;
  }
};
