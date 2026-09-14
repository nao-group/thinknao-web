import { NavShell } from "@/components/nav-shell";
import { OnboardingGuard } from "@/components/onboarding-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NavShell>
      <OnboardingGuard />
      {children}
    </NavShell>
  );
}
