export type Difficulty = "easy" | "medium" | "hard";

export interface SavedQuestion {
  question_id: string;
  code: string;
  difficulty: Difficulty;
  question_type: string;
  subject_name: string | null;
  subject_code: string | null;
  topic_name: string | null;
  question_text: string;
  session_id: string | null;
  session_name: string | null;
  created_at: string;
}

export interface SavedQuestionDetail extends SavedQuestion {
  content_en: { question?: string | Record<string, string>; options?: Record<string, string>; choices?: Record<string, string> };
  content_zh: { question?: string | Record<string, string>; options?: Record<string, string>; choices?: Record<string, string> };
  choices: { key: string; text: string }[] | null;
  answer: string;
  explanation_en: string;
  explanation_zh: string;
  image_url: string | null;
}
