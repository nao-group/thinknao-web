import api from "@/lib/api";
import type { ApiSession, SubjectScoreOverview, Topic } from "./types";

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

function stablePreviewNumber(seed: string, min: number, max: number) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return min + (hash % (max - min + 1));
}

/** Fetch every subject's curriculum topics and attach stable preview scores. */
export async function fetchAverageScoreOverview(
  subjects: readonly { subjectCode: string; label: string }[]
): Promise<SubjectScoreOverview[]> {
  const topicResults = await Promise.allSettled(
    subjects.map((subject) => fetchTopics(subject.subjectCode))
  );

  return subjects.map((subject, index) => {
    const result = topicResults[index];
    const topics = result.status === "fulfilled" ? result.value : [];
    const topicScores = topics.map((topic) => ({
      name: topic.name,
      averageScore: stablePreviewNumber(`${subject.subjectCode}:${topic.code}`, 58, 92),
      completedSets: stablePreviewNumber(`${topic.code}:sets`, 2, 8),
    }));
    const averageScore = topicScores.length
      ? Math.round(topicScores.reduce((sum, topic) => sum + topic.averageScore, 0) / topicScores.length)
      : stablePreviewNumber(`${subject.subjectCode}:average`, 62, 86);

    return {
      code: subject.subjectCode,
      name: subject.label,
      averageScore,
      completedSets: topicScores.reduce((sum, topic) => sum + topic.completedSets, 0),
      topics: topicScores,
    };
  });
}
