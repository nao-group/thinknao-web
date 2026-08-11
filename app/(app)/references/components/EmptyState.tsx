"use client";

import { Text } from "@mantine/core";
import { Card } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card py={60} style={{ textAlign: "center" }}>
      <Text size="sm" c="dimmed">No results found. Try a different search or filter.</Text>
    </Card>
  );
}
