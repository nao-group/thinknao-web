"use client";

import { Box, Text, rem } from "@mantine/core";
import { INK, SURFACE } from "@/constants/colors";

interface ReadonlyFieldProps {
  label: string;
  value: string;
}

export function ReadonlyField({ label, value }: ReadonlyFieldProps) {
  return (
    <Box>
      <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.06em" }} mb={6}>
        {label}
      </Text>
      <Box
        px="sm"
        py="xs"
        style={{
          backgroundColor: SURFACE,
          borderRadius: rem(8),
          minHeight: rem(38),
          display: "flex",
          alignItems: "center",
        }}
      >
        <Text size="sm" c={value ? INK : "dimmed"}>
          {value || "—"}
        </Text>
      </Box>
    </Box>
  );
}
