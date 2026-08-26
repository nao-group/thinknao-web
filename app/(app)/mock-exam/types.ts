export type Subject =
  | "Humanities Chinese"
  | "STEM Chinese"
  | "Mathematics"
  | "Physics"
  | "Chemistry";
export type Phase = "landing" | "generating" | "exam" | "results";

export interface MockQ {
  id: number;
  subject: Subject;
  topic: string;
  text: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  zh?: { topic: string; text: string; options?: { key: string; text: string }[] };
}

export interface ExamResult {
  correct: number;
  pct: number;
  passed: boolean;
  timeTaken: number;
  timedOut: boolean;
}
