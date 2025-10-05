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
