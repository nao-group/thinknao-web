import api from "@/lib/api";
import type { Difficulty, SavedQuestion, SavedQuestionDetail } from "./types";

export interface SavedQuestionsPage {
  items: SavedQuestion[];
  total: number;
  totalPages: number;
}

function arrayParamsSerializer(rawParams: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(rawParams)) {
    if (Array.isArray(value)) {
      value.forEach((v) => qs.append(key, v));
    } else if (value !== undefined && value !== null) {
      qs.append(key, String(value));
    }
  }
  return qs.toString();
}

export async function fetchSavedQuestions(params: {
  page: number;
  pageSize: number;
  search?: string;
  subjectCodes?: string[];
  difficulties?: Difficulty[];
  sort?: "newest" | "oldest";
}): Promise<SavedQuestionsPage> {
  const { data } = await api.get("/api/bookmarks", {
    params: {
      page: params.page,
      page_size: params.pageSize,
      sort: params.sort ?? "newest",
      ...(params.search ? { search: params.search } : {}),
      ...(params.subjectCodes && params.subjectCodes.length > 0 ? { subject_codes: params.subjectCodes } : {}),
      ...(params.difficulties && params.difficulties.length > 0 ? { difficulties: params.difficulties } : {}),
    },
    paramsSerializer: arrayParamsSerializer,
  });
  return { items: data.items ?? [], total: data.total ?? 0, totalPages: data.total_pages ?? 1 };
}

export async function fetchSavedQuestion(questionId: string): Promise<SavedQuestionDetail> {
  const { data } = await api.get<SavedQuestionDetail>(`/api/bookmarks/${questionId}`);
  return data;
}

export async function removeBookmark(questionId: string): Promise<void> {
  await api.delete(`/api/questions/${questionId}/bookmark`);
}
