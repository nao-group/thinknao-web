import { OnboardingGuard } from "@/components/onboarding-guard";

export default function FullscreenLayout({ children }: { children: React.ReactNode }) {
  return <><OnboardingGuard />{children}</>;
}
