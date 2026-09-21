/**
 * API client for the mock-exam backend. Adapts the grouped QuestionGroup
 * response into the flat MockQ[] this page renders. Every group has exactly
 * one question (backend only samples ungrouped types — no passage UI here yet).
 */

import api from "@/lib/api";
import { SUBJECTS } from "../practice/data";
import type { MockQ, Subject } from "./types";

const SUBJECT_CODE_TO_NAME: Record<string, Subject> = {
  MT: "Mathematics",
  PH: "Physics",
  CM: "Chemistry",
  WH: "Humanities Chinese",
  LH: "STEM Chinese",
};

const NAME_TO_SUBJECT_CODE: Record<string, string> = Object.fromEntries(
  SUBJECTS.map((s) => [s.label, s.subjectCode])
);

interface RawContent {
  // question is blank-indexed ({ "1": "text" }) even for single-choice
  // questions; choices live under "answer" for standard-type content.
  question?: string | Record<string, string>;
  answer?: Record<string, string>;
  choices?: Record<string, string>;
  options?: Record<string, string>;
}

interface RawQuestionInGroup {
  id: string;
  code: string;
  difficulty: string;
  question_type: string;
  question_number: number;
  image_url: string | null;
  content: { zh?: RawContent; en?: RawContent };
  alignment?: unknown;
}

interface RawQuestionGroup {
  group_id: string;
  type: string;
  passage: string | null;
  word_bank: unknown;
  questions: RawQuestionInGroup[];
}

interface ExamCreateApiResponse {
  session_id: string;
  subject_code: string;
  total_groups: number;
  time_limit_minutes: number;
  groups: RawQuestionGroup[];
}

function extractText(content: RawContent | undefined): string {
  const qField = content?.question;
  if (!qField) return "";
  if (typeof qField === "string") return qField;
  return Object.values(qField)[0] ?? "";
}

function extractOptions(content: RawContent | undefined): { key: string; text: string }[] {
  const answer = content?.answer ?? content?.options ?? content?.choices;
  if (!answer) return [];
  return Object.entries(answer).map(([key, text]) => ({ key, text }));
}

function topicLabelFromCode(code: string): string {
  // "PH-KM-0001" → "KM" (topic code segment) — cosmetic only, no topic name in the API response.
  const parts = code.split("-");
  return parts.length >= 2 ? parts[1] : code;
}

function adaptQuestion(raw: RawQuestionInGroup, subject: Subject): MockQ {
  const en = raw.content?.en;
  const zh = raw.content?.zh;
  const enText = extractText(en);
  const zhText = extractText(zh);
  const enOptions = extractOptions(en);
  const zhOptions = extractOptions(zh);
  return {
    id: raw.id,
    subject,
    topic: topicLabelFromCode(raw.code),
    text: enText || zhText,
    options: enOptions.length ? enOptions : zhOptions,
    correctAnswer: "", // never sent by the API before submission — grading happens server-side
    zh: zhText
      ? { topic: topicLabelFromCode(raw.code), text: zhText, options: zhOptions.length ? zhOptions : undefined }
      : undefined,
  };
}

export async function createExam(
  subjectCode: string,
  language?: string
): Promise<{ sessionId: string; timeLimitMinutes: number; questions: MockQ[] }> {
  const { data } = await api.post<ExamCreateApiResponse>("/api/exam", {
    subject_code: subjectCode,
    language,
  });
  const subject = SUBJECT_CODE_TO_NAME[data.subject_code] ?? SUBJECT_CODE_TO_NAME[subjectCode] ?? "Mathematics";
  const questions = data.groups.map((g) => adaptQuestion(g.questions[0], subject));
  return { sessionId: data.session_id, timeLimitMinutes: data.time_limit_minutes, questions };
}

interface ExamSubmitApiResponse {
  session_id: string;
  score: number;
  total: number;
  percentage: number;
  xp_awarded: number;
  results: { question_id: string; correct: boolean; correct_answer: string }[];
}

export async function submitExam(
  sessionId: string,
  answers: Record<string, string>,
  timeTakenSeconds: number
): Promise<{ score: number; total: number; percentage: number; xpAwarded: number }> {
  const { data } = await api.post<ExamSubmitApiResponse>(`/api/exam/${sessionId}/submit`, {
    answers,
    time_taken_seconds: timeTakenSeconds,
  });
  return { score: data.score, total: data.total, percentage: data.percentage, xpAwarded: data.xp_awarded };
}

export interface ExamAttemptSummary {
  id: string;
  date: string;
  score: number;
  total: number;
  pct: number;
  passed: boolean;
  duration: string;
  lang: string;
  subject: Subject;
}

interface ApiSessionForExam {
  id: string;
  subject_code?: string;
  score?: number | null;
  total_questions?: number | null;
  completed_at?: string | null;
  created_at: string;
  language?: string | null;
  time_limit_minutes?: number | null;
}

const PASS_MARK = 60;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export async function fetchRecentExamAttempts(): Promise<ExamAttemptSummary[]> {
  const { data } = await api.get<{ sessions: ApiSessionForExam[] }>("/api/sessions", {
    params: { type: "mock_exam", status: "completed", page: 1, page_size: 5 },
  });
  return (data.sessions ?? []).map((s) => {
    const total = s.total_questions ?? 0;
    const score = s.score ?? 0;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const startedAt = new Date(s.created_at).getTime();
    const completedAt = s.completed_at ? new Date(s.completed_at).getTime() : startedAt;
    return {
      id: s.id,
      date: new Date(s.completed_at ?? s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      score,
      total,
      pct,
      passed: pct >= PASS_MARK,
      duration: formatDuration(Math.max(0, Math.round((completedAt - startedAt) / 1000))),
      lang: s.language === "zh" ? "中文" : "EN",
      subject: SUBJECT_CODE_TO_NAME[s.subject_code ?? ""] ?? "Mathematics",
    };
  });
}

export { NAME_TO_SUBJECT_CODE };
