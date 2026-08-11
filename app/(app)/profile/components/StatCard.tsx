"use client";

import { Box, Text, rem } from "@mantine/core";
import { Card } from "@/components/ui/card";
import { INK } from "@/constants/colors";

interface StatCardProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
}

export function StatCard({ icon: Icon, iconBg, iconColor, label, value }: StatCardProps) {
  return (
    <Card
      p="md"
      style={{
        display: "flex",
        alignItems: "center",
        gap: rem(14),
      }}
    >
      <Box
        style={{
          width: rem(44),
          height: rem(44),
          borderRadius: rem(10),
          backgroundColor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={20} stroke={1.5} color={iconColor} />
      </Box>
      <Box>
        <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.06em" }} mb={2}>
          {label}
        </Text>
        <Text fw={700} size="lg" c={INK}>
          {value}
        </Text>
      </Box>
    </Card>
  );
}
