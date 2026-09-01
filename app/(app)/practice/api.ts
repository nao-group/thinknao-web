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

interface ApiTopicScore {
  topic_code: string;
  topic_name: string | null;
  answered: number;
  correct: number;
  average_score: number;
  completed_sets: number;
}

interface ApiSubjectScore {
  subject_code: string;
  subject_name: string | null;
  answered: number;
  correct: number;
  average_score: number;
  completed_sets: number;
  topics: ApiTopicScore[];
}

/**
 * The student's real average score per subject, broken down by topic.
 *
 * Only subjects they've actually answered questions in come back — a subject
 * with no attempts is omitted rather than reported as 0%, which would read as
 * "you scored zero" rather than "you haven't started this yet".
 *
 * `subjects` is accepted so the caller's label wins over the server's subject
 * name, keeping the wording identical to the rest of the practice page.
 */
export async function fetchAverageScoreOverview(
  subjects: readonly { subjectCode: string; label: string }[]
): Promise<SubjectScoreOverview[]> {
  const { data } = await api.get<{ subjects: ApiSubjectScore[] }>("/api/stats/subject-scores");
  const labelByCode = new Map(subjects.map((s) => [s.subjectCode, s.label]));

  return (data.subjects ?? []).map((subject) => ({
    code: subject.subject_code,
    name: labelByCode.get(subject.subject_code) ?? subject.subject_name ?? subject.subject_code,
    averageScore: Math.round(subject.average_score),
    completedSets: subject.completed_sets,
    topics: subject.topics.map((topic) => ({
      name: topic.topic_name ?? topic.topic_code,
      averageScore: Math.round(topic.average_score),
      completedSets: topic.completed_sets,
    })),
  }));
}
