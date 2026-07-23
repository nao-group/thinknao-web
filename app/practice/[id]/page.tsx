"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Badge,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
  rem,
} from "@mantine/core";
import {
  IconBookmark,
  IconBookmarkFilled,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconFlag,
  IconFlagFilled,
  IconNotes,
} from "@tabler/icons-react";
import { FloatingChatbot } from "@/components/floating-chatbot";
import { LanguageToggle, type Lang } from "@/components/language-toggle";

import {
  INK, SURFACE, PRIMARY, CREAM, MUTED,
  CORRECT_BG, CORRECT_BORDER, CORRECT_GREEN, CORRECT_DARK,
  WRONG_BG, WRONG_BORDER, WRONG_RED, WRONG_DARK,
  NAV_CORRECT, NAV_WRONG,
} from "@/constants/colors";

// ─── Data ──────────────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: 1,
    topic: "Calculus",
    text: "What is the derivative of f(x) = x³ − 6x² + 9x + 1?",
    options: [
      { key: "A", text: "f′(x) = 3x² − 12x + 9" },
      { key: "B", text: "f′(x) = 3x² − 6x + 9" },
      { key: "C", text: "f′(x) = x² − 12x + 9" },
      { key: "D", text: "f′(x) = 3x² + 12x − 9" },
    ],
    correctAnswer: "A",
    explanation: {
      correctStatement: "A — f′(x) = 3x² − 12x + 9",
      intro: "Apply the Power Rule (d/dx[xⁿ] = n·xⁿ⁻¹) to each term:",
      steps: [
        "d/dx(x³) = 3x²",
        "d/dx(−6x²) = −12x",
        "d/dx(9x) = 9",
        "d/dx(1) = 0 — derivative of a constant is always 0",
      ],
      conclusion: "∴ f′(x) = 3x² − 12x + 9",
    },
    zh: {
      topic: "微积分",
      text: "f(x) = x³ − 6x² + 9x + 1 的导数是什么？",
      explanation: {
        correctStatement: "A — f′(x) = 3x² − 12x + 9",
        intro: "对每项应用幂次法则 (d/dx[xⁿ] = n·xⁿ⁻¹)：",
        steps: [
          "d/dx(x³) = 3x²",
          "d/dx(−6x²) = −12x",
          "d/dx(9x) = 9",
          "d/dx(1) = 0 — 常数的导数恒为零",
        ],
        conclusion: "∴ f′(x) = 3x² − 12x + 9",
      },
    },
  },
  {
    id: 2,
    topic: "Integration",
    text: "Evaluate the indefinite integral ∫(4x³ − 3x² + 2x − 1)dx.",
    options: [
      { key: "A", text: "x⁴ − x³ + x² − x + C" },
      { key: "B", text: "12x² − 6x + 2 + C" },
      { key: "C", text: "4x⁴ − 3x³ + 2x² − x + C" },
      { key: "D", text: "x⁴ − x³ + x² + C" },
    ],
    correctAnswer: "A",
    explanation: {
      correctStatement: "A — x⁴ − x³ + x² − x + C",
      intro: "Apply ∫xⁿ dx = xⁿ⁺¹/(n+1) + C to each term:",
      steps: [
        "∫4x³ dx = x⁴",
        "∫−3x² dx = −x³",
        "∫2x dx = x²",
        "∫−1 dx = −x",
      ],
      conclusion: "∴ x⁴ − x³ + x² − x + C",
    },
    zh: {
      topic: "积分",
      text: "计算不定积分 ∫(4x³ − 3x² + 2x − 1)dx。",
      explanation: {
        correctStatement: "A — x⁴ − x³ + x² − x + C",
        intro: "对每项应用 ∫xⁿ dx = xⁿ⁺¹/(n+1) + C：",
        steps: [
          "∫4x³ dx = x⁴",
          "∫−3x² dx = −x³",
          "∫2x dx = x²",
          "∫−1 dx = −x",
        ],
        conclusion: "∴ x⁴ − x³ + x² − x + C",
      },
    },
  },
  {
    id: 3,
    topic: "Calculus",
    text: "Find the derivative of the function f(x) = 3x³ − 2x² + 5x − 1. Which of the following correctly represents f′(x)?",
    options: [
      { key: "A", text: "f′(x) = 9x² − 4x + 5" },
      { key: "B", text: "f′(x) = 9x² − 4x − 1" },
      { key: "C", text: "f′(x) = 3x² − 4x + 5" },
      { key: "D", text: "f′(x) = 9x³ − 4x² + 5" },
    ],
    correctAnswer: "A",
    explanation: {
      correctStatement: "A — f′(x) = 9x² − 4x + 5",
      intro: "Apply the Power Rule (d/dx[xⁿ] = n·xⁿ⁻¹) to each term:",
      steps: [
        "d/dx(3x³) = 9x² — multiply coefficient 3 by exponent 3, reduce exponent by 1",
        "d/dx(−2x²) = −4x",
        "d/dx(5x) = 5 — derivative of a linear term is its coefficient",
        "d/dx(−1) = 0 — derivative of a constant is always 0",
      ],
      conclusion: "∴ f′(x) = 9x² − 4x + 5",
    },
    zh: {
      topic: "微积分",
      text: "求函数 f(x) = 3x³ − 2x² + 5x − 1 的导数。以下哪项正确表示 f′(x)？",
      explanation: {
        correctStatement: "A — f′(x) = 9x² − 4x + 5",
        intro: "对每项应用幂次法则 (d/dx[xⁿ] = n·xⁿ⁻¹)：",
        steps: [
          "d/dx(3x³) = 9x² — 系数3乘以指数3，指数减1",
          "d/dx(−2x²) = −4x",
          "d/dx(5x) = 5 — 线性项的导数为其系数",
          "d/dx(−1) = 0 — 常数的导数恒为零",
        ],
        conclusion: "∴ f′(x) = 9x² − 4x + 5",
      },
    },
  },
  {
    id: 4,
    topic: "Limits",
    text: "Find the limit: lim(x→2) of (x² − 4)/(x − 2).",
    options: [
      { key: "A", text: "0" },
      { key: "B", text: "4" },
      { key: "C", text: "2" },
      { key: "D", text: "Undefined", text_zh: "无定义" },
    ],
    correctAnswer: "B",
    explanation: {
      correctStatement: "B — 4",
      intro: "Factor the numerator and simplify:",
      steps: [
        "x² − 4 = (x−2)(x+2)",
        "(x−2)(x+2)/(x−2) = x+2 for x ≠ 2",
        "lim(x→2) (x+2) = 2 + 2 = 4",
      ],
      conclusion: "∴ The limit is 4",
    },
    zh: {
      topic: "极限",
      text: "求极限：lim(x→2) (x² − 4)/(x − 2)。",
      explanation: {
        correctStatement: "B — 4",
        intro: "对分子因式分解并化简：",
        steps: [
          "x² − 4 = (x−2)(x+2)",
          "(x−2)(x+2)/(x−2) = x+2（x ≠ 2）",
          "lim(x→2) (x+2) = 2 + 2 = 4",
        ],
        conclusion: "∴ 极限为 4",
      },
    },
  },
  {
    id: 5,
    topic: "Calculus",
    text: "What is the second derivative of f(x) = x⁴ − 3x² + 2?",
    options: [
      { key: "A", text: "12x² − 6" },
      { key: "B", text: "4x³ − 6x" },
      { key: "C", text: "12x² − 3" },
      { key: "D", text: "4x³ − 3" },
    ],
    correctAnswer: "A",
    explanation: {
      correctStatement: "A — 12x² − 6",
      intro: "Differentiate twice using the Power Rule:",
      steps: ["f′(x) = 4x³ − 6x", "f″(x) = 12x² − 6"],
      conclusion: "∴ f″(x) = 12x² − 6",
    },
    zh: {
      topic: "微积分",
      text: "f(x) = x⁴ − 3x² + 2 的二阶导数是什么？",
      explanation: {
        correctStatement: "A — 12x² − 6",
        intro: "两次运用幂次法则求导：",
        steps: ["f′(x) = 4x³ − 6x", "f″(x) = 12x² − 6"],
        conclusion: "∴ f″(x) = 12x² − 6",
      },
    },
  },
  {
    id: 6,
    topic: "Integration",
    text: "What is ∫₀¹ (3x² + 2x) dx?",
    options: [
      { key: "A", text: "2" },
      { key: "B", text: "3" },
      { key: "C", text: "4" },
      { key: "D", text: "1" },
    ],
    correctAnswer: "A",
    explanation: {
      correctStatement: "A — 2",
      intro: "Evaluate the definite integral:",
      steps: [
        "∫(3x² + 2x)dx = x³ + x²",
        "At x=1: 1 + 1 = 2",
        "At x=0: 0 + 0 = 0",
        "Result: 2 − 0 = 2",
      ],
      conclusion: "∴ The integral equals 2",
    },
    zh: {
      topic: "积分",
      text: "∫₀¹ (3x² + 2x) dx 等于多少？",
      explanation: {
        correctStatement: "A — 2",
        intro: "计算定积分：",
        steps: [
          "∫(3x² + 2x)dx = x³ + x²",
          "x=1 时：1 + 1 = 2",
          "x=0 时：0 + 0 = 0",
          "结果：2 − 0 = 2",
        ],
        conclusion: "∴ 积分值为 2",
      },
    },
  },
  {
    id: 7,
    topic: "Limits",
    text: "Using L'Hôpital's Rule, find lim(x→0) of sin(x)/x.",
    options: [
      { key: "A", text: "0" },
      { key: "B", text: "∞" },
      { key: "C", text: "1" },
      { key: "D", text: "Undefined", text_zh: "无定义" },
    ],
    correctAnswer: "C",
    explanation: {
      correctStatement: "C — 1",
      intro: "Apply L'Hôpital's Rule (0/0 indeterminate form):",
      steps: [
        "d/dx(sin x) = cos x",
        "d/dx(x) = 1",
        "lim(x→0) cos(x)/1 = cos(0) = 1",
      ],
      conclusion: "∴ lim(x→0) sin(x)/x = 1",
    },
    zh: {
      topic: "极限",
      text: "运用洛必达法则，求 lim(x→0) sin(x)/x。",
      explanation: {
        correctStatement: "C — 1",
        intro: "应用洛必达法则（0/0 不定式）：",
        steps: [
          "d/dx(sin x) = cos x",
          "d/dx(x) = 1",
          "lim(x→0) cos(x)/1 = cos(0) = 1",
        ],
        conclusion: "∴ lim(x→0) sin(x)/x = 1",
      },
    },
  },
  {
    id: 8,
    topic: "Calculus",
    text: "Find the critical points of f(x) = x³ − 3x + 2.",
    options: [
      { key: "A", text: "x = 1 and x = −1", text_zh: "x = 1 和 x = −1" },
      { key: "B", text: "x = 0 only", text_zh: "仅 x = 0" },
      { key: "C", text: "x = 3 and x = −3", text_zh: "x = 3 和 x = −3" },
      { key: "D", text: "x = 1 only", text_zh: "仅 x = 1" },
    ],
    correctAnswer: "A",
    explanation: {
      correctStatement: "A — x = 1 and x = −1",
      intro: "Set f′(x) = 0 and solve:",
      steps: ["f′(x) = 3x² − 3", "3x² − 3 = 0", "x² = 1", "x = ±1"],
      conclusion: "∴ Critical points at x = 1 and x = −1",
    },
    zh: {
      topic: "微积分",
      text: "求 f(x) = x³ − 3x + 2 的临界点。",
      explanation: {
        correctStatement: "A — x = 1 和 x = −1",
        intro: "令 f′(x) = 0 并求解：",
        steps: ["f′(x) = 3x² − 3", "3x² − 3 = 0", "x² = 1", "x = ±1"],
        conclusion: "∴ 临界点在 x = 1 和 x = −1",
      },
    },
  },
  {
    id: 9,
    topic: "Integration",
    text: "Evaluate ∫ e^(2x) dx.",
    options: [
      { key: "A", text: "e^(2x) + C" },
      { key: "B", text: "2e^(2x) + C" },
      { key: "C", text: "(1/2)e^(2x) + C" },
      { key: "D", text: "e^x + C" },
    ],
    correctAnswer: "C",
    explanation: {
      correctStatement: "C — (1/2)e^(2x) + C",
      intro: "Use substitution u = 2x:",
      steps: [
        "du = 2 dx, so dx = du/2",
        "∫ eᵘ (du/2) = (1/2)eᵘ + C",
        "Substitute back: (1/2)e^(2x) + C",
      ],
      conclusion: "∴ ∫ e^(2x) dx = (1/2)e^(2x) + C",
    },
    zh: {
      topic: "积分",
      text: "计算 ∫ e^(2x) dx。",
      explanation: {
        correctStatement: "C — (1/2)e^(2x) + C",
        intro: "令 u = 2x 进行换元：",
        steps: [
          "du = 2 dx，故 dx = du/2",
          "∫ eᵘ (du/2) = (1/2)eᵘ + C",
          "代入还原：(1/2)e^(2x) + C",
        ],
        conclusion: "∴ ∫ e^(2x) dx = (1/2)e^(2x) + C",
      },
    },
  },
  {
    id: 10,
    topic: "Calculus",
    text: "What is the slope of the tangent line to y = x² + 3x at x = 2?",
    options: [
      { key: "A", text: "7" },
      { key: "B", text: "10" },
      { key: "C", text: "4" },
      { key: "D", text: "3" },
    ],
    correctAnswer: "A",
    explanation: {
      correctStatement: "A — 7",
      intro: "Find f′(x) and evaluate at x = 2:",
      steps: ["f′(x) = 2x + 3", "f′(2) = 2(2) + 3 = 4 + 3 = 7"],
      conclusion: "∴ Slope of tangent at x = 2 is 7",
    },
    zh: {
      topic: "微积分",
      text: "y = x² + 3x 在 x = 2 处切线的斜率是多少？",
      explanation: {
        correctStatement: "A — 7",
        intro: "求 f′(x) 并代入 x = 2：",
        steps: ["f′(x) = 2x + 3", "f′(2) = 2(2) + 3 = 4 + 3 = 7"],
        conclusion: "∴ x = 2 处切线斜率为 7",
      },
    },
  },
  {
    id: 11,
    topic: "Limits",
    text: "What is lim(x→∞) of (3x² + 2x)/(x² − 1)?",
    options: [
      { key: "A", text: "0" },
      { key: "B", text: "∞" },
      { key: "C", text: "2" },
      { key: "D", text: "3" },
    ],
    correctAnswer: "D",
    explanation: {
      correctStatement: "D — 3",
      intro: "Divide numerator and denominator by x²:",
      steps: [
        "(3 + 2/x) / (1 − 1/x²)",
        "As x→∞, 2/x → 0 and 1/x² → 0",
        "Result: 3/1 = 3",
      ],
      conclusion: "∴ The limit is 3",
    },
    zh: {
      topic: "极限",
      text: "lim(x→∞) (3x² + 2x)/(x² − 1) 等于多少？",
      explanation: {
        correctStatement: "D — 3",
        intro: "分子分母同除以 x²：",
        steps: [
          "(3 + 2/x) / (1 − 1/x²)",
          "当 x→∞，2/x → 0，1/x² → 0",
          "结果：3/1 = 3",
        ],
        conclusion: "∴ 极限为 3",
      },
    },
  },
  {
    id: 12,
    topic: "Integration",
    text: "Find the area under the curve y = 2x from x = 0 to x = 3.",
    options: [
      { key: "A", text: "6" },
      { key: "B", text: "9" },
      { key: "C", text: "12" },
      { key: "D", text: "18" },
    ],
    correctAnswer: "B",
    explanation: {
      correctStatement: "B — 9",
      intro: "Evaluate the definite integral:",
      steps: ["∫₀³ 2x dx = [x²]₀³", "= 3² − 0² = 9 − 0 = 9"],
      conclusion: "∴ Area = 9 square units",
    },
    zh: {
      topic: "积分",
      text: "求曲线 y = 2x 在 x = 0 到 x = 3 之间的面积。",
      explanation: {
        correctStatement: "B — 9",
        intro: "计算定积分：",
        steps: ["∫₀³ 2x dx = [x²]₀³", "= 3² − 0² = 9 − 0 = 9"],
        conclusion: "∴ 面积 = 9 平方单位",
      },
    },
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function OptionButton({
  optKey,
  text,
  selected,
  submitted,
  isCorrect,
  isUserAnswer,
}: {
  optKey: string;
  text: string;
  selected: boolean;
  submitted: boolean;
  isCorrect: boolean;
  isUserAnswer: boolean;
}) {
  let containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: rem(12),
    padding: `${rem(14)} ${rem(16)}`,
    borderRadius: rem(10),
    border: "1.5px solid #E2E8F0",
    backgroundColor: "white",
    cursor: submitted ? "default" : "pointer",
    width: "100%",
    transition: "all 150ms ease",
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

  let textColor = INK;
  let rightBadge: React.ReactNode = null;

  if (!submitted) {
    if (selected) {
      containerStyle = {
        ...containerStyle,
        backgroundColor: CREAM,
        border: `2px solid ${PRIMARY}`,
      };
      circleStyle = {
        ...circleStyle,
        backgroundColor: PRIMARY,
        color: INK,
      };
    }
  } else {
    if (isCorrect) {
      containerStyle = {
        ...containerStyle,
        backgroundColor: CORRECT_BG,
        border: `1.5px solid ${CORRECT_BORDER}`,
      };
      circleStyle = {
        ...circleStyle,
        backgroundColor: CORRECT_GREEN,
        color: "white",
      };
      textColor = CORRECT_DARK;
      rightBadge = (
        <Box
          style={{
            marginLeft: "auto",
            padding: `${rem(2)} ${rem(8)}`,
            borderRadius: rem(999),
            backgroundColor: "#DCFCE7",
            flexShrink: 0,
          }}
        >
          <Text size="xs" fw={700} c={CORRECT_DARK}>
            CORRECT
          </Text>
        </Box>
      );
    } else if (isUserAnswer) {
      containerStyle = {
        ...containerStyle,
        backgroundColor: WRONG_BG,
        border: `1.5px solid ${WRONG_BORDER}`,
      };
      circleStyle = {
        ...circleStyle,
        backgroundColor: WRONG_RED,
        color: "white",
      };
      textColor = WRONG_DARK;
      rightBadge = (
        <Box
          style={{
            marginLeft: "auto",
            padding: `${rem(2)} ${rem(8)}`,
            borderRadius: rem(999),
            backgroundColor: "#FEE2E2",
            flexShrink: 0,
          }}
        >
          <Text size="xs" fw={700} c={WRONG_DARK}>
            YOUR ANSWER
          </Text>
        </Box>
      );
    } else {
      containerStyle = {
        ...containerStyle,
        backgroundColor: "white",
        border: "1.5px solid #F1F5F9",
      };
      circleStyle = {
        ...circleStyle,
        color: "#CBD5E1",
      };
      textColor = "#94A3B8";
    }
  }

  return (
    <Box style={containerStyle}>
      <Box style={circleStyle}>
        {submitted && isCorrect ? (
          <IconCircleCheck size={18} stroke={2.5} color="white" style={{ display: "block" }} />
        ) : submitted && isUserAnswer && !isCorrect ? (
          <IconCircleX size={18} stroke={2.5} color="white" style={{ display: "block" }} />
        ) : (
          <Text size="xs" fw={700} style={{ color: "inherit" }}>
            {optKey}
          </Text>
        )}
      </Box>
      <Text size="sm" fw={500} c={textColor} style={{ flex: 1 }}>
        {text}
      </Text>
      {rightBadge}
    </Box>
  );
}

function ExplanationBox({
  explanation,
}: {
  explanation: (typeof QUESTIONS)[number]["explanation"];
}) {
  return (
    <Box
      mt="md"
      style={{
        backgroundColor: "#FFF9EC",
        borderLeft: `4px solid ${PRIMARY}`,
        borderRadius: rem(10),
        padding: rem(20),
      }}
    >
      <Group gap={8} mb={rem(10)}>
        <IconNotes size={18} stroke={1.5} color={PRIMARY} />
        <Text size="sm" fw={700} c={PRIMARY}>
          Answer Key &amp; Explanation
        </Text>
      </Group>
      <Text size="sm" fw={700} c={CORRECT_DARK} mb={rem(8)}>
        Correct Answer: {explanation.correctStatement}
      </Text>
      <Text size="sm" c={INK} mb={rem(8)}>
        {explanation.intro}
      </Text>
      <Stack gap={rem(4)} mb={rem(12)}>
        {explanation.steps.map((step, i) => (
          <Group key={i} gap={rem(8)} align="flex-start">
            <Box
              style={{
                width: rem(6),
                height: rem(6),
                borderRadius: "50%",
                backgroundColor: PRIMARY,
                marginTop: rem(7),
                flexShrink: 0,
              }}
            />
            <Text size="sm" c={INK}>
              {step}
            </Text>
          </Group>
        ))}
      </Stack>
      <Box
        style={{
          backgroundColor: "#F5E6CC",
          borderRadius: rem(8),
          padding: `${rem(8)} ${rem(12)}`,
        }}
      >
        <Text size="sm" fw={700} c={CORRECT_DARK}>
          {explanation.conclusion}
        </Text>
      </Box>
    </Box>
  );
}

function ProgressCard({
  total,
  submittedSet,
  answers,
  flaggedSet,
}: {
  total: number;
  submittedSet: Set<number>;
  answers: Record<number, string>;
  flaggedSet: Set<number>;
}) {
  const correct = [...submittedSet].filter(
    (i) => answers[i] === QUESTIONS[i].correctAnswer
  ).length;
  const wrong = submittedSet.size - correct;
  const flaggedNotSubmitted = [...flaggedSet].filter(
    (i) => !submittedSet.has(i)
  ).length;
  const remaining = total - submittedSet.size - flaggedNotSubmitted;

  const correctPct = (correct / total) * 100;
  const wrongPct = (wrong / total) * 100;
  const flaggedPct = (flaggedNotSubmitted / total) * 100;
  const remainingPct = (remaining / total) * 100;

  return (
    <Box
      p="lg"
      style={{ backgroundColor: "white", borderRadius: rem(14) }}
    >
      <Group justify="space-between" mb={rem(10)}>
        <Text size="sm" fw={700} c={INK}>
          Progress
        </Text>
        <Text size="sm" fw={700} c={PRIMARY}>
          {submittedSet.size} / {total}
        </Text>
      </Group>

      {/* Segmented bar */}
      <Box
        style={{
          display: "flex",
          height: rem(8),
          borderRadius: rem(999),
          overflow: "hidden",
          backgroundColor: SURFACE,
          marginBottom: rem(10),
        }}
      >
        {correctPct > 0 && (
          <Box style={{ width: `${correctPct}%`, backgroundColor: CORRECT_GREEN }} />
        )}
        {wrongPct > 0 && (
          <Box style={{ width: `${wrongPct}%`, backgroundColor: WRONG_RED }} />
        )}
        {flaggedPct > 0 && (
          <Box style={{ width: `${flaggedPct}%`, backgroundColor: PRIMARY }} />
        )}
        {remainingPct > 0 && (
          <Box style={{ width: `${remainingPct}%`, backgroundColor: "#CBD5E1" }} />
        )}
      </Box>

      <Group gap="md">
        <Group gap={rem(5)}>
          <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: CORRECT_GREEN, flexShrink: 0 }} />
          <Text size="xs" c={MUTED}>{correct} correct</Text>
        </Group>
        <Group gap={rem(5)}>
          <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: WRONG_RED, flexShrink: 0 }} />
          <Text size="xs" c={MUTED}>{wrong} wrong</Text>
        </Group>
        <Group gap={rem(5)}>
          <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: "#CBD5E1", flexShrink: 0 }} />
          <Text size="xs" c={MUTED}>{remaining} left</Text>
        </Group>
      </Group>
    </Box>
  );
}

