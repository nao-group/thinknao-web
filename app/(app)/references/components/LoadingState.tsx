"use client";

import { Box, Skeleton, Stack, rem } from "@mantine/core";

export function LoadingState() {
  return (
    <Box
      aria-label="Loading references"
      aria-busy="true"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: rem(12),
      }}
    >
      {Array.from({ length: 10 }, (_, index) => (
        <Box key={index} className="reference-card reference-skeleton-card" p="lg">
          <Stack gap="sm">
            <Skeleton height={25} width="42%" radius="xl" />
            <Skeleton height={24} width="68%" radius="sm" />
            <Skeleton height={14} width="38%" radius="sm" />
            <Skeleton height={14} width="54%" radius="sm" />
            <Skeleton height={58} mt="md" radius="md" />
          </Stack>
        </Box>
      ))}
    </Box>
  );
}
