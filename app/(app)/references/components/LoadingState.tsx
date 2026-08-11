"use client";

import { Text } from "@mantine/core";
import { Card } from "@/components/ui/card";

export function LoadingState() {
  return (
    <Card py={60} style={{ textAlign: "center" }}>
      <Text size="sm" c="dimmed">Loading references…</Text>
    </Card>
  );
}
