"use client";

import { Card } from "@/components/ui/card";

export function SectionCard({ children }: { children: React.ReactNode }) {
  return <Card p="xl">{children}</Card>;
}
