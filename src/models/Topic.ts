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
