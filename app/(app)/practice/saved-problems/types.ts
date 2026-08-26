import type { Alignment } from "../[id]/types";

export type Difficulty = "easy" | "medium" | "hard";

export interface AnswerState {
  selected_key: string;
  correct: boolean;
}

/** One cell in the display-only navigator for the original practice set. */
export interface SetQuestion {
  question_id: string;
  /** 1-based position across the flattened set (matches the practice navigator). */
  number: number;
  /** Which Problem (group) it belongs to. */
  problem_number: number;
  status: "correct" | "wrong" | "unanswered";
  is_current: boolean;
}

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
  /** Server-flattened readable text for compact rows/suggestions. */
  question_text_plain: string;
  session_id: string | null;
  session_name: string | null;
  created_at: string;
}

export interface QuestionContent {
  question?: string | Record<string, string>;
  answer?: Record<string, string>;
  options?: Record<string, string>;
  choices?: Record<string, string>;
  explanation?: string;
  correct_answer?: string;
}

export interface SavedQuestionDetail extends SavedQuestion {
  /** Nested content object matching the practice page API format. */
  content: { zh?: QuestionContent; en?: QuestionContent };
  /** Word bank / MC choices as a flat array. */
  choices: { key: string; text: string }[] | null;
  /** null when the student hasn't answered — withheld server-side otherwise. */
  answer: string | null;
  /** Single markdown explanation. null when the student hasn't answered. */
  explanation: string | null;
  image_url: string | null;
  question_number: number | null;
  group_id: string | null;
  /** Position in the ORIGINAL practice set. part_* only set for multi-question
   *  Problems (e.g. one reading passage with several sub-questions). */
  problem_number: number | null;
  problem_total: number | null;
  part_index: number | null;
  part_total: number | null;
  /** How the student did when they practised it; null = never answered. */
  answer_state: AnswerState | null;
  /** Every question in the original set, for the display-only progress panel.
   *  Empty array when that session has since been deleted. */
  set_questions: SetQuestion[];
  /** Reading passage + vocab, populated for YL (reading comprehension) questions. */
  passage: string | null;
  passage_alignment: Alignment | null;
  alignment: Alignment | null;
}
