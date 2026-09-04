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

export interface WeekdayXP {
  day: string;      // "Mon" … "Sun"
  date: string;     // ISO date
  xp: number;
  is_today: boolean;
}

export interface LearningActivity {
  day_streak: number;
  /** null when the student has no XP in the window — not yet ranked, which is
   *  different from being ranked last. */
  rank: number | null;
  year_xp: number;
  monthly_rank: number | null;
  month_xp: number;
  ranked_students: number;
  week: WeekdayXP[];
}
