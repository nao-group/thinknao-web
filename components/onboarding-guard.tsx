"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/api";

export function OnboardingGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    api.get<{ onboarding_completed_at: string | null }>("/api/user/profile")
      .then(({ data }) => {
        if (active && !data.onboarding_completed_at) {
          router.replace(`/onboarding?next=${encodeURIComponent(pathname)}`);
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [pathname, router]);

  return null;
}
