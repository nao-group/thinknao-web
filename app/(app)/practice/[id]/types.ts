// ─── Question type definitions for the practice module ───────────────────────

export type QuestionType = "JF" | "DT" | "XT" | "YL" | "SH" | "BY";

// ─── Vocab / alignment types ──────────────────────────────────────────────────

export interface VocabEntry {
  /** Tone-marked pinyin, e.g. "cí gǎn yìng qiáng dù" */
  pinyin: string;
  /** English meaning, e.g. "magnetic flux density" */
  en: string;
  /** Exact phrase as it appears in EN text when different from `en` */
  en_phrase?: string;
}

/** key = Chinese word/phrase → vocab entry */
export type Vocab = Record<string, VocabEntry>;

/** Vocab entry for EN→ZH hover (keyed by English word in vocab_en) */
export interface EnVocabEntry {
  /** Chinese equivalent */
  zh: string;
  /** Tone-marked pinyin of the Chinese word */
  pinyin: string;
}

export interface ExplanationAlignment {
  /** Every ZH word in the ZH explanation — same format as Alignment.vocab */
  vocab_zh?: Record<string, VocabEntry>;
  /** Every EN content word in the EN explanation, keyed by English word */
  vocab_en?: Record<string, EnVocabEntry>;
}

/**
 * Converts `vocab_en` (EnVocabEntry keyed by English word) to the standard
 * `Vocab` format so `AlignedText` in EN mode can build its reverse map normally.
 *
 * Each English word becomes the `en` field of a `VocabEntry`; `AlignedText`'s
 * `enEntries()` then uses `en_phrase ?? en` as the substring to match in text.
 */
export function vocabEnToVocab(vocabEn: Record<string, EnVocabEntry>): Vocab {
  const result: Vocab = {};
  for (const [enWord, { zh, pinyin }] of Object.entries(vocabEn)) {
    result[zh] = { pinyin, en: enWord };
  }
  return result;
}

export interface Alignment {
  vocab: Vocab;
  /** Present when explanation annotation succeeded (nested form from API) */
  explanation?: ExplanationAlignment;
}

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
    [key: string]: unknown;
  };
  image_url: string | null;
  question_number: number | null;
  question_type: QuestionType;
  group_id: string | null;
  passage: string | null;
  choices: WordChoice[] | null;   // DT/XT word bank
  /** Plain text explanation, Chinese — present only after the question is answered */
  explanation?: string;
  /** Plain text explanation, English — same gating as `explanation` */
  explanation_en?: string;
  /** Pre-computed vocab dictionary for hover translations (may be absent for new questions) */
  alignment?: Alignment;
  /** Structured annotated explanation — present only after the question is answered */
  explanation_alignment?: ExplanationAlignment;
}

// A logical group rendered as a single navigable unit
export interface QuestionGroup {
  type: QuestionType;
  group_id: string | null;
  questions: ApiQuestion[];
  passage?: string;
  /** Vocab dict for the passage text (YL only) */
  passage_alignment?: Alignment;
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
  explanation_alignment?: ExplanationAlignment;
}
