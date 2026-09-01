/**
 * API client for the practice session endpoints.
 * Handles the raw API format and adapts it to the internal QuestionGroup / ApiQuestion types.
 */

import api from "@/lib/api";
import type {
  ApiQuestion, QuestionGroup, WordChoice,
  BlankResult, SubmitResult, Alignment, ExplanationAlignment,
} from "./types";

// ─── Raw API shapes ───────────────────────────────────────────────────────────

interface RawContent {
  question?: string | Record<string, string>;
  options?: Record<string, string>;
  choices?: Record<string, string>;
  [key: string]: unknown;
}

interface RawQuestion {
  id: string;
  code: string;
  difficulty: "easy" | "medium" | "hard";
  question_type: "JF" | "DT" | "XT" | "YL" | "SH" | "BY" | "standard";
  question_number: number | null;
  image_url: string | null;
  content: { zh?: RawContent; en?: RawContent };
  /** Populated on /questions and /review endpoints */
  answer_state?: { selected_key: string; correct: boolean } | null;
  /** On /review, and on /questions once the question has been answered. */
  correct_answer?: string;
  explanation?: string;      // Chinese
  explanation_en?: string;   // English
  alignment?: Alignment | null;
  /** Structured annotated explanation — present only after question is answered */
  explanation_alignment?: ExplanationAlignment | null;
}

interface RawGroup {
  group_id: string;
  type: "JF" | "DT" | "XT" | "YL" | "SH" | "BY" | "standard";
  passage: string | null;
  passage_alignment?: Alignment | null;
  word_bank: WordChoice[] | null;
  questions: RawQuestion[];
  /** /questions endpoint — true when all questions in group are answered */
  answered?: boolean;
}

interface SessionQuestionsResponse {
  session_id: string;
  name?: string;
  subject_code?: string;
  status: string;
  total_groups: number;
  answered_count?: number;
  total_count?: number;
  score?: number;
  xp_earned?: number;
  groups: RawGroup[];
}

interface SingleSubmitResponse {
  question_id: string;
  correct: boolean;
  correct_answer: string;
  difficulty: string;
  xp_awarded: number;
  explanation?: string;
  explanation_en?: string;
  explanation_alignment?: ExplanationAlignment;
}

interface GroupSubmitResponse {
  group_id: string;
  correct: boolean;
  xp_awarded: number;
  results: {
    question_id: string;
    blank_index: string;
    correct: boolean;
    correct_answer: string;
    user_answer: string;
  }[];
  explanation?: string;
  explanation_en?: string;
  /** Per-question annotated explanation — keyed by question_id (DT/XT) */
  explanation_alignment?: Record<string, ExplanationAlignment>;
}

// ─── Adapter: raw API → internal types ───────────────────────────────────────

function adaptQuestion(raw: RawQuestion, wordBank: WordChoice[] | null, passage: string | null): ApiQuestion {
  const zhRaw = raw.content?.zh ?? {};
  const enRaw = raw.content?.en ?? {};

  return {
    id: raw.id,
    code: raw.code,
    difficulty: raw.difficulty,
    question_type: raw.question_type === "standard" ? "JF" : raw.question_type,
    question_number: raw.question_number,
    image_url: raw.image_url,
    group_id: null, // filled by caller
    passage,
    choices: wordBank,
    explanation: raw.explanation ?? undefined,
    explanation_en: raw.explanation_en ?? undefined,
    alignment: raw.alignment ?? undefined,
    explanation_alignment:
      raw.explanation_alignment ?? raw.alignment?.explanation ?? undefined,
    content_zh: {
      question: zhRaw.question,
      answer: zhRaw.options ?? zhRaw.choices,  // API uses "options" (JF/YL) or "choices" (standard)
      correct_answer: raw.correct_answer,
      ...zhRaw,
    },
    content_en: {
      question: enRaw.question,
      answer: enRaw.options ?? enRaw.choices,
      correct_answer: raw.correct_answer,
      ...enRaw,
    },
  };
}

