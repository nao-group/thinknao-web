import { NavShell } from "@/components/nav-shell";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <NavShell>{children}</NavShell>;
}
