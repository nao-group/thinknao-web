"use client";

import { Card } from "@/components/ui/card";

export function SectionCard({ children }: { children: React.ReactNode }) {
  return <Card p="xl" className="warm-surface dark-glass-card profile-section-card">{children}</Card>;
}
