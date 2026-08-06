// ─── Question type definitions for the practice module ───────────────────────

export type QuestionType = "standard" | "DT" | "XT" | "passage";

export interface WordChoice {
  key: string;   // "A", "B", "C", ...
  text: string;  // "过滤"
}

export interface ApiQuestion {
  id: string;
  code: string;
  difficulty: "easy" | "medium" | "hard";
  content_en: { question?: string; choices?: Record<string, string>; [key: string]: unknown };
  content_zh: { question?: string; choices?: Record<string, string>; [key: string]: unknown };
  image_url: string | null;
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
  passage?: string;   // hoisted for passage type
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
