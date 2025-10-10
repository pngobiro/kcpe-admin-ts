import axios from 'axios';
import type { Course, Subject, ExamSet, PastPaper, Question, ApiResponse, Topic, TopicFormData } from '../types';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Courses
export const getCourses = () => api.get<ApiResponse<Course[]>>('/courses');
export const getCourse = (id: string) => api.get<ApiResponse<Course>>(`/courses/${id}`);
export const createCourse = (data: Partial<Course>) => api.post<ApiResponse<Course>>('/courses', data);
export const updateCourse = (id: string, data: Partial<Course>) => api.post<ApiResponse<Course>>('/courses', { ...data, id });
export const deleteCourse = (id: string) => api.delete<ApiResponse<void>>(`/courses/${id}`);

// Subjects
export const getSubjects = (courseId?: string) => 
  api.get<ApiResponse<Subject[]>>('/subjects', { params: { course_id: courseId } });
export const getSubject = (id: string) => api.get<ApiResponse<Subject>>(`/subjects/${id}`);
export const createSubject = (data: Partial<Subject>) => api.post<ApiResponse<Subject>>('/subjects', data);
export const updateSubject = (id: string, data: Partial<Subject>) => 
  api.post<ApiResponse<Subject>>('/subjects', { ...data, id });
export const deleteSubject = (id: string) => api.delete<ApiResponse<void>>(`/subjects/${id}`);

// Exam Sets
export const getExamSets = (courseId?: string, year?: number) => 
  api.get<ApiResponse<ExamSet[]>>('/examsets', { params: { course_id: courseId, year } });
export const getExamSet = (id: string) => api.get<ApiResponse<ExamSet>>(`/examsets/${id}`);
export const getExamSetsForCourse = (courseId: string, year?: number) => 
  api.get<ApiResponse<ExamSet[]>>(`/courses/${courseId}/examsets`, { params: { year } });
export const createExamSet = (data: Partial<ExamSet>) => api.post<ApiResponse<ExamSet>>('/examsets', data);
export const updateExamSet = (id: string, data: Partial<ExamSet>) => 
  api.post<ApiResponse<ExamSet>>('/examsets', { ...data, id });
export const deleteExamSet = (id: string) => api.delete<ApiResponse<void>>(`/examsets/${id}`);

// Past Papers
export const getPastPapers = (params?: { subject_id?: string; exam_set_id?: string; year?: number }) => 
  api.get<ApiResponse<PastPaper[]>>('/pastpapers', { params });
export const getPastPaper = (id: string) => api.get<ApiResponse<PastPaper>>(`/pastpapers/${id}`);
export const createPastPaper = (data: Partial<PastPaper>) => api.post<ApiResponse<PastPaper>>('/pastpapers', data);
export const updatePastPaper = (id: string, data: Partial<PastPaper>) => 
  api.post<ApiResponse<PastPaper>>('/pastpapers', { ...data, id });
export const deletePastPaper = (id: string) => api.delete<ApiResponse<void>>(`/pastpapers/${id}`);

// Past Paper Questions API (separate from topic quizzes)
export const getPastPaperQuestions = (pastPaperId: string) => 
  api.get<ApiResponse<any>>(`/pastpapers/${pastPaperId}/questions`);

export const savePastPaperQuestions = (pastPaperId: string, questionsData: any) => 
  api.post<ApiResponse<any>>(`/pastpapers/${pastPaperId}/questions`, questionsData);

export const deletePastPaperQuestions = (pastPaperId: string) => 
  api.delete<ApiResponse<void>>(`/pastpapers/${pastPaperId}/questions`);

// Questions
export const getQuestions = (params: { exam_set_id?: string; subject_id?: string }) => 
  api.get<ApiResponse<Question[]>>('/questions', { params });
export const uploadQuestions = (filename: string, questions: Question[]) => 
  api.post<ApiResponse<void>>('/questions/upload', { filename, questions });
export const exportQuestions = (exam_set_id: string, subject_id: string) => 
  api.post<ApiResponse<Question[]>>('/questions/export', { exam_set_id, subject_id });

// Topics
export const getTopics = (subjectId?: string) => {
  const params = subjectId ? { subject_id: subjectId } : {};
  return api.get<ApiResponse<Topic[]>>('/topics', { params });
};
export const getTopic = (id: string) => api.get<ApiResponse<Topic>>(`/topics/${id}`);
export const createTopic = (data: TopicFormData) => {
  const payload = {
    ...data,
    free_topic: data.free_topic ? 1 : 0,
    is_published: data.is_published ? 1 : 0
  };
  return api.post<ApiResponse<Topic>>('/topics', payload);
};
export const updateTopic = (id: string, data: TopicFormData) => {
  const payload = {
    ...data,
    id,
    free_topic: data.free_topic ? 1 : 0,
    is_published: data.is_published ? 1 : 0
  };
  return api.post<ApiResponse<Topic>>('/topics', payload);
};
export const deleteTopic = (id: string) => api.delete<ApiResponse<void>>(`/topics/${id}`);

// Quizzes
export const getQuizzes = (params: { topic_id?: string; lesson_id?: string }) => 
  api.get<ApiResponse<any[]>>('/quizzes', { params });

export const getQuiz = (id: string) => 
  api.get<ApiResponse<any>>(`/quizzes/${id}`);

export const createQuiz = (data: any) => 
  api.post<ApiResponse<any>>('/quizzes', data);

export const updateQuiz = (id: string, data: any) => 
  api.post<ApiResponse<any>>('/quizzes', { ...data, id });

export const deleteQuiz = (id: string) => 
  api.delete<ApiResponse<void>>(`/quizzes/${id}`);

// Quiz Questions API
export const saveQuizQuestions = (quizId: string, questionsData: any) => 
  api.post<ApiResponse<any>>(`/quizzes/${quizId}/questions`, questionsData);

// Get quiz questions from API
export const getQuizQuestions = (quizId: string) => 
  api.get<ApiResponse<any>>(`/quizzes/${quizId}/questions`);

// Upload quiz data to R2 storage
export const uploadQuizData = (quizId: string, data: any) => 
  api.post<ApiResponse<any>>(`/quizzes/${quizId}/upload-data`, data);

export const deleteQuizQuestions = (quizId: string) => 
  api.delete<ApiResponse<void>>(`/quizzes/${quizId}/questions`);

// Media Upload - direct to worker to avoid proxy issues
export const uploadMedia = (file: File, description?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (description) {
    formData.append('description', description);
  }
  
  return axios.create({
    baseURL: 'https://east-africa-education-api.pngobiro.workers.dev/api',
    headers: {
      'X-API-Key': 'ea_edu_api_2025_9bf6e21f5d1a4d7da1b74ca222b89eec_secure',
    },
  }).post<ApiResponse<{ url: string; id: string }>>('/media/upload', formData);
};

export default api;