function QuestionNavigator({
  total,
  currentQ,
  submittedSet,
  answers,
  flaggedSet,
  onJump,
}: {
  total: number;
  currentQ: number;
  submittedSet: Set<number>;
  answers: Record<number, string>;
  flaggedSet: Set<number>;
  onJump: (idx: number) => void;
}) {
  function getQStatus(idx: number): "correct" | "wrong" | "flagged" | "unanswered" {
    if (submittedSet.has(idx)) {
      return answers[idx] === QUESTIONS[idx].correctAnswer ? "correct" : "wrong";
    }
    if (flaggedSet.has(idx)) return "flagged";
    return "unanswered";
  }

  function getNavStyle(idx: number): React.CSSProperties {
    const status = getQStatus(idx);
    const isCurrent = idx === currentQ;

    const base: React.CSSProperties = {
      width: rem(48),
      height: rem(48),
      borderRadius: rem(10),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: rem(14),
      fontWeight: 500,
      cursor: "pointer",
      border: "none",
      transition: "box-shadow 150ms ease",
      boxShadow: isCurrent ? `0 0 0 3px ${INK}` : "none",
    };

    const flaggedBorder = flaggedSet.has(idx) ? { border: `2px solid ${PRIMARY}` } : {};

    switch (status) {
      case "correct":
        return { ...base, backgroundColor: NAV_CORRECT, color: "white", fontWeight: 700, ...flaggedBorder };
      case "wrong":
        return { ...base, backgroundColor: NAV_WRONG, color: "white", fontWeight: 700, ...flaggedBorder };
      case "flagged":
        return {
          ...base,
          backgroundColor: CREAM,
          color: PRIMARY,
          fontWeight: 700,
          border: `2px solid ${PRIMARY}`,
        };
      default:
        return { ...base, backgroundColor: SURFACE, color: "#94A3B8", fontWeight: 500 };
    }
  }

  return (
    <Box p="lg" style={{ backgroundColor: "white", borderRadius: rem(14) }}>
      <Text size="sm" fw={700} c={INK} mb="md">
        Questions
      </Text>
      <SimpleGrid cols={4} spacing={rem(8)}>
        {Array.from({ length: total }, (_, i) => (
          <UnstyledButton key={i} onClick={() => onJump(i)} style={getNavStyle(i)}>
            {i + 1}
          </UnstyledButton>
        ))}
      </SimpleGrid>

      {/* Legend */}
      <SimpleGrid cols={2} spacing={rem(6)} mt="md">
        <Group gap={rem(6)}>
          <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: NAV_CORRECT, flexShrink: 0 }} />
          <Text size="xs" c={MUTED}>Correct</Text>
        </Group>
        <Group gap={rem(6)}>
          <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: NAV_WRONG, flexShrink: 0 }} />
          <Text size="xs" c={MUTED}>Wrong</Text>
        </Group>
        <Group gap={rem(6)}>
          <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: PRIMARY, flexShrink: 0 }} />
          <Text size="xs" c={MUTED}>Flagged</Text>
        </Group>
        <Group gap={rem(6)}>
          <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: "#CBD5E1", flexShrink: 0 }} />
          <Text size="xs" c={MUTED}>Not answered</Text>
        </Group>
      </SimpleGrid>
    </Box>
  );
}

