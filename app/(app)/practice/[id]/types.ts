// ─── Question type definitions for the practice module ───────────────────────

export type QuestionType = "JF" | "DT" | "XT" | "YL" | "SH" | "BY";

export interface WordChoice {
  key: string;   // "A", "B", "C", ...
  text: string;  // "过滤"
}

export interface ApiQuestion {
  id: string;
  code: string;
  difficulty: "easy" | "medium" | "hard";
  /**
   * content_en / content_zh shapes differ by question type:
   *   YL / JF: { question: { "1": "text" }, answer: { A: "...", B: "..." } }
   *   XT:      { question: { "1": "sent1", "2": "sent2", … }, answer: { A: "word", … } }
   *   DT:      { question: "text with {1} {2} placeholders", correct_answers: { "1": "B" } }
   *   correct_answer / correct_answers are only present in mock data (not real API).
   */
  content_en: {
    question?: string | Record<string, string>;
    answer?: Record<string, string>;
    correct_answer?: string;
    [key: string]: unknown;
  };
  content_zh: {
    question?: string | Record<string, string>;
    answer?: Record<string, string>;
    correct_answer?: string;
    correct_answers?: Record<string, string>;
    explanation?: string;
    [key: string]: unknown;
  };
  image_url: string | null;
  question_number: number | null;
  question_type: QuestionType;
  group_id: string | null;
  passage: string | null;
  choices: WordChoice[] | null;   // DT/XT word bank
}

// A logical group rendered as a single navigable unit
export interface QuestionGroup {
  type: QuestionType;
  group_id: string | null;
  questions: ApiQuestion[];
  passage?: string;
}

// DT/XT answer state: questionId → { blankIndex → choiceKey }
export type FillAnswerMap = Record<string, Record<string, string>>;

// Per-blank result returned from the API after submission
export interface BlankResult {
  blank_index: string;
  correct: boolean;
  correct_answer: string;
  user_answer: string;
}

// Full result for one question after submission
export interface SubmitResult {
  question_id: string;
  correct: boolean;
  correct_answer: string;
  difficulty: string;
  xp_awarded: number;
  blank_results?: BlankResult[];
}
