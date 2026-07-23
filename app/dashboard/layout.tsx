import { NavShell } from "@/components/nav-shell";
import { OnboardingModal } from "@/components/onboarding-modal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NavShell>
      <OnboardingModal />
      {children}
    </NavShell>
  );
}
