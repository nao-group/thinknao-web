"use client";

import { Box, Text, rem } from "@mantine/core";
import { INK, SURFACE } from "@/constants/colors";

export function ReadonlyBio({ value }: { value: string }) {
  return (
    <Box>
      <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.06em" }} mb={6}>
        Bio
      </Text>
      <Box
        px="sm"
        py="xs"
        style={{
          backgroundColor: SURFACE,
          borderRadius: rem(8),
          minHeight: rem(72),
        }}
      >
        <Text size="sm" c={value ? INK : "dimmed"} lh={1.6}>
          {value || "No bio yet."}
        </Text>
      </Box>
    </Box>
  );
}
