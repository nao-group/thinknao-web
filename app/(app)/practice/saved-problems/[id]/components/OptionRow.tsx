"use client";

import { Box, Text, rem } from "@mantine/core";
import { LatexText } from "@/components/latex-text";
import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import {
  SURFACE, MUTED,
  CORRECT_BG, CORRECT_BORDER, CORRECT_GREEN, CORRECT_DARK,
  WRONG_BG, WRONG_BORDER, WRONG_RED, WRONG_DARK,
} from "@/constants/colors";

export function OptionRow({
  optKey,
  text,
  isCorrect,
  isSelected,
}: {
  optKey: string;
  text: string;
  isCorrect: boolean;
  isSelected: boolean;
}) {
  let containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: rem(12),
    padding: `${rem(14)} ${rem(16)}`,
    borderRadius: rem(10),
    border: "1.5px solid #F1F5F9",
    backgroundColor: "white",
    width: "100%",
  };

  let circleStyle: React.CSSProperties = {
    width: rem(32),
    height: rem(32),
    borderRadius: "50%",
    backgroundColor: SURFACE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: rem(13),
    fontWeight: 700,
    color: MUTED,
  };

  let textColor = MUTED;
  let rightBadge: React.ReactNode = null;

  if (isCorrect) {
    containerStyle = { ...containerStyle, backgroundColor: CORRECT_BG, border: `1.5px solid ${CORRECT_BORDER}` };
    circleStyle = { ...circleStyle, backgroundColor: CORRECT_GREEN, color: "white" };
    textColor = CORRECT_DARK;
    rightBadge = (
      <Box style={{ marginLeft: "auto", padding: `${rem(2)} ${rem(8)}`, borderRadius: rem(999), backgroundColor: "#DCFCE7", flexShrink: 0 }}>
        <Text size="xs" fw={700} style={{ color: CORRECT_DARK, letterSpacing: "0.04em" }}>CORRECT</Text>
      </Box>
    );
  } else if (isSelected) {
    containerStyle = { ...containerStyle, backgroundColor: WRONG_BG, border: `1.5px solid ${WRONG_BORDER}` };
    circleStyle = { ...circleStyle, backgroundColor: WRONG_RED, color: "white" };
    textColor = WRONG_DARK;
    rightBadge = (
      <Box style={{ marginLeft: "auto", padding: `${rem(2)} ${rem(8)}`, borderRadius: rem(999), backgroundColor: "#FEE2E2", flexShrink: 0 }}>
        <Text size="xs" fw={700} style={{ color: WRONG_DARK, letterSpacing: "0.04em" }}>YOUR ANSWER</Text>
      </Box>
    );
  }

  return (
    <Box style={containerStyle}>
      <Box style={circleStyle}>
        {isCorrect ? (
          <IconCircleCheck size={18} stroke={2} color="white" />
        ) : isSelected ? (
          <IconCircleX size={18} stroke={2} color="white" />
        ) : (
          optKey
        )}
      </Box>
      <Text size="md" c={textColor} fw={isCorrect || isSelected ? 600 : 400} style={{ flex: 1 }}>
        <LatexText>{text}</LatexText>
      </Text>
      {rightBadge}
    </Box>
  );
}
