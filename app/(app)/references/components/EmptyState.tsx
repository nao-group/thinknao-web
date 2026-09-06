"use client";

import { EmptyState as GlobalEmptyState } from "@/components/ui/empty-state";

export function EmptyState() {
  return (
    <GlobalEmptyState title="No references found" description="Try a different search, subject, or filter." />
  );
}
