/**
 * API client for the practice session endpoints.
 * Handles the raw API format and adapts it to the internal QuestionGroup / ApiQuestion types.
 */

import api from "@/lib/api";
import type {
  ApiQuestion, QuestionGroup, WordChoice,
  BlankResult, SubmitResult, Alignment,
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
  /** Only on /review */
  correct_answer?: string;
  explanation?: string;
  alignment?: Alignment | null;
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
    alignment: raw.alignment ?? undefined,
    content_zh: {
      question: zhRaw.question,
      answer: zhRaw.options ?? zhRaw.choices,  // API uses "options" (JF/YL) or "choices" (standard)
      explanation: raw.explanation ?? undefined,
      correct_answer: raw.correct_answer,
      ...zhRaw,
    },
    content_en: {
      question: enRaw.question,
      answer: enRaw.options ?? enRaw.choices,
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
          correct_answer: q.correct_answer ?? selected_key,
          user_answer: selected_key,
        };
        submitResults[q.id] = {
          question_id: q.id,
          correct,
          correct_answer: q.correct_answer ?? selected_key,
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
          correct_answer: q.correct_answer ?? selected_key,
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
): Promise<SubmitResult & { explanation?: string }> {
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
  };
}

export async function submitQuestionGroup(
  sessionId: string,
  groupId: string,
  answers: Record<string, Record<string, string>> // questionId → { "1": key }
): Promise<{
  results: Record<string, SubmitResult>;
  explanation?: string;
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

  return { results: resultMap, explanation: data.explanation };
}

export async function completeSession(sessionId: string): Promise<void> {
  await api.patch(`/api/sessions/${sessionId}/complete`);
}
