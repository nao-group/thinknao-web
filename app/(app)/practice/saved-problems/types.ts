export type Difficulty = "easy" | "medium" | "hard";

export interface SavedQuestion {
  question_id: string;
  code: string;
  difficulty: Difficulty;
  question_type: string;
  subject_name: string | null;
  subject_code: string | null;
  topic_name: string | null;
  /** Raw markdown + LaTeX source — render with MarkdownLatexText. */
  question_text: string;
  /** Server-flattened readable text for compact rows/suggestions, and what the
   *  server matches search against. See to_plain_text in services/bookmarks.py. */
  question_text_plain: string;
  session_id: string | null;
  session_name: string | null;
  created_at: string;
}

/**
 * The bookmarks endpoint returns question content straight from the DB, unlike
 * the sessions endpoint which passes it through build_content() first. In the
 * raw shape the A/B/C/D choice map lives under `answer` (a confusing name — it
 * is the options, not the correct one); `options`/`choices` only appear on
 * content that has been through that transform. Read all three.
 */
export interface QuestionContent {
  question?: string | Record<string, string>;
  answer?: Record<string, string>;
  options?: Record<string, string>;
  choices?: Record<string, string>;
}

export interface AnswerState {
  selected_key: string;
  correct: boolean;
}

export interface SavedQuestionDetail extends SavedQuestion {
  content_en: QuestionContent;
  content_zh: QuestionContent;
  choices: { key: string; text: string }[] | null;
  answer: string;
  explanation_en: string;
  explanation_zh: string;
  image_url: string | null;
  /** Present when the student already answered this in the session it was saved from. */
  answer_state: AnswerState | null;
}
