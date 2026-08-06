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
  IconAlertCircle,
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
import { LatexText } from "@/components/latex-text";
import { MarkdownLatexText } from "@/components/markdown-latex-text";
import { ReportModal } from "@/components/report-modal";
import { LanguageToggle, type Lang } from "@/components/language-toggle";

import {
  INK, SURFACE, PRIMARY, CREAM, MUTED,
  CORRECT_BG, CORRECT_BORDER, CORRECT_GREEN, CORRECT_DARK,
  WRONG_BG, WRONG_BORDER, WRONG_RED, WRONG_DARK,
  NAV_CORRECT, NAV_WRONG,
} from "@/constants/colors";
import { DragDropParagraph } from "./DragDropParagraph";
import { WordBankSet } from "./WordBankSet";
import { PassageQuestionGroup } from "./PassageQuestionGroup";
import type { ApiQuestion, QuestionGroup, FillAnswerMap, SubmitResult, BlankResult } from "./types";

// ─── Mock question groups (one of each type) ──────────────────────────────────

const MOCK_GROUPS: QuestionGroup[] = [
  // ── 1. DT — drag single passage blanks ──────────────────────────────────────
  {
    type: "DT",
    group_id: "mock-dt-1",
    questions: [
      {
        id: "mock-dt-q1",
        code: "SC-DT-001",
        difficulty: "medium",
        question_type: "DT",
        group_id: "mock-dt-1",
        passage: null,
        image_url: null,
        content_zh: {
          question:
            "化石能源是{1}能源，它是在古代动、植物经过长期的生物、化学{2}形成的{3}物的基础上产生的。石油、天然气等都属于一次能源，它们的加工和燃烧会造成环境{4}，所以寻找更环保的能源已经成为各国当前的重要{5}。",
          correct_answers: { "1": "A", "2": "B", "3": "C", "4": "D", "5": "E" },
          explanation: `{1}\`一次 (primary)\` — 化石能源属于**一次能源**，直接从自然界获取，无需二次转化。选项F"二次"（secondary）是干扰项。

{2}\`变化 (change)\` — 古代动植物经过长期的**生物、化学变化**（biological and chemical changes）逐渐转化为化石燃料。

{3}\`沉积 (sediment)\` — 有机物经过漫长地质年代的压缩与沉积，形成**沉积物**（sedimentary matter），最终成为石油、天然气等。

{4}\`污染 (pollution)\` — 化石能源的加工和燃烧会产生CO₂、SO₂等有害气体，造成**环境污染**（environmental pollution）。

{5}\`课题 (issue/topic)\` — 寻找更清洁能源已成为全球重要的研究**课题**（research topic）。

> 正确答案 / Correct answers: {1} A · {2} B · {3} C · {4} D · {5} E`,
        },
        content_en: {
          question:
            "Fossil energy is {1} energy, produced from {3} matter formed by ancient plants and animals through long-term biological and chemical {2}. Petroleum and natural gas all belong to primary energy. Their processing and combustion cause environmental {4}, so finding cleaner energy sources has become an important {5} for all countries.",
        },
        choices: [
          { key: "A", text: "一次 (primary)" },
          { key: "B", text: "变化 (change)" },
          { key: "C", text: "沉积 (sediment)" },
          { key: "D", text: "污染 (pollution)" },
          { key: "E", text: "课题 (issue)" },
          { key: "F", text: "二次 (secondary)" },
        ],
      },
    ],
  },

  // ── 2. XT — word bank shared across multiple sentences ───────────────────────
  {
    type: "XT",
    group_id: "mock-xt-1",
    questions: [
      {
        id: "mock-xt-q1",
        code: "SC-XT-001",
        difficulty: "medium",
        question_type: "XT",
        group_id: "mock-xt-1",
        passage: null,
        image_url: null,
        content_zh: { question: "月亮绕地球{1}，产生了月相变化现象。", correct_answers: { "1": "A" } },
        content_en: { question: "The moon {1} around Earth, producing the phases of the moon." },
        choices: [
          { key: "A", text: "公转 (orbit)" },
          { key: "B", text: "发光 (emit light)" },
          { key: "C", text: "相对 (relatively)" },
          { key: "D", text: "静止 (stationary)" },
        ],
      },
      {
        id: "mock-xt-q2",
        code: "SC-XT-002",
        difficulty: "medium",
        question_type: "XT",
        group_id: "mock-xt-1",
        passage: null,
        image_url: null,
        content_zh: { question: "月球本身不{1}，我们看到的是太阳照射后反射的光。", correct_answers: { "1": "B" } },
        content_en: { question: "The moon does not {1} light itself; what we see is sunlight reflected off its surface." },
        choices: null,
      },
      {
        id: "mock-xt-q3",
        code: "SC-XT-003",
        difficulty: "medium",
        question_type: "XT",
        group_id: "mock-xt-1",
        passage: null,
        image_url: null,
        content_zh: { question: "由于月球与地球的位置是{1}变化的，所以我们看到的月亮形状也在改变。", correct_answers: { "1": "C" } },
        content_en: { question: "Because the position of the moon relative to Earth is {1} changing, the shape we see also changes." },
        choices: null,
      },
    ],
  },

  // ── 3a. Passage Q1 ───────────────────────────────────────────────────────────
  {
    type: "passage",
    group_id: "mock-passage-1",
    passage:
      `光合作用（Photosynthesis）是绿色植物利用叶绿素，将阳光、水（H₂O）和二氧化碳（CO₂）转化为葡萄糖（C₆H₁₂O₆）并释放氧气（O₂）的过程。这一过程发生在叶绿体中，分为需要光的"光反应"和不需要光的"暗反应"两个阶段。`,
    questions: [
      {
        id: "mock-passage-q1",
        code: "SC-PA-001",
        difficulty: "easy",
        question_type: "passage",
        group_id: "mock-passage-1",
        passage: null,
        image_url: null,
        choices: null,
        content_zh: {
          question: "光合作用的产物是什么？",
          choices: { A: "水和二氧化碳", B: "葡萄糖和氧气", C: "阳光和叶绿素", D: "氢气和二氧化碳" },
          correct_answer: "B",
          explanation: `光合作用的化学方程式为：
6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂

**反应物（Reactants）**是CO₂和H₂O，**产物（Products）**是葡萄糖（C₆H₁₂O₆）和氧气（O₂）。

A、C、D均不是光合作用的产物。

> 正确答案 / Correct answer: B — 葡萄糖和氧气 (Glucose and oxygen)`,
        },
        content_en: {
          question: "What are the products of photosynthesis?",
          choices: { A: "Water and carbon dioxide", B: "Glucose and oxygen", C: "Sunlight and chlorophyll", D: "Hydrogen and carbon dioxide" },
          correct_answer: "B",
        },
      },
    ],
  },

  // ── 3b. Passage Q2 ───────────────────────────────────────────────────────────
  {
    type: "passage",
    group_id: "mock-passage-2",
    passage:
      `光合作用（Photosynthesis）是绿色植物利用叶绿素，将阳光、水（H₂O）和二氧化碳（CO₂）转化为葡萄糖（C₆H₁₂O₆）并释放氧气（O₂）的过程。这一过程发生在叶绿体中，分为需要光的"光反应"和不需要光的"暗反应"两个阶段。`,
    questions: [
      {
        id: "mock-passage-q2",
        code: "SC-PA-002",
        difficulty: "easy",
        question_type: "passage",
        group_id: "mock-passage-2",
        passage: null,
        image_url: null,
        choices: null,
        content_zh: {
          question: "光合作用发生在哪个细胞器中？",
          choices: { A: "线粒体", B: "核糖体", C: "细胞核", D: "叶绿体" },
          correct_answer: "D",
          explanation: `光合作用发生在**叶绿体（Chloroplast）**中，叶绿体含有叶绿素，能吸收光能。

- A. **线粒体（Mitochondria）**：进行细胞呼吸，释放能量
- B. **核糖体（Ribosome）**：合成蛋白质
- C. **细胞核（Nucleus）**：储存遗传信息（DNA）

> 正确答案 / Correct answer: D — 叶绿体 (Chloroplast)`,
        },
        content_en: {
          question: "In which organelle does photosynthesis occur?",
          choices: { A: "Mitochondria", B: "Ribosome", C: "Nucleus", D: "Chloroplast" },
          correct_answer: "D",
        },
      },
    ],
  },

  // ── 4. Standard MC ───────────────────────────────────────────────────────────
  {
    type: "standard",
    group_id: null,
    questions: [],   // falls through to QUESTIONS[3] in the render
  },
];

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

