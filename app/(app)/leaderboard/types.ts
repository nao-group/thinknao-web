// ─── Types ─────────────────────────────────────────────────────────────────────

export interface MonthlyXp {
  month: string; // "Jan", "Feb", etc.
  xp: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  province: string | null;
  current_school: string | null;
  dream_university: string | null;
  bio: string | null;
  instagram: string | null;
  tiktok: string | null;
  linkedin: string | null;
  total_xp: number;
  yearly_xp: number;
  monthly_xp: MonthlyXp[];
}