function adaptGroup(raw: RawGroup): QuestionGroup {
  const questions = raw.questions.map((q) => ({
    ...adaptQuestion(q, raw.word_bank, raw.passage),
    group_id: raw.group_id,
  }));

  return {
    type: raw.type === "standard" ? "JF" : raw.type,
    group_id: raw.group_id,
    passage: raw.passage ?? undefined,
    passage_alignment: raw.passage_alignment ?? undefined,
    questions,
  };
}

/** Adapt the answer_state of already-answered questions back into page state shapes */
export interface RestoredState {
  /** questionId → selected_key (for YL/JF) */
  answers: Record<string, string>;
  /** questionIds that were submitted (YL/JF) */
  submittedIds: Set<string>;
  /** group indices (in the returned groups array) that are fully answered (DT/XT) */
  submittedGroupIndices: Set<number>;
  /** questionId → SubmitResult (for already-answered questions) */
  submitResults: Record<string, SubmitResult>;
}

/**
 * `correct_answer` arrives from `/review`, and from `/questions` for questions the
 * student has already answered — it stays withheld for unanswered ones so resuming
 * a session can never leak an answer.
 *
 * When it's absent but the answer was correct, the selected key IS the correct one,
 * so it's inferred. Anything still unknown falls back to "", the sentinel the
 * rendering components read as "don't highlight anything" — deliberately never the
 * student's own key, which would paint a wrong answer as if it were right.
 *
 * Getting this wrong is what made every resumed answer render red with an ✗: with
 * `correct_answer` empty, no option matched "correct", so the student's pick fell
 * through to the "your (wrong) answer" branch even when they'd got it right.
 */
function buildRestoredState(rawGroups: RawGroup[]): RestoredState {
  const answers: Record<string, string> = {};
  const submittedIds = new Set<string>();
  const submittedGroupIndices = new Set<number>();
  const submitResults: Record<string, SubmitResult> = {};

  rawGroups.forEach((group, groupIdx) => {
    const isGroupType = group.type === "DT" || group.type === "XT";

    // For DT/XT: mark as submitted if group.answered flag is set (questions endpoint)
    // OR if every question in the group has an answer_state (review endpoint — no `answered` flag)
    if (isGroupType) {
      const allAnswered = group.questions.every((q) => q.answer_state != null);
      if (group.answered || allAnswered) submittedGroupIndices.add(groupIdx);
    }

    group.questions.forEach((q) => {
      if (!q.answer_state) return;

      const { selected_key, correct } = q.answer_state;

      if (isGroupType) {
        // DT/XT: answers stored in fillAnswers — handled separately by caller

        // Build a minimal blank result for the submitted state
        const blankResult: BlankResult = {
          blank_index: "1",
          correct,
          correct_answer: q.correct_answer ?? (correct ? selected_key : ""),
          user_answer: selected_key,
        };
        submitResults[q.id] = {
          question_id: q.id,
          correct,
          correct_answer: q.correct_answer ?? (correct ? selected_key : ""),
          difficulty: q.difficulty,
          xp_awarded: 0,
          blank_results: [blankResult],
        };
      } else {
        // YL/JF
        answers[q.id] = selected_key;
        submittedIds.add(q.id);
        submitResults[q.id] = {
          question_id: q.id,
          correct,
          correct_answer: q.correct_answer ?? (correct ? selected_key : ""),
          difficulty: q.difficulty,
          xp_awarded: 0,
        };
      }
    });
  });

  return { answers, submittedIds, submittedGroupIndices, submitResults };
}

