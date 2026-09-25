"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IconChevronUp, IconRefresh, IconUserCircle, IconUserStar } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { isTestingAccount } from "@/lib/testing-account";
import styles from "./testing-onboarding-reset.module.css";

type TestingMode = "free" | "subscriber";

export function TestingOnboardingReset() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const pathname = usePathname();
  const router = useRouter();
  const [opened, setOpened] = useState(false);
  const [mode, setMode] = useState<TestingMode | null>(null);
  const [loading, setLoading] = useState(false);
  const visible = isTestingAccount(user?.email) && !["/", "/login", "/register", "/reset-password"].includes(pathname);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    api.get<{ mode: TestingMode }>("/api/onboarding/testing/mode")
      .then(({ data }) => { if (active) setMode(data.mode); })
      .catch(() => { if (active) setMode(null); });
    return () => { active = false; };
  }, [visible]);

  if (!visible) return null;

  async function changeMode() {
    if (loading || !mode) return;
    setLoading(true);
    try {
      await api.post("/api/onboarding/testing/mode", { mode: mode === "free" ? "subscriber" : "free" });
      window.location.reload();
    } catch {
      notifications.show({ title: "Could not change testing mode", message: "Please try again.", color: "red" });
      setLoading(false);
    }
  }

  async function reset() {
    if (loading) return;
    setLoading(true);
    try {
      await api.post("/api/onboarding/testing/reset");
      if (user) setUser({ ...user, onboarding_completed: false });
      if (user?.user_id) window.localStorage.removeItem(`thinknao:tour:v1:${user.user_id}`);
      setOpened(false);
      if (pathname === "/onboarding") window.location.reload();
      else {
        setLoading(false);
        router.push("/onboarding");
      }
    } catch {
      notifications.show({ title: "Reset failed", message: "Please try again.", color: "red" });
      setLoading(false);
    }
  }

  return <div className={styles.floating}>
    {opened && <div className={styles.menu} role="group" aria-label="Testing account tools">
      <div className={styles.menuHeader}>TESTING MODE <strong>{mode === "free" ? "Free member" : mode === "subscriber" ? "Subscriber" : "Loading…"}</strong></div>
      <button type="button" className={styles.menuItem} onClick={changeMode} disabled={loading || !mode}>
        {mode === "free" ? <IconUserStar size={19} aria-hidden="true" /> : <IconUserCircle size={19} aria-hidden="true" />}
        <span>{mode === "free" ? "Return to subscriber" : "Act as free member"}</span>
      </button>
      <button type="button" className={styles.menuItem} onClick={reset} disabled={loading}>
        <IconRefresh size={19} aria-hidden="true" /><span>Reset onboarding</span>
      </button>
    </div>}
    <button type="button" className={styles.trigger} onClick={() => setOpened((value) => !value)} aria-expanded={opened} aria-label="Testing account tools">
      <IconUserStar size={19} aria-hidden="true" /><span>Testing tools</span><IconChevronUp size={16} className={opened ? styles.chevronOpen : ""} aria-hidden="true" />
    </button>
  </div>;
}