// ─── Question grouping ─────────────────────────────────────────────────────────

function groupQuestions(questions: ApiQuestion[]): QuestionGroup[] {
  const groups: QuestionGroup[] = [];
  const grouped = new Set<string>();

  for (const q of questions) {
    if (grouped.has(q.id)) continue;

    if (q.question_type === "standard" || !q.group_id) {
      grouped.add(q.id);
      groups.push({ type: q.question_type, group_id: null, questions: [q] });
    } else if (q.question_type === "passage") {
      const siblings = questions.filter((s) => s.group_id === q.group_id);
      siblings.forEach((s) => grouped.add(s.id));
      groups.push({
        type: "passage",
        group_id: q.group_id,
        questions: siblings,
        passage: siblings[0].passage ?? undefined,
      });
    } else {
      // DT or XT
      const siblings = questions.filter((s) => s.group_id === q.group_id);
      siblings.forEach((s) => grouped.add(s.id));
      groups.push({ type: q.question_type, group_id: q.group_id, questions: siblings });
    }
  }
  return groups;
}

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
      <Text size="md" fw={500} c={textColor} style={{ flex: 1 }}>
        <LatexText>{text}</LatexText>
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
      <Text size="md" fw={700} c={CORRECT_DARK} mb={rem(8)}>
        Correct Answer: {explanation.correctStatement}
      </Text>
      <Text size="md" c={INK} mb={rem(8)}>
        <LatexText>{explanation.intro}</LatexText>
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
                marginTop: rem(9),
                flexShrink: 0,
              }}
            />
            <Text size="md" c={INK}>
              <LatexText>{step}</LatexText>
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
        <Text size="md" fw={700} c={CORRECT_DARK}>
          <LatexText>{explanation.conclusion}</LatexText>
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
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submittedSet, setSubmittedSet] = useState<Set<number>>(new Set());
  const [flaggedSet, setFlaggedSet] = useState<Set<number>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());
  const [elapsedSeconds, setElapsedSeconds] = useState(1122); // 18:42
  const [finished, setFinished] = useState(false);

  // Selected option for current question (before submission)
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("en");
  const [reportOpen, setReportOpen] = useState(false);

  // ── New question types (DT / XT / passage) ──────────────────────────────────
  /** API-sourced question groups; falls back to wrapping mock QUESTIONS when empty */
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>(MOCK_GROUPS);
  /** questionId → { blankIndex → choiceKey } — for DT/XT drag-drop */
  const [fillAnswers, setFillAnswers] = useState<FillAnswerMap>({});
  /** Group indices that have been set-submitted (DT/XT) */
  const [submittedGroups, setSubmittedGroups] = useState<Set<number>>(new Set());
  /** questionId → submit result (correct/wrong + blank_results) */
  const [submitResults, setSubmitResults] = useState<Record<string, SubmitResult>>({});
  /** questionIds submitted individually (passage sub-questions) */
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());

  /** Active group (null = fall back to QUESTIONS mock) */
  const activeGroup: QuestionGroup | null = questionGroups[currentQ] ?? null;
  const activeType = activeGroup?.type ?? "standard";

  function updateFillAnswer(questionId: string, blankIdx: string, choiceKey: string) {
    setFillAnswers((prev) => ({
      ...prev,
      [questionId]: { ...(prev[questionId] ?? {}), [blankIdx]: choiceKey },
    }));
  }

  function handleSubmitGroup(groupIdx: number) {
    if (submittedGroups.has(groupIdx) || !activeGroup) return;
    // Generate blankResults for each question from correct_answers stored in content
    const newResults: Record<string, SubmitResult> = {};
    for (const q of activeGroup.questions) {
      const correctAnswers = (q.content_zh.correct_answers ?? {}) as Record<string, string>;
      const userBlanks = fillAnswers[q.id] ?? {};
      const blankResults: BlankResult[] = Object.entries(correctAnswers).map(([blankIdx, correctKey]) => ({
        blank_index: blankIdx,
        correct: userBlanks[blankIdx] === correctKey,
        correct_answer: correctKey,
        user_answer: userBlanks[blankIdx] ?? "",
      }));
      newResults[q.id] = {
        question_id: q.id,
        correct: blankResults.every((r) => r.correct),
        correct_answer: "",
        difficulty: q.difficulty,
        xp_awarded: blankResults.every((r) => r.correct) ? 5 : 0,
        blank_results: blankResults,
      };
    }
    setSubmitResults((prev) => ({ ...prev, ...newResults }));
    setSubmittedGroups((prev) => { const next = new Set(prev); next.add(groupIdx); return next; });
    setSubmittedSet((prev) => { const next = new Set(prev); next.add(groupIdx); return next; });
  }

  function handleSubmitDT(groupIdx: number) {
    if (submittedGroups.has(groupIdx) || !activeGroup) return;
    const q = activeGroup.questions[0];
    const correctAnswers = (q.content_zh.correct_answers ?? {}) as Record<string, string>;
    const userBlanks = fillAnswers[q.id] ?? {};
    const blankResults: BlankResult[] = Object.entries(correctAnswers).map(([blankIdx, correctKey]) => ({
      blank_index: blankIdx,
      correct: userBlanks[blankIdx] === correctKey,
      correct_answer: correctKey,
      user_answer: userBlanks[blankIdx] ?? "",
    }));
    const allCorrect = blankResults.every((r) => r.correct);
    setSubmitResults((prev) => ({
      ...prev,
      [q.id]: {
        question_id: q.id,
        correct: allCorrect,
        correct_answer: "",
        difficulty: q.difficulty,
        xp_awarded: allCorrect ? 10 : 0,
        blank_results: blankResults,
      },
    }));
    setSubmittedGroups((prev) => { const next = new Set(prev); next.add(groupIdx); return next; });
    setSubmittedSet((prev) => { const next = new Set(prev); next.add(groupIdx); return next; });
  }

  function handlePassageAnswer(questionId: string, key: string) {
    setAnswers((prev) => ({ ...prev, [questionId as unknown as number]: key }));
  }

  function handlePassageSubmit(questionId: string) {
    if (submittedIds.has(questionId)) return;
    setSubmittedIds((prev) => { const next = new Set(prev); next.add(questionId); return next; });
    // Generate result from correct_answer stored in content
    const q = questionGroups.flatMap((g) => g.questions).find((q) => q.id === questionId);
    if (q) {
      const correctAnswer = (q.content_zh.correct_answer ?? q.content_en.correct_answer) as string | undefined;
      if (correctAnswer) {
        const userAns = (answers as Record<string, string>)[questionId] ?? "";
        setSubmitResults((prev) => ({
          ...prev,
          [questionId]: {
            question_id: questionId,
            correct: userAns === correctAnswer,
            correct_answer: correctAnswer,
            difficulty: q.difficulty,
            xp_awarded: userAns === correctAnswer ? 5 : 0,
          },
        }));
      }
    }
  }

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
    const total = questionGroups.length > 0 ? questionGroups.length : QUESTIONS.length;
    if (currentQ === total - 1) return;
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
                  <Tooltip label="Report a problem" withArrow>
                    <UnstyledButton
                      onClick={() => setReportOpen(true)}
                      style={{
                        width: rem(32), height: rem(32), borderRadius: rem(8),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backgroundColor: SURFACE,
                      }}
                    >
                      <IconAlertCircle size={16} color={MUTED} stroke={1.5} />
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

              {/* ── Question body — branches on type ── */}
              {activeType === "DT" && activeGroup ? (
                <>
                  <DragDropParagraph
                    questionText={
                      (lang === "zh"
                        ? (activeGroup.questions[0].content_zh?.question as string)
                        : (activeGroup.questions[0].content_en?.question as string)) ?? ""
                    }
                    wordChoices={activeGroup.questions[0].choices ?? []}
                    userAnswers={fillAnswers[activeGroup.questions[0].id] ?? {}}
                    submitted={submittedGroups.has(currentQ)}
                    blankResults={submitResults[activeGroup.questions[0].id]?.blank_results}
                    onChange={(blankIdx, choiceKey) =>
                      updateFillAnswer(activeGroup.questions[0].id, blankIdx, choiceKey)
                    }
                  />
                  {submittedGroups.has(currentQ) && (
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
                      {/* Blank result chips */}
                      {submitResults[activeGroup.questions[0].id]?.blank_results && (
                        <Box style={{ display: "flex", flexWrap: "wrap", gap: rem(8), marginBottom: rem(14) }}>
                          {submitResults[activeGroup.questions[0].id].blank_results!.map((r) => (
                            <span
                              key={r.blank_index}
                              style={{
                                padding: `${rem(4)} ${rem(12)}`,
                                borderRadius: rem(8),
                                border: `1px solid ${r.correct ? CORRECT_BORDER : WRONG_BORDER}`,
                                backgroundColor: r.correct ? CORRECT_BG : WRONG_BG,
                                color: r.correct ? CORRECT_GREEN : WRONG_RED,
                                fontSize: rem(13),
                                fontWeight: 500,
                              }}
                            >
                              {`{${r.blank_index}}`} → {(activeGroup.questions[0].choices ?? []).find((c) => c.key === r.correct_answer)?.text ?? r.correct_answer}
                              {!r.correct && (
                                <span style={{ color: MUTED, fontWeight: 400 }}>
                                  {" "}(you: {((activeGroup.questions[0].choices ?? []).find((c) => c.key === r.user_answer)?.text ?? r.user_answer) || "—"})
                                </span>
                              )}
                            </span>
                          ))}
                        </Box>
                      )}
                      {/* Markdown explanation */}
                      {(activeGroup.questions[0].content_zh.explanation as string | undefined) && (
                        <MarkdownLatexText>
                          {activeGroup.questions[0].content_zh.explanation as string}
                        </MarkdownLatexText>
                      )}
                    </Box>
                  )}
                </>
              ) : activeType === "XT" && activeGroup ? (
                <WordBankSet
                  questions={activeGroup.questions}
                  wordChoices={activeGroup.questions[0].choices ?? []}
                  userAnswers={fillAnswers}
                  submitted={submittedGroups.has(currentQ)}
                  results={submitResults}
                  lang={lang}
                  onChange={updateFillAnswer}
                  onSubmitSet={() => handleSubmitGroup(currentQ)}
                />
              ) : activeType === "passage" && activeGroup ? (
                <PassageQuestionGroup
                  passage={activeGroup.passage ?? ""}
                  questions={activeGroup.questions}
                  userAnswers={answers as unknown as Record<string, string>}
                  submittedIds={submittedIds}
                  results={submitResults}
                  lang={lang}
                  onAnswer={handlePassageAnswer}
                  onSubmit={handlePassageSubmit}
                />
              ) : (
                <>
                  {/* Standard MC — existing render */}
                  <Box
                    mb="md"
                    p="md"
                    style={{ backgroundColor: SURFACE, borderRadius: rem(10) }}
                  >
                    <Text size="md" c={INK} lh={1.7}>
                      <LatexText>{lang === "zh" ? (q.zh?.text ?? q.text) : q.text}</LatexText>
                    </Text>
                  </Box>

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

                  {isSubmitted && (
                    <ExplanationBox explanation={lang === "zh" ? (q.zh?.explanation ?? q.explanation) : q.explanation} />
                  )}
                </>
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

              {/* Submit button — all types */}
              {(() => {
                const submittedBtn = (
                  <Button disabled radius="md" leftSection={<IconCheck size={15} stroke={2.5} />}
                    style={{ backgroundColor: SURFACE, color: MUTED, cursor: "default" }}>
                    Submitted
                  </Button>
                );
                const submitBtn = (enabled: boolean, onClick: () => void) => (
                  <Button radius="md" onClick={onClick} disabled={!enabled}
                    style={{ backgroundColor: enabled ? PRIMARY : SURFACE, color: enabled ? "white" : MUTED, fontWeight: 600 }}>
                    Submit
                  </Button>
                );

                if (activeType === "DT") {
                  const dtId = activeGroup?.questions[0].id ?? "";
                  const dtEnabled = Object.keys(fillAnswers[dtId] ?? {}).length > 0;
                  return submittedGroups.has(currentQ) ? submittedBtn : submitBtn(dtEnabled, () => handleSubmitDT(currentQ));
                }
                if (activeType === "XT") {
                  const xtEnabled = activeGroup?.questions.every((q) => {
                    const text = (q.content_zh?.question as string) ?? "";
                    return [...text.matchAll(/\{(\d+)\}/g)].every((m) => Boolean(fillAnswers[q.id]?.[m[1]]));
                  }) ?? false;
                  return submittedGroups.has(currentQ) ? submittedBtn : submitBtn(xtEnabled, () => handleSubmitGroup(currentQ));
                }
                if (activeType === "passage") {
                  const pqId = activeGroup?.questions[0].id ?? "";
                  const pEnabled = Boolean((answers as Record<string, string>)[pqId]);
                  return submittedIds.has(pqId) ? submittedBtn : submitBtn(pEnabled, () => handlePassageSubmit(pqId));
                }
                // Standard MC
                return isSubmitted ? submittedBtn : submitBtn(Boolean(pendingAnswer), handleSubmit);
              })()}


              {currentQ === (questionGroups.length > 0 ? questionGroups.length : QUESTIONS.length) - 1 ? (
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
                total={questionGroups.length > 0 ? questionGroups.length : QUESTIONS.length}
                submittedSet={submittedSet}
                answers={answers}
                flaggedSet={flaggedSet}
              />
              <QuestionNavigator
                total={questionGroups.length > 0 ? questionGroups.length : QUESTIONS.length}
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

      <ReportModal opened={reportOpen} onClose={() => setReportOpen(false)} />

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