/** Also return the fill answers for DT/XT restoration */
export function buildFillAnswers(rawGroups: RawGroup[]): Record<string, Record<string, string>> {
  const fillAnswers: Record<string, Record<string, string>> = {};
  for (const group of rawGroups) {
    if (group.type !== "DT" && group.type !== "XT") continue;
    for (const q of group.questions) {
      if (q.answer_state?.selected_key) {
        fillAnswers[q.id] = { "1": q.answer_state.selected_key };
      }
    }
  }
  return fillAnswers;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function fetchSessionQuestions(sessionId: string): Promise<{
  groups: QuestionGroup[];
  restored: RestoredState;
  fillAnswers: Record<string, Record<string, string>>;
  sessionName: string;
  subjectCode: string;
}> {
  const { data } = await api.get<SessionQuestionsResponse>(
    `/api/sessions/${sessionId}/questions`
  );
  const groups = data.groups.map(adaptGroup);
  const restored = buildRestoredState(data.groups);
  const fillAnswers = buildFillAnswers(data.groups);
  return { groups, restored, fillAnswers, sessionName: data.name ?? "", subjectCode: data.subject_code ?? "" };
}

/** Fetch completed session for review — includes correct_answer + explanation pre-populated */
export async function fetchSessionReview(sessionId: string): Promise<{
  groups: QuestionGroup[];
  restored: RestoredState;
  fillAnswers: Record<string, Record<string, string>>;
  xpEarned: number;
  sessionName: string;
  subjectCode: string;
}> {
  const { data } = await api.get<SessionQuestionsResponse>(
    `/api/sessions/${sessionId}/review`
  );
  const groups = data.groups.map(adaptGroup);
  const restored = buildRestoredState(data.groups);
  const fillAnswers = buildFillAnswers(data.groups);
  return { groups, restored, fillAnswers, xpEarned: data.xp_earned ?? 0, sessionName: data.name ?? "", subjectCode: data.subject_code ?? "" };
}

export async function submitSingleQuestion(
  sessionId: string,
  questionId: string,
  selectedKey: string
): Promise<SubmitResult & { explanation?: string; explanation_en?: string }> {
  const { data } = await api.post<SingleSubmitResponse>(
    `/api/questions/${questionId}/submit`,
    { session_id: sessionId, selected_key: selectedKey }
  );
  return {
    question_id: data.question_id,
    correct: data.correct,
    correct_answer: data.correct_answer,
    difficulty: data.difficulty,
    xp_awarded: data.xp_awarded,
    explanation: data.explanation,
    explanation_en: data.explanation_en,
    explanation_alignment: data.explanation_alignment,
  };
}

export async function submitQuestionGroup(
  sessionId: string,
  groupId: string,
  answers: Record<string, Record<string, string>> // questionId → { "1": key }
): Promise<{
  results: Record<string, SubmitResult>;
  explanation?: string;
  explanation_en?: string;
  explanation_alignment?: Record<string, ExplanationAlignment>;
}> {
  const { data } = await api.post<GroupSubmitResponse>(
    `/api/question-groups/${groupId}/submit`,
    { session_id: sessionId, answers }
  );

  // Convert flat results array → per-question SubmitResult map
  const resultMap: Record<string, SubmitResult> = {};
  for (const r of data.results) {
    if (!resultMap[r.question_id]) {
      resultMap[r.question_id] = {
        question_id: r.question_id,
        correct: r.correct,
        correct_answer: r.correct_answer,
        difficulty: "easy",
        xp_awarded: 0,
        blank_results: [],
      };
    }
    resultMap[r.question_id].blank_results!.push({
      blank_index: r.blank_index,
      correct: r.correct,
      correct_answer: r.correct_answer,
      user_answer: r.user_answer,
    });
    resultMap[r.question_id].correct = r.correct;
  }

  // Distribute xp and overall correctness from group result
  for (const qid of Object.keys(resultMap)) {
    const blankResults = resultMap[qid].blank_results ?? [];
    resultMap[qid].correct = blankResults.every((b) => b.correct);
    resultMap[qid].xp_awarded = data.xp_awarded / Object.keys(resultMap).length;
  }

  return {
    results: resultMap,
    explanation: data.explanation,
    explanation_en: data.explanation_en,
    explanation_alignment: data.explanation_alignment,
  };
}

export async function completeSession(sessionId: string): Promise<void> {
  await api.patch(`/api/sessions/${sessionId}/complete`);
}

// ─── Bookmarks ──────────────────────────────────────────────────────────────

export async function fetchBookmarkedIds(sessionId: string): Promise<Set<string>> {
  const { data } = await api.get<{ question_ids: string[] }>("/api/bookmarks/question-ids", {
    params: { session_id: sessionId },
  });
  return new Set(data.question_ids ?? []);
}

export async function addBookmark(questionId: string, sessionId: string): Promise<void> {
  await api.post(`/api/questions/${questionId}/bookmark`, { session_id: sessionId });
}

export async function removeBookmark(questionId: string): Promise<void> {
  await api.delete(`/api/questions/${questionId}/bookmark`);
}
