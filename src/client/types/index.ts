export interface Course {
  id: string;
  name: string;
  description?: string;
  course_icon?: string;
  level?: string;
  country?: string;
  price?: number;
  currency?: string;
  is_free?: number;
  order_index?: number;
  is_published?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: string;
  course_id: string;
  name: string;
  description?: string;
  subject_icon?: string;
  subject_color?: string;
  price?: number;
  currency?: string;
  is_free?: number;
  order_index?: number;
  is_published?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Topic {
  id: string;
  name: string;
  subject_id: string;
  free_topic: number; // 0 or 1
  summary_pdf?: string;
  quiz_pdf?: string;
  topic_url?: string;
  order_index: number;
  is_published: number; // 0 or 1
  created_at?: string;
  updated_at?: string;
}

export interface TopicFormData {
  name: string;
  subject_id: string;
  free_topic: boolean;
  summary_pdf?: string;
  quiz_pdf?: string;
  topic_url?: string;
  order_index: number;
  is_published: boolean;
}

export interface ExamSet {
  id: string;
  course_id: string;
  name: string;
  description?: string;
  year?: number;
  term?: number;
  level?: string;
  exam_type?: string;
  is_published?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PastPaper {
  id: string;
  subject_id: string;
  exam_set_id: string;
  year?: number;
  paper_number?: number;
  paper_level?: number;
  paper_type?: string;
  questions_data_url?: string;
  question_paper_url?: string;
  marking_scheme_url?: string;
  solution_video_url?: string;
  is_free?: number;
  order_index?: number;
  is_published?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Question {
  id?: number;
  exam_set_id: string;
  subject_id: string;
  question_text: string;
  question_type: string;
  correct_answer?: string;
  explanation?: string;
  marks?: number;
  difficulty_level?: string;
  order_index?: number;
  is_published?: number;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id?: number;
  question_id?: number;
  option_letter: string;
  option_text: string;
  is_correct?: number;
  order_index?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}
