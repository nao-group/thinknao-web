"use client";

import { Box, Group, Text, UnstyledButton, rem } from "@mantine/core";

const PRIMARY = "#D4A017";
const INK = "#0F172A";
const MUTED = "#94A3B8";

export type Lang = "en" | "zh";

export function LanguageToggle({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
}) {
  return (
    <Group
      gap={0}
      style={{
        border: `1.5px solid ${lang === "zh" ? PRIMARY : "#E2E8F0"}`,
        borderRadius: rem(999),
        overflow: "hidden",
        flexShrink: 0,
        transition: "border-color 200ms ease",
      }}
    >
      {(["en", "zh"] as const).map((l) => (
        <UnstyledButton
          key={l}
          onClick={() => onChange(l)}
          style={{
            padding: `${rem(4)} ${rem(12)}`,
            backgroundColor: lang === l ? (l === "zh" ? PRIMARY : INK) : "transparent",
            transition: "background-color 150ms ease",
          }}
        >
          <Text
            size="xs"
            fw={700}
            c={lang === l ? "white" : MUTED}
            style={{ letterSpacing: l === "zh" ? "0.04em" : "0.06em" }}
          >
            {l === "en" ? "EN" : "中文"}
          </Text>
        </UnstyledButton>
      ))}
    </Group>
  );
}
