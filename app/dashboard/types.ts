export interface Session {
  id: string;
  name: string;
  status: "in_progress" | "completed";
  type: string;
  subject_code: string;
  subject_name: string;
  topic_name: string | null;
  topic_code: string | null;
  created_at: string;
}

export interface SessionProgress {
  answered_count: number;
  total_count: number;
}
