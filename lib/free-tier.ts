import { useEffect, useState } from "react";
import api from "@/lib/api";

export type AccessTier = "subscriber" | "free" | "lapsed";

export interface FreeTierStatus {
  tier: AccessTier;
  practice_questions_used: number;
  practice_questions_cap: number;   // -1 = unlimited
  mock_exam_used: number;
  mock_exam_cap: number;            // -1 = unlimited
  chat_messages_used: number;
  chat_messages_cap: number;   // -1 = unlimited
  chat_messages_reset: "lifetime" | "daily";
}

export async function fetchFreeTierStatus(): Promise<FreeTierStatus> {
  const { data } = await api.get<FreeTierStatus>("/api/account/free-tier-status");
  return data;
}

/** null while loading or on error — treat as "unknown, don't gate yet". */
export function useAccessTier() {
  const [status, setStatus] = useState<FreeTierStatus | null>(null);

  useEffect(() => {
    let active = true;
    fetchFreeTierStatus()
      .then((result) => { if (active) setStatus(result); })
      .catch(() => { /* leave status null — callers fall back to their existing gating */ });
    return () => { active = false; };
  }, []);

  return status;
}