// ─── Summary ───────────────────────────────────────────────────────────────────

function SummaryView({
  questions,
  answers,
  submittedSet,
  totalSeconds,
  lang,
  onBack,
}: {
  questions: typeof QUESTIONS;
  answers: Record<number, string>;
  submittedSet: Set<number>;
  totalSeconds: number;
  lang: Lang;
  onBack: () => void;
}) {
  const correct = questions.filter(
    (q, i) => submittedSet.has(i) && answers[i] === q.correctAnswer
  ).length;
  const wrong = submittedSet.size - correct;
  const skipped = questions.length - submittedSet.size;
  const scorePct = Math.round((correct / questions.length) * 100);

  const scoreColor =
    scorePct >= 70 ? CORRECT_GREEN : scorePct >= 40 ? PRIMARY : WRONG_RED;
  const scoreBg =
    scorePct >= 70 ? CORRECT_BG : scorePct >= 40 ? "#FFF9EC" : WRONG_BG;

  return (
    <Stack gap="md">
      {/* ── Score header ── */}
      <Box p="xl" style={{ backgroundColor: "white", borderRadius: rem(14) }}>
        <Group justify="space-between" align="flex-start" mb="lg" wrap="nowrap">
          <Box>
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.07em" }} mb={4}>
              Practice Complete
            </Text>
            <Text fw={800} size="xl" c={INK}>Your Results</Text>
          </Box>
          <Group gap={6} style={{ flexShrink: 0 }}>
            <IconClock size={14} stroke={1.5} color={MUTED} />
            <Text size="sm" fw={600} c={MUTED}>{formatTime(totalSeconds)}</Text>
          </Group>
        </Group>

        {/* Score display */}
        <Group align="center" gap="xl" mb="lg" wrap="nowrap">
          <Box
            style={{
              width: rem(96),
              height: rem(96),
              borderRadius: "50%",
              backgroundColor: scoreBg,
              border: `3px solid ${scoreColor}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Text fw={800} size="xl" c={scoreColor} lh={1}>{scorePct}%</Text>
            <Text size="xs" c={scoreColor} fw={600}>{correct}/{questions.length}</Text>
          </Box>

          <Box style={{ flex: 1 }}>
            {/* Progress bar */}
            <Box
              mb="md"
              style={{
                height: rem(10),
                borderRadius: rem(999),
                backgroundColor: SURFACE,
                overflow: "hidden",
                display: "flex",
              }}
            >
              {correct > 0 && (
                <Box style={{ width: `${(correct / questions.length) * 100}%`, backgroundColor: CORRECT_GREEN, transition: "width 600ms ease" }} />
              )}
              {wrong > 0 && (
                <Box style={{ width: `${(wrong / questions.length) * 100}%`, backgroundColor: WRONG_RED }} />
              )}
              {skipped > 0 && (
                <Box style={{ width: `${(skipped / questions.length) * 100}%`, backgroundColor: "#CBD5E1" }} />
              )}
            </Box>

            {/* Stat pills */}
            <SimpleGrid cols={3} spacing="xs">
              <Box p="sm" style={{ backgroundColor: CORRECT_BG, borderRadius: rem(10), textAlign: "center" }}>
                <Group gap={4} justify="center" mb={2}>
                  <IconCircleCheck size={14} stroke={2} color={CORRECT_GREEN} />
                  <Text size="xs" fw={700} c={CORRECT_GREEN}>Correct</Text>
                </Group>
                <Text fw={800} size="lg" c={CORRECT_DARK}>{correct}</Text>
              </Box>
              <Box p="sm" style={{ backgroundColor: WRONG_BG, borderRadius: rem(10), textAlign: "center" }}>
                <Group gap={4} justify="center" mb={2}>
                  <IconCircleX size={14} stroke={2} color={WRONG_RED} />
                  <Text size="xs" fw={700} c={WRONG_RED}>Wrong</Text>
                </Group>
                <Text fw={800} size="lg" c={WRONG_DARK}>{wrong}</Text>
              </Box>
              <Box p="sm" style={{ backgroundColor: SURFACE, borderRadius: rem(10), textAlign: "center" }}>
                <Group gap={4} justify="center" mb={2}>
                  <IconFlag size={14} stroke={1.5} color={MUTED} />
                  <Text size="xs" fw={700} c={MUTED}>Skipped</Text>
                </Group>
                <Text fw={800} size="lg" c={INK}>{skipped}</Text>
              </Box>
            </SimpleGrid>
          </Box>
        </Group>

        <Button
          variant="outline"
          color="dark"
          radius="md"
          leftSection={<IconChevronLeft size={14} stroke={2} />}
          onClick={onBack}
        >
          Back to Practice Sets
        </Button>
      </Box>

      {/* ── Question review list ── */}
      <Text fw={700} size="sm" c={INK} px={2}>Answer Key &amp; Review</Text>

      {questions.map((q, i) => {
        const submitted = submittedSet.has(i);
        const userAns = answers[i];
        const isCorrectQ = submitted && userAns === q.correctAnswer;
        const displayText = lang === "zh" ? (q.zh?.text ?? q.text) : q.text;
        const displayTopic = lang === "zh" ? (q.zh?.topic ?? q.topic) : q.topic;
        const explanation = lang === "zh" ? (q.zh?.explanation ?? q.explanation) : q.explanation;

        const resultLabel = !submitted ? "Skipped" : isCorrectQ ? "Correct" : "Wrong";
        const resultBg = !submitted ? SURFACE : isCorrectQ ? "#DCFCE7" : "#FEE2E2";
        const resultColor = !submitted ? MUTED : isCorrectQ ? CORRECT_GREEN : WRONG_RED;

        return (
          <Box
            key={i}
            p="lg"
            className="no-select"
            style={{ backgroundColor: "white", borderRadius: rem(14) }}
          >
            {/* Header */}
            <Group justify="space-between" align="center" mb="md">
              <Group gap={8}>
                <Badge
                  size="sm"
                  style={{ backgroundColor: INK, color: "white", fontWeight: 700, borderRadius: rem(999) }}
                >
                  Q{i + 1}
                </Badge>
                <Badge
                  size="sm"
                  style={{ backgroundColor: CREAM, color: PRIMARY, fontWeight: 600, borderRadius: rem(999) }}
                >
                  {displayTopic}
                </Badge>
              </Group>
              <Box
                px="sm"
                py={3}
                style={{ backgroundColor: resultBg, borderRadius: rem(999) }}
              >
                <Text size="xs" fw={700} c={resultColor}>{resultLabel}</Text>
              </Box>
            </Group>

            {/* Question text */}
            <Box mb="md" p="md" style={{ backgroundColor: SURFACE, borderRadius: rem(10) }}>
              <Text size="sm" c={INK} lh={1.7}>{displayText}</Text>
            </Box>

            {/* Options */}
            <Stack gap={rem(8)} mb="md">
              {q.options.map((opt) => {
                const optIsCorrect = opt.key === q.correctAnswer;
                const optIsUserWrong = submitted && opt.key === userAns && !optIsCorrect;
                const optText = lang === "zh"
                  ? ((opt as { text_zh?: string }).text_zh ?? opt.text)
                  : opt.text;
                return (
                  <OptionButton
                    key={opt.key}
                    optKey={opt.key}
                    text={optText}
                    selected={false}
                    submitted={true}
                    isCorrect={optIsCorrect}
                    isUserAnswer={optIsUserWrong}
                  />
                );
              })}
            </Stack>

            {/* Explanation */}
            <ExplanationBox explanation={explanation} />
          </Box>
        );
      })}
    </Stack>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PracticeDetailPage() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(2);
  const [answers, setAnswers] = useState<Record<number, string>>({ 0: "A", 1: "A", 2: "B" });
  const [submittedSet, setSubmittedSet] = useState<Set<number>>(new Set([0, 1, 2]));
  const [flaggedSet, setFlaggedSet] = useState<Set<number>>(new Set([6]));
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());
  const [elapsedSeconds, setElapsedSeconds] = useState(1122); // 18:42
  const [finished, setFinished] = useState(false);

  // Selected option for current question (before submission)
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("en");

  // Timer — stops when finished
  useEffect(() => {
    if (finished) return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [finished]);

  const q = QUESTIONS[currentQ];
  const isSubmitted = submittedSet.has(currentQ);
  const userAnswer = isSubmitted ? answers[currentQ] : pendingAnswer;

  function handleOptionSelect(key: string) {
    if (isSubmitted) return;
    setPendingAnswer(key);
  }

  function handleSubmit() {
    if (!pendingAnswer || isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [currentQ]: pendingAnswer }));
    setSubmittedSet((prev) => {
      const next = new Set(prev);
      next.add(currentQ);
      return next;
    });
  }

  function handlePrev() {
    if (currentQ === 0) return;
    setPendingAnswer(null);
    setCurrentQ((q) => q - 1);
  }

  function handleNext() {
    if (currentQ === QUESTIONS.length - 1) return;
    setPendingAnswer(null);
    setCurrentQ((q) => q + 1);
  }

  function handleJump(idx: number) {
    setPendingAnswer(null);
    setCurrentQ(idx);
  }

  function toggleFlag() {
    setFlaggedSet((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ)) next.delete(currentQ);
      else next.add(currentQ);
      return next;
    });
  }

  function toggleBookmark() {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(currentQ)) next.delete(currentQ);
      else next.add(currentQ);
      return next;
    });
  }

  if (finished) {
    return (
      <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <Box p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
          <SummaryView
            questions={QUESTIONS}
            answers={answers}
            submittedSet={submittedSet}
            totalSeconds={elapsedSeconds}
            lang={lang}
            onBack={() => router.push("/practice")}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
        <Group align="flex-start" gap="xl" wrap="nowrap" style={{ alignItems: "stretch" }}>
          {/* ── Left column ── */}
          <Stack style={{ flex: 1, minWidth: 0 }} gap="md">
            {/* Question Card */}
            <Box
              p="lg"
              className="no-select"
              style={{ backgroundColor: "white", borderRadius: rem(14) }}
            >
              {/* Header row */}
              <Group justify="space-between" align="center" mb="md" wrap="nowrap">
                <Group gap={rem(8)} wrap="nowrap" style={{ minWidth: 0 }}>
                  <Badge
                    size="sm"
                    style={{
                      backgroundColor: INK,
                      color: "white",
                      fontWeight: 700,
                      borderRadius: rem(999),
                      flexShrink: 0,
                    }}
                  >
                    Question {currentQ + 1}
                  </Badge>
                  <Badge
                    size="sm"
                    style={{
                      backgroundColor: CREAM,
                      color: PRIMARY,
                      fontWeight: 600,
                      borderRadius: rem(999),
                      flexShrink: 0,
                    }}
                  >
                    {lang === "zh" ? (q.zh?.topic ?? q.topic) : q.topic}
                  </Badge>
                </Group>
                <Group gap={rem(6)} wrap="nowrap" style={{ flexShrink: 0 }}>
                  <LanguageToggle lang={lang} onChange={setLang} />
                  <Tooltip label={flaggedSet.has(currentQ) ? "Remove flag" : "Flag question"} withArrow>
                    <UnstyledButton
                      onClick={toggleFlag}
                      style={{
                        width: rem(32),
                        height: rem(32),
                        borderRadius: rem(8),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: flaggedSet.has(currentQ) ? "#FFF9EC" : SURFACE,
                      }}
                    >
                      {flaggedSet.has(currentQ) ? (
                        <IconFlagFilled size={16} color={PRIMARY} />
                      ) : (
                        <IconFlag size={16} color={MUTED} />
                      )}
                    </UnstyledButton>
                  </Tooltip>
                  <Tooltip label={bookmarked.has(currentQ) ? "Remove bookmark" : "Bookmark question"} withArrow>
                    <UnstyledButton
                      onClick={toggleBookmark}
                      style={{
                        width: rem(32),
                        height: rem(32),
                        borderRadius: rem(8),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: bookmarked.has(currentQ) ? "#FFF9EC" : SURFACE,
                      }}
                    >
                      {bookmarked.has(currentQ) ? (
                        <IconBookmarkFilled size={16} color={PRIMARY} />
                      ) : (
                        <IconBookmark size={16} color={MUTED} />
                      )}
                    </UnstyledButton>
                  </Tooltip>
                  <Group gap={rem(5)} style={{ flexShrink: 0 }}>
                    <IconClock size={15} color={MUTED} stroke={1.5} />
                    <Text size="sm" fw={600} c={MUTED} style={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatTime(elapsedSeconds)}
                    </Text>
                  </Group>
                </Group>
              </Group>

              {/* Question text */}
              <Box
                mb="md"
                p="md"
                style={{ backgroundColor: SURFACE, borderRadius: rem(10) }}
              >
                <Text size="sm" c={INK} lh={1.7}>
                  {lang === "zh" ? (q.zh?.text ?? q.text) : q.text}
                </Text>
              </Box>

              {/* Options */}
              <Stack gap={rem(8)}>
                {q.options.map((opt) => {
                  const isCorrect = isSubmitted && opt.key === q.correctAnswer;
                  const isUserAns = isSubmitted && opt.key === answers[currentQ];
                  return (
                    <UnstyledButton
                      key={opt.key}
                      onClick={() => handleOptionSelect(opt.key)}
                      disabled={isSubmitted}
                      style={{ width: "100%", cursor: isSubmitted ? "default" : "pointer" }}
                    >
                      <OptionButton
                        optKey={opt.key}
                        text={lang === "zh" ? ((opt as { text_zh?: string }).text_zh ?? opt.text) : opt.text}
                        selected={userAnswer === opt.key}
                        submitted={isSubmitted}
                        isCorrect={isCorrect}
                        isUserAnswer={isUserAns}
                      />
                    </UnstyledButton>
                  );
                })}
              </Stack>

              {/* Explanation (shown after submission) */}
              {isSubmitted && (
                <ExplanationBox explanation={lang === "zh" ? (q.zh?.explanation ?? q.explanation) : q.explanation} />
              )}
            </Box>

            {/* Navigation buttons */}
            <Group justify="space-between" align="center">
              <Button
                variant="outline"
                radius="xl"
                leftSection={<IconChevronLeft size={15} stroke={2} />}
                disabled={currentQ === 0}
                onClick={handlePrev}
                style={{ borderColor: "#E2E8F0", color: INK }}
              >
                Previous
              </Button>

              {isSubmitted ? (
                <Button
                  disabled
                  radius="md"
                  leftSection={<IconCheck size={15} stroke={2.5} />}
                  style={{ backgroundColor: SURFACE, color: MUTED, cursor: "default" }}
                >
                  Submitted
                </Button>
              ) : (
                <Button
                  radius="md"
                  onClick={handleSubmit}
                  disabled={!pendingAnswer}
                  style={{
                    backgroundColor: pendingAnswer ? PRIMARY : SURFACE,
                    color: pendingAnswer ? "white" : MUTED,
                    fontWeight: 600,
                  }}
                >
                  Submit
                </Button>
              )}

              {currentQ === QUESTIONS.length - 1 ? (
                <Button
                  radius="xl"
                  leftSection={<IconCheck size={15} stroke={2.5} />}
                  onClick={() => setFinished(true)}
                  style={{ backgroundColor: CORRECT_GREEN, color: "white", fontWeight: 600 }}
                >
                  Finish
                </Button>
              ) : (
                <Button
                  radius="xl"
                  rightSection={<IconChevronRight size={15} stroke={2} />}
                  onClick={handleNext}
                  style={{ backgroundColor: INK, color: "white", fontWeight: 600 }}
                >
                  Next Question
                </Button>
              )}
            </Group>
          </Stack>

          {/* ── Right panel ── */}
          <Box
            visibleFrom="lg"
            style={{ width: rem(272), flexShrink: 0 }}
          >
            <Stack gap="md">
              <ProgressCard
                total={QUESTIONS.length}
                submittedSet={submittedSet}
                answers={answers}
                flaggedSet={flaggedSet}
              />
              <QuestionNavigator
                total={QUESTIONS.length}
                currentQ={currentQ}
                submittedSet={submittedSet}
                answers={answers}
                flaggedSet={flaggedSet}
                onJump={handleJump}
              />
            </Stack>
          </Box>
        </Group>
      </Box>

      <FloatingChatbot
        questionContext={[
          `Topic: ${q.topic}`,
          `Question: ${q.text}`,
          `Options:`,
          ...q.options.map((o) => `  ${o.key}. ${o.text}`),
        ].join("\n")}
      />
    </Box>
  );
}
