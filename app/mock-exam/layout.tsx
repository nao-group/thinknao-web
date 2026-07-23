import { NavShell } from "@/components/nav-shell";

export default function MockExamLayout({ children }: { children: React.ReactNode }) {
  return <NavShell>{children}</NavShell>;
}
