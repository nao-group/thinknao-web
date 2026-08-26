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

export interface SavedQuestionDetail extends SavedQuestion {
  content_en: QuestionContent;
  content_zh: QuestionContent;
  choices: { key: string; text: string }[] | null;
  /** null unless the student already answered this — withheld server-side otherwise. */
  answer: string | null;
  explanation_en: string | null;
  explanation_zh: string | null;
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
  /** Every question in the original set, for the display-only progress panels.
   *  Empty when that session has since been deleted. */
  set_questions: SetQuestion[];
  /** Reading passage + vocab, populated for YL (reading comprehension) questions. */
  passage: string | null;
  passage_alignment: Alignment | null;
  alignment: Alignment | null;
}
