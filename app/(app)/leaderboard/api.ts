import api from "@/lib/api";
import type { LeaderboardEntry } from "./types";

export async function fetchLeaderboardEntries(limit = 50): Promise<LeaderboardEntry[]> {
  const { data } = await api.get<LeaderboardEntry[]>(`/api/leaderboard?limit=${limit}`);
  return data;
}

export async function fetchMyRank(): Promise<LeaderboardEntry> {
  const { data } = await api.get<LeaderboardEntry>("/api/leaderboard/me");
  return data;
}
