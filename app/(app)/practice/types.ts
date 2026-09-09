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
  /** Distinct questions in this topic ever answered correctly, out of every
   *  verified question that exists in the topic — a coverage/mastery score,
   *  not attempt accuracy. Never started is a real 0, not null. */
  correct: number;
  totalQuestions: number;
  averageScore: number;
  completedSets: number;
}

export interface SubjectScoreOverview {
  code: string;
  name: string;
  /** Plain average of this subject's topic scores — NOT weighted by how many
   *  questions are banked under each topic. */
  averageScore: number;
  completedSets: number;
  topics: TopicScoreOverview[];
}
