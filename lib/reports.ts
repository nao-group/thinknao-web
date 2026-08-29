import api from "@/lib/api";

export interface ReportPayload {
  reason: string;
  details?: string;
  question_id?: string;
  session_id?: string;
}

/** Submit a "Report a Problem" entry for a question. */
export async function submitReport(payload: ReportPayload): Promise<void> {
  await api.post("/api/reports", payload);
}
