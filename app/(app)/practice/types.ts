// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiSession {
  id: string;
  name: string;
  status: "in_progress" | "completed";
  topic_id: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  topic_name: string;
  topic_code: string;
  created_at: string;
}

export interface SubjectScore {
  subject_code: string;
  subject_name: string | null;
  answered: number;
  correct: number;
  /** Percent, 0-100. */
  average_score: number;
}

export interface Topic {
  id: string;
  name: string;
  code: string;
}

export interface TopicScoreOverview {
  name: string;
  averageScore: number;
  completedSets: number;
}

export interface SubjectScoreOverview {
  code: string;
  name: string;
  averageScore: number;
  completedSets: number;
  topics: TopicScoreOverview[];
}
