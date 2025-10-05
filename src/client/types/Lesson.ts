export interface Lesson {
  id: string;
  topic_id: string;
  name: string;
  description?: string;
  lesson_summary?: string;
  lesson_video_url?: string;
  assignment_url?: string;
  free_lesson: number;
  order_index: number;
  is_published: number;
  created_at?: string;
  updated_at?: string;
}
