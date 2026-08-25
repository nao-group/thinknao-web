import api from "@/lib/api";
import type { ApiSession, Topic } from "./types";

export interface SessionsPage {
  sessions: ApiSession[];
  totalPages: number;
}

export async function fetchSessions(params: {
  status: "in_progress" | "completed";
  page: number;
  pageSize: number;
  search?: string;
  subjectCodes?: string[];
}): Promise<SessionsPage> {
  const { data } = await api.get("/api/sessions", {
    params: {
      type: "practice",
      status: params.status,
      page: params.page,
      page_size: params.pageSize,
      ...(params.search ? { search: params.search } : {}),
      ...(params.subjectCodes && params.subjectCodes.length > 0 ? { subject_codes: params.subjectCodes } : {}),
    },
    paramsSerializer: (rawParams) => {
      const qs = new URLSearchParams();
      for (const [key, value] of Object.entries(rawParams)) {
        if (Array.isArray(value)) {
          value.forEach((v) => qs.append(key, v));
        } else if (value !== undefined && value !== null) {
          qs.append(key, String(value));
        }
      }
      return qs.toString();
    },
  });
  return { sessions: data.sessions ?? [], totalPages: data.total_pages ?? 1 };
}

export async function fetchTopics(subjectCode: string): Promise<Topic[]> {
  const { data } = await api.get(`/api/subjects/${subjectCode}/topics`);
  return data.topics ?? [];
}

export async function generatePracticeSet(topicId: string, n: number): Promise<{ sessionId: string; name?: string }> {
  const { data } = await api.post("/api/practice", { topic_id: topicId, n });
  return { sessionId: data.session_id, name: data.name };
}

export async function renameSession(sessionId: string, name: string): Promise<void> {
  await api.patch(`/api/sessions/${sessionId}/name`, { name });
}

export async function deleteSession(sessionId: string): Promise<void> {
  await api.delete(`/api/sessions/${sessionId}`);
}
