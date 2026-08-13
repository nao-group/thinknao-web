import api from "@/lib/api";
import type { LeaderboardEntry, MonthlyXp } from "./types";

export async function fetchLeaderboardEntries(): Promise<LeaderboardEntry[]> {
  const { data } = await api.get<LeaderboardEntry[]>("/api/leaderboard?limit=50");
  return data;
}

export interface MyRank {
  rank: number;
  total_xp: number;
  yearly_xp: number;
  monthly_xp: MonthlyXp[];
}

export async function fetchMyRank(): Promise<MyRank> {
  const { data } = await api.get<MyRank>("/api/user/rank");
  return data;
}
