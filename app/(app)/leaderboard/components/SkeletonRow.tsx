"use client";

import { Box, Skeleton, rem } from "@mantine/core";

export function SkeletonRow() {
  return (
    <Box
      px={{ base: "md", sm: "xl" }}
      py="sm"
      className="warm-surface"
      style={{ display: "flex", alignItems: "center", gap: rem(14), borderRadius: rem(14) }}
    >
      <Skeleton width={rem(28)} height={rem(16)} radius="sm" />
      <Skeleton width={rem(40)} height={rem(40)} circle />
      <Box style={{ flex: 1 }}>
        <Skeleton height={rem(14)} width="40%" mb={rem(6)} radius="sm" />
        <Skeleton height={rem(11)} width="60%" radius="sm" />
      </Box>
      <Skeleton width={rem(64)} height={rem(22)} radius="sm" />
    </Box>
  );
}
