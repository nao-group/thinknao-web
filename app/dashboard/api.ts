import api from "@/lib/api";
import type { Session, SessionProgress } from "./types";

export async function fetchRecentSessions(): Promise<Session[]> {
  const { data } = await api.get<{ sessions: Session[] }>("/api/sessions", {
    params: { type: "practice", status: "completed", page_size: 3 },
  });
  return data.sessions ?? [];
}

export async function fetchInProgressSessions(): Promise<Session[]> {
  const { data } = await api.get<{ sessions: Session[] }>("/api/sessions", {
    params: { type: "practice", status: "in_progress", page_size: 3 },
  });
  return data.sessions ?? [];
}

export async function fetchSessionProgress(sessionId: string): Promise<SessionProgress> {
  const { data } = await api.get<{ answered_count: number; total_count: number }>(
    `/api/sessions/${sessionId}/questions`
  );
  return { answered_count: data.answered_count ?? 0, total_count: data.total_count ?? 0 };
}
