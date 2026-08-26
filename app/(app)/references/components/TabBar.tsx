"use client";

import { Box, Group, UnstyledButton, rem } from "@mantine/core";
import { PRIMARY, CREAM, MUTED, SURFACE } from "@/constants/colors";

export function TabBar({
  active,
  wordCount,
  formulaCount,
  onChange,
}: {
  active: "words" | "formulas";
  wordCount: number;
  formulaCount: number;
  onChange: (t: "words" | "formulas") => void;
}) {
  const tabs = [
    { key: "words" as const, label: "Words", count: wordCount },
    { key: "formulas" as const, label: "Formulas", count: formulaCount },
  ];
  return (
    <Group gap={0} style={{ borderBottom: "1px solid #E2E8F0" }}>
      {tabs.map((tab) => (
        <UnstyledButton
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            padding: `${rem(12)} ${rem(20)}`,
            borderBottom: active === tab.key ? `2px solid ${PRIMARY}` : "2px solid transparent",
            marginBottom: -1,
            color: active === tab.key ? PRIMARY : MUTED,
            fontWeight: active === tab.key ? 700 : 400,
            fontSize: rem(14),
            transition: "color 150ms ease",
            display: "flex",
            alignItems: "center",
            gap: rem(6),
          }}
        >
          {tab.label}
          <Box
            className="ui-pill"
            style={{
              backgroundColor: active === tab.key ? CREAM : SURFACE,
              fontSize: rem(11),
              fontWeight: 700,
              color: active === tab.key ? PRIMARY : MUTED,
            }}
          >
            {tab.count}
          </Box>
        </UnstyledButton>
      ))}
    </Group>
  );
}
