"use client";

import { Button, Text } from "@mantine/core";
import { Card } from "@/components/ui/card";

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card py={60} style={{ textAlign: "center" }}>
      <Text size="sm" c="dimmed" mb="sm">Failed to load references. Please try again.</Text>
      <Button variant="light" radius="md" size="xs" onClick={onRetry}>Retry</Button>
    </Card>
  );
}
