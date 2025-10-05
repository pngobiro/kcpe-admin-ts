export interface Quiz {
  id: string;
  topic_id?: string;
  lesson_id?: string;
  name: string;
  description?: string;
  quiz_instructions?: string;
  time_limit_minutes?: number;
  passing_score?: number;
  order_index: number;
  is_published: number;
  created_at?: string;
  updated_at?: string;
}

export interface QuizQuestion {
  id: number;
  quiz_id: string;
  question_text: string;
  question_type: string;
  correct_answer?: string;
  explanation?: string;
  marks: number;
  number: number;
  order_index: number;
  is_published: number;
  created_at?: string;
  updated_at?: string;
  options?: QuizOption[];
}

export interface QuizOption {
  id: number;
  quiz_question_id: number;
  option_letter: string;
  option_text: string;
  is_correct: number;
  order_index: number;
  created_at?: string;
}
