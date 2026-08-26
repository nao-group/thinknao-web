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
}

export interface AnswerState {
  selected_key: string;
  correct: boolean;
}

export interface SetQuestion {
  question_id: string;
  number: number;
  problem_number: number;
  status: "correct" | "wrong" | "unanswered";
  is_current: boolean;
}

export interface SavedQuestionDetail extends SavedQuestion {
  /** Nested content object matching the practice page API format. */
  content: { zh?: QuestionContent; en?: QuestionContent };
  /** Word bank / MC choices as a flat array. */
  choices: { key: string; text: string }[] | null;
  /** Correct answer key (MC) or correct choice key for the current blank (DT/XT). */
  answer: string;
  /** Full markdown explanation, not split by language. */
  explanation: string;
  image_url: string | null;
  /** Present when the student already answered this in the session it was saved from. */
  answer_state: AnswerState | null;

  // Cloze / set metadata
  question_number?: number;
  group_id?: string;
  problem_number?: number;
  problem_total?: number;
  /** 1-based index of the blank this question covers (DT/XT). */
  part_index?: number;
  /** Total number of blanks in the group. */
  part_total?: number;
  set_questions?: SetQuestion[];

  // Reading comprehension
  passage?: string | null;
  passage_alignment?: unknown;
  alignment?: { vocab?: Record<string, unknown> };
}
