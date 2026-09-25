import api from "@/lib/api";

export interface DailyLearning {
  date: string;
  answers: number;
  correct: number;
  completed_sets: number;
  xp: number;
}

export interface TopicAccuracy {
  code: string;
  name: string;
  answered: number;
  correct: number;
  accuracy: number;
}

export interface SubjectAccuracy {
  code: string;
  name: string;
  answered: number;
  correct: number;
  accuracy: number;
  topics: TopicAccuracy[];
}

export interface LearningOverview {
  current_streak: number;
  longest_streak: number;
  total_answers: number;
  correct_answers: number;
  answer_accuracy: number;
  completed_practice_sets: number;
  completed_mock_exams: number;
  average_mock_score: number | null;
  best_mock_score: number | null;
  total_xp: number;
  // Older running API instances can still return active_days_28 and 28 day rows.
  active_days_30?: number;
  active_days_28?: number;
  days: DailyLearning[];
  subjects: SubjectAccuracy[];
  recent_sessions: {
    id: string;
    name: string;
    type: string;
    subject_name: string;
    completed_at: string;
    score: number | null;
  }[];
  mock_exam_results: MockExamResult[];
}

export interface MockExamResult {
  id: string;
  subject_name: string;
  completed_at: string;
  score: number;
}

export async function fetchLearningOverview(): Promise<LearningOverview> {
  const { data } = await api.get<LearningOverview>("/api/stats/learning-overview");
  return data;
}
