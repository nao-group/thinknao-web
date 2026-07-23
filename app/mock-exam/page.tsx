"use client";

import { useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Group,
  Modal,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  UnstyledButton,
  rem,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconAtom,
  IconBook,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconFlask,
  IconMathFunction,
  IconMicroscope,
  IconTrophy,
  IconX,
} from "@tabler/icons-react";
import { LanguageToggle, type Lang } from "@/components/language-toggle";

// ─── Constants ─────────────────────────────────────────────────────────────────

const INK = "#0F172A";
const SURFACE = "#F3F5F7";
const PRIMARY = "#D4A017";
const CREAM = "#F7E7D3";
const MUTED = "#667080";
const INDIGO = "#6670B0";
const PANDA = "#C65D2E";
const VIOLET = "#7C3AED";
const EMERALD = "#059669";
const CORRECT_GREEN = "#16A34A";
const WRONG_RED = "#DC2626";

const PASS_MARK = 60;

// ─── Types ─────────────────────────────────────────────────────────────────────

type Subject =
  | "Liberal Arts Chinese"
  | "Science Chinese"
  | "Mathematics"
  | "Physics"
  | "Chemistry";
type Phase = "landing" | "generating" | "exam" | "results";

interface MockQ {
  id: number;
  subject: Subject;
  topic: string;
  text: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  zh?: { topic: string; text: string; options?: { key: string; text: string }[] };
}

interface ExamResult {
  correct: number;
  pct: number;
  passed: boolean;
  timeTaken: number;
  timedOut: boolean;
}

// ─── Subject config ─────────────────────────────────────────────────────────────

const SUBJECT_CONFIG: Record<
  Subject,
  { duration: number; questionCount: number; langFixed?: Lang; langLabel: string }
> = {
  "Liberal Arts Chinese": { duration: 90 * 60, questionCount: 80, langFixed: "zh", langLabel: "Mandarin only" },
  "Science Chinese":      { duration: 90 * 60, questionCount: 80, langFixed: "zh", langLabel: "Mandarin only" },
  Mathematics:            { duration: 60 * 60, questionCount: 48, langLabel: "Mandarin or English" },
  Physics:                { duration: 60 * 60, questionCount: 48, langLabel: "Mandarin or English" },
  Chemistry:              { duration: 60 * 60, questionCount: 48, langLabel: "Mandarin or English" },
};

const SUBJECT_META: Record<Subject, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
  "Liberal Arts Chinese": { icon: IconBook,        iconBg: "#F5F3FF", iconColor: VIOLET  },
  "Science Chinese":      { icon: IconMicroscope,  iconBg: "#ECFDF5", iconColor: EMERALD },
  Mathematics:            { icon: IconMathFunction, iconBg: CREAM,    iconColor: PRIMARY },
  Physics:                { icon: IconAtom,         iconBg: "#EEF0FF", iconColor: INDIGO  },
  Chemistry:              { icon: IconFlask,        iconBg: "#FDF0EC", iconColor: PANDA   },
};

const ALL_SUBJECTS: Subject[] = [
  "Liberal Arts Chinese",
  "Science Chinese",
  "Mathematics",
  "Physics",
  "Chemistry",
];

// ─── Data ──────────────────────────────────────────────────────────────────────

const PAST_EXAMS: {
  id: number; date: string; score: number; total: number; pct: number;
  passed: boolean; duration: string; lang: string; subject: Subject;
}[] = [
  { id: 1, date: "Jul 18, 2026", score: 5, total: 6, pct: 83, passed: true,  duration: "42:18", lang: "EN",  subject: "Mathematics" },
  { id: 2, date: "Jul 10, 2026", score: 3, total: 6, pct: 50, passed: false, duration: "57:44", lang: "中文", subject: "Liberal Arts Chinese" },
  { id: 3, date: "Jun 28, 2026", score: 4, total: 6, pct: 67, passed: true,  duration: "51:07", lang: "中文", subject: "Science Chinese" },
];

const ALL_QUESTIONS: MockQ[] = [
  // ── Mathematics (7) ──────────────────────────────────────────────────────────
  {
    id: 1, subject: "Mathematics", topic: "Calculus",
    text: "What is the derivative of f(x) = x³ − 6x² + 9x + 1?",
    options: [{ key: "A", text: "3x² − 12x + 9" }, { key: "B", text: "3x² − 6x + 9" }, { key: "C", text: "x² − 12x + 9" }, { key: "D", text: "3x² + 12x − 9" }],
    correctAnswer: "A",
    zh: { topic: "微积分", text: "f(x) = x³ − 6x² + 9x + 1 的导数是什么？" },
  },
  {
    id: 2, subject: "Mathematics", topic: "Algebra",
    text: "Solve for x: 2x² − 5x − 3 = 0",
    options: [{ key: "A", text: "x = 3 or x = −½" }, { key: "B", text: "x = −3 or x = ½" }, { key: "C", text: "x = 3 or x = ½" }, { key: "D", text: "x = −3 or x = −½" }],
    correctAnswer: "A",
    zh: { topic: "代数", text: "解方程：2x² − 5x − 3 = 0" },
  },
  {
    id: 3, subject: "Mathematics", topic: "Trigonometry",
    text: "What is the value of sin(60°) × cos(30°)?",
    options: [{ key: "A", text: "½" }, { key: "B", text: "¾" }, { key: "C", text: "√3/2" }, { key: "D", text: "√3/4" }],
    correctAnswer: "B",
    zh: { topic: "三角学", text: "sin(60°) × cos(30°) 的值是多少？" },
  },
  {
    id: 4, subject: "Mathematics", topic: "Calculus",
    text: "Evaluate ∫(2x + 3) dx",
    options: [{ key: "A", text: "x² + 3x + C" }, { key: "B", text: "2x² + 3x + C" }, { key: "C", text: "x² + 3 + C" }, { key: "D", text: "2 + C" }],
    correctAnswer: "A",
    zh: { topic: "微积分", text: "计算 ∫(2x + 3) dx" },
  },
  {
    id: 5, subject: "Mathematics", topic: "Statistics",
    text: "A dataset has values: 4, 7, 7, 9, 13. What is the mean?",
    options: [{ key: "A", text: "7" }, { key: "B", text: "8" }, { key: "C", text: "9" }, { key: "D", text: "7.5" }],
    correctAnswer: "B",
    zh: { topic: "统计学", text: "数据集：4, 7, 7, 9, 13，平均值是多少？" },
  },
  {
    id: 6, subject: "Mathematics", topic: "Geometry",
    text: "A circle has radius 5 cm. What is its area?",
    options: [{ key: "A", text: "25π cm²" }, { key: "B", text: "10π cm²" }, { key: "C", text: "5π cm²" }, { key: "D", text: "50π cm²" }],
    correctAnswer: "A",
    zh: { topic: "几何学", text: "半径为 5 cm 的圆，面积是多少？" },
  },
  {
    id: 7, subject: "Mathematics", topic: "Algebra",
    text: "If log₂(x) = 5, what is x?",
    options: [{ key: "A", text: "10" }, { key: "B", text: "25" }, { key: "C", text: "32" }, { key: "D", text: "64" }],
    correctAnswer: "C",
    zh: { topic: "代数", text: "若 log₂(x) = 5，x 等于多少？" },
  },

  // ── Physics (7) ──────────────────────────────────────────────────────────────
  {
    id: 8, subject: "Physics", topic: "Mechanics",
    text: "A 5 kg object falls freely from rest for 3 seconds. What is its velocity? (g = 10 m/s²)",
    options: [{ key: "A", text: "15 m/s" }, { key: "B", text: "30 m/s" }, { key: "C", text: "45 m/s" }, { key: "D", text: "50 m/s" }],
    correctAnswer: "B",
    zh: { topic: "力学", text: "5 kg 物体从静止自由下落 3 秒，速度是多少？(g = 10 m/s²)" },
  },
  {
    id: 9, subject: "Physics", topic: "Waves",
    text: "A wave has frequency 500 Hz and wavelength 0.68 m. What is its speed?",
    options: [{ key: "A", text: "340 m/s" }, { key: "B", text: "500 m/s" }, { key: "C", text: "680 m/s" }, { key: "D", text: "250 m/s" }],
    correctAnswer: "A",
    zh: { topic: "波动", text: "频率 500 Hz、波长 0.68 m 的波，波速是多少？" },
  },
  {
    id: 10, subject: "Physics", topic: "Electricity",
    text: "Three 6 Ω resistors are connected in parallel. What is the equivalent resistance?",
    options: [{ key: "A", text: "18 Ω" }, { key: "B", text: "3 Ω" }, { key: "C", text: "2 Ω" }, { key: "D", text: "6 Ω" }],
    correctAnswer: "C",
    zh: { topic: "电学", text: "三个 6 Ω 电阻并联，等效电阻是多少？" },
  },
  {
    id: 11, subject: "Physics", topic: "Thermodynamics",
    text: "Which law states that energy cannot be created or destroyed?",
    options: [{ key: "A", text: "Zeroth Law of Thermodynamics" }, { key: "B", text: "First Law of Thermodynamics" }, { key: "C", text: "Second Law of Thermodynamics" }, { key: "D", text: "Third Law of Thermodynamics" }],
    correctAnswer: "B",
    zh: { topic: "热力学", text: "哪条定律规定能量不能被创造或消灭？", options: [{ key: "A", text: "热力学第零定律" }, { key: "B", text: "热力学第一定律" }, { key: "C", text: "热力学第二定律" }, { key: "D", text: "热力学第三定律" }] },
  },
  {
    id: 12, subject: "Physics", topic: "Optics",
    text: "What is the speed of light in a vacuum?",
    options: [{ key: "A", text: "3 × 10⁸ m/s" }, { key: "B", text: "3 × 10⁶ m/s" }, { key: "C", text: "3 × 10¹⁰ m/s" }, { key: "D", text: "3 × 10⁴ m/s" }],
    correctAnswer: "A",
    zh: { topic: "光学", text: "真空中光速是多少？" },
  },
  {
    id: 13, subject: "Physics", topic: "Mechanics",
    text: "An object of mass 4 kg accelerates at 3 m/s². What is the net force?",
    options: [{ key: "A", text: "7 N" }, { key: "B", text: "12 N" }, { key: "C", text: "1.33 N" }, { key: "D", text: "24 N" }],
    correctAnswer: "B",
    zh: { topic: "力学", text: "质量 4 kg 的物体以 3 m/s² 加速，净力是多少？" },
  },
  {
    id: 14, subject: "Physics", topic: "Electricity",
    text: "Voltage is 12 V and current is 3 A. What is the resistance?",
    options: [{ key: "A", text: "4 Ω" }, { key: "B", text: "36 Ω" }, { key: "C", text: "0.25 Ω" }, { key: "D", text: "9 Ω" }],
    correctAnswer: "A",
    zh: { topic: "电学", text: "电压 12 V，电流 3 A，电阻是多少？" },
  },

  // ── Chemistry (6) ────────────────────────────────────────────────────────────
  {
    id: 15, subject: "Chemistry", topic: "Stoichiometry",
    text: "How many moles of H₂O are produced when 2 moles of H₂ react with excess O₂?",
    options: [{ key: "A", text: "1 mol" }, { key: "B", text: "2 mol" }, { key: "C", text: "4 mol" }, { key: "D", text: "0.5 mol" }],
    correctAnswer: "B",
    zh: { topic: "化学计量", text: "2 mol H₂ 与过量 O₂ 反应，产生多少 mol H₂O？" },
  },
  {
    id: 16, subject: "Chemistry", topic: "Acids & Bases",
    text: "What is the pH of a 0.01 M HCl solution?",
    options: [{ key: "A", text: "1" }, { key: "B", text: "2" }, { key: "C", text: "12" }, { key: "D", text: "7" }],
    correctAnswer: "B",
    zh: { topic: "酸碱", text: "0.01 M HCl 溶液的 pH 值是多少？" },
  },
  {
    id: 17, subject: "Chemistry", topic: "Organic Chemistry",
    text: "What is the functional group of an alcohol?",
    options: [{ key: "A", text: "−COOH" }, { key: "B", text: "−CHO" }, { key: "C", text: "−OH" }, { key: "D", text: "−NH₂" }],
    correctAnswer: "C",
    zh: { topic: "有机化学", text: "醇类的官能团是什么？", options: [{ key: "A", text: "−COOH（羧基）" }, { key: "B", text: "−CHO（醛基）" }, { key: "C", text: "−OH（羟基）" }, { key: "D", text: "−NH₂（氨基）" }] },
  },
  {
    id: 18, subject: "Chemistry", topic: "Thermochemistry",
    text: "An exothermic reaction releases energy. What happens to the surroundings?",
    options: [{ key: "A", text: "They absorb energy and cool down" }, { key: "B", text: "They release energy and cool down" }, { key: "C", text: "They absorb energy and heat up" }, { key: "D", text: "Nothing changes" }],
    correctAnswer: "C",
    zh: { topic: "热化学", text: "放热反应释放能量，周围环境会发生什么？", options: [{ key: "A", text: "吸收能量并降温" }, { key: "B", text: "释放能量并降温" }, { key: "C", text: "吸收能量并升温" }, { key: "D", text: "无变化" }] },
  },
  {
    id: 19, subject: "Chemistry", topic: "Inorganic Chemistry",
    text: "What is the atomic number of Carbon?",
    options: [{ key: "A", text: "4" }, { key: "B", text: "6" }, { key: "C", text: "8" }, { key: "D", text: "12" }],
    correctAnswer: "B",
    zh: { topic: "无机化学", text: "碳的原子序数是多少？" },
  },
  {
    id: 20, subject: "Chemistry", topic: "Acids & Bases",
    text: "Which of the following is an Arrhenius base?",
    options: [{ key: "A", text: "HCl" }, { key: "B", text: "NaOH" }, { key: "C", text: "CH₃COOH" }, { key: "D", text: "NH₄Cl" }],
    correctAnswer: "B",
    zh: { topic: "酸碱", text: "以下哪种是阿伦尼乌斯碱？" },
  },

  // ── Liberal Arts Chinese (6) — Mandarin only ──────────────────────────────────
  {
    id: 21, subject: "Liberal Arts Chinese", topic: "成语典故",
    text: "\"望梅止渴\"这个成语故事中的主人公是谁？",
    options: [{ key: "A", text: "刘备" }, { key: "B", text: "曹操" }, { key: "C", text: "孙权" }, { key: "D", text: "关羽" }],
    correctAnswer: "B",
  },
  {
    id: 22, subject: "Liberal Arts Chinese", topic: "古典诗词",
    text: "\"但愿人长久，千里共婵娟\"出自哪位诗人的作品？",
    options: [{ key: "A", text: "李白" }, { key: "B", text: "杜甫" }, { key: "C", text: "苏轼" }, { key: "D", text: "辛弃疾" }],
    correctAnswer: "C",
  },
  {
    id: 23, subject: "Liberal Arts Chinese", topic: "语言知识",
    text: "下列词语中，哪一组是反义词？",
    options: [{ key: "A", text: "晴朗 — 明亮" }, { key: "B", text: "勤奋 — 懒惰" }, { key: "C", text: "高兴 — 快乐" }, { key: "D", text: "美丽 — 漂亮" }],
    correctAnswer: "B",
  },
  {
    id: 24, subject: "Liberal Arts Chinese", topic: "修辞手法",
    text: "\"月亮像一块银盘\"使用了哪种修辞手法？",
    options: [{ key: "A", text: "排比" }, { key: "B", text: "拟人" }, { key: "C", text: "比喻" }, { key: "D", text: "夸张" }],
    correctAnswer: "C",
  },
  {
    id: 25, subject: "Liberal Arts Chinese", topic: "文学常识",
    text: "《红楼梦》的作者是谁？",
    options: [{ key: "A", text: "吴承恩" }, { key: "B", text: "施耐庵" }, { key: "C", text: "曹雪芹" }, { key: "D", text: "罗贯中" }],
    correctAnswer: "C",
  },
  {
    id: 26, subject: "Liberal Arts Chinese", topic: "古典诗词",
    text: "\"朱门酒肉臭，路有冻死骨\"是哪位诗人的名句？",
    options: [{ key: "A", text: "王维" }, { key: "B", text: "孟浩然" }, { key: "C", text: "杜甫" }, { key: "D", text: "李商隐" }],
    correctAnswer: "C",
  },

  // ── Science Chinese (6) — Mandarin only ──────────────────────────────────────
  {
    id: 27, subject: "Science Chinese", topic: "科学知识",
    text: "\"光合作用\"是指植物利用什么将二氧化碳和水转化为有机物？",
    options: [{ key: "A", text: "热能" }, { key: "B", text: "光能" }, { key: "C", text: "化学能" }, { key: "D", text: "电能" }],
    correctAnswer: "B",
  },
  {
    id: 28, subject: "Science Chinese", topic: "说明方法",
    text: "\"细胞是生命的基本单位\"这句话属于哪种说明方法？",
    options: [{ key: "A", text: "举例子" }, { key: "B", text: "打比方" }, { key: "C", text: "下定义" }, { key: "D", text: "分类别" }],
    correctAnswer: "C",
  },
  {
    id: 29, subject: "Science Chinese", topic: "科技词汇",
    text: "\"可生物降解\"对应的英文词是？",
    options: [{ key: "A", text: "Recyclable" }, { key: "B", text: "Biodegradable" }, { key: "C", text: "Renewable" }, { key: "D", text: "Combustible" }],
    correctAnswer: "B",
  },
  {
    id: 30, subject: "Science Chinese", topic: "语言应用",
    text: "在科技说明文中，\"综上所述\"一词通常出现在文章的哪个部分？",
    options: [{ key: "A", text: "开头" }, { key: "B", text: "中间" }, { key: "C", text: "结尾" }, { key: "D", text: "标题" }],
    correctAnswer: "C",
  },
  {
    id: 31, subject: "Science Chinese", topic: "科技词汇",
    text: "\"基因编辑\"中\"编辑\"最接近下列哪个词的意思？",
    options: [{ key: "A", text: "出版" }, { key: "B", text: "阅读" }, { key: "C", text: "修改" }, { key: "D", text: "复制" }],
    correctAnswer: "C",
  },
  {
    id: 32, subject: "Science Chinese", topic: "科技词汇",
    text: "\"人工智能\"的英文缩写是？",
    options: [{ key: "A", text: "IT" }, { key: "B", text: "AI" }, { key: "C", text: "AR" }, { key: "D", text: "VR" }],
    correctAnswer: "B",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmtTime(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

function fmtDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec.toString().padStart(2, "0")}s`;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MockExamPage() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [setupOpen, setSetupOpen] = useState(false);
  const [setupLang, setSetupLang] = useState<Lang>("en");
  const [setupSubject, setSetupSubject] = useState<Subject>("Mathematics");
  const [lang, setLang] = useState<Lang>("en");
  const [examQuestions, setExamQuestions] = useState<MockQ[]>([]);
  const [examDuration, setExamDuration] = useState(60 * 60);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [timedOut, setTimedOut] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const examQRef = useRef(examQuestions);
  examQRef.current = examQuestions;
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;
  const examDurationRef = useRef(examDuration);
  examDurationRef.current = examDuration;

  // Simulate AI generation then start exam
  useEffect(() => {
    if (phase !== "generating") return;
    const cfg = SUBJECT_CONFIG[setupSubject];
    const duration = cfg.duration;
    const effectiveLang = cfg.langFixed ?? setupLang;
    const id = setTimeout(() => {
      setExamQuestions(shuffle(ALL_QUESTIONS.filter((q) => q.subject === setupSubject)));
      setExamDuration(duration);
      setAnswers({});
      setCurrent(0);
      setTimeLeft(duration);
      setTimedOut(false);
      setLang(effectiveLang);
      setPhase("exam");
    }, 2500);
    return () => clearTimeout(id);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer
  useEffect(() => {
    if (phase !== "exam") return;
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(id); setTimedOut(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (!timedOut) return;
    const q = examQRef.current;
    const a = answersRef.current;
    const t = timeLeftRef.current;
    const dur = examDurationRef.current;
    const correct = q.filter((qu) => a[qu.id] === qu.correctAnswer).length;
    const pct = q.length > 0 ? Math.round((correct / q.length) * 100) : 0;
    setResult({ correct, pct, passed: pct >= PASS_MARK, timeTaken: dur - t, timedOut: true });
    setPhase("results");
  }, [timedOut]);

  function doSubmit() {
    const correct = examQuestions.filter((q) => answers[q.id] === q.correctAnswer).length;
    const pct = examQuestions.length > 0 ? Math.round((correct / examQuestions.length) * 100) : 0;
    setResult({ correct, pct, passed: pct >= PASS_MARK, timeTaken: examDuration - timeLeft, timedOut: false });
    setPhase("results");
    setSubmitOpen(false);
  }

  // ── Landing ──────────────────────────────────────────────────────────────────

  if (phase === "landing") {
    const cfg = SUBJECT_CONFIG[setupSubject];
    const isLangFixed = !!cfg.langFixed;

    return (
      <Box p={{ base: "md", sm: "xl" }}>
        <style>{`@keyframes exam-spin { to { transform: rotate(360deg) } }`}</style>

        {/* Header */}
        <Group justify="space-between" mb="xl" wrap="nowrap" align="flex-start">
          <Box>
            <Text fw={700} size="xl" c={INK} mb={4}>Mock Exam</Text>
            <Text size="sm" c="dimmed" style={{ maxWidth: rem(480) }}>
              AI-generated exam simulating the CSCA format. No hints, no saves — just like the real thing.
            </Text>
          </Box>
          <Button
            radius="xl"
            size="md"
            style={{ backgroundColor: INK, color: "white", fontWeight: 600, flexShrink: 0 }}
            onClick={() => setSetupOpen(true)}
          >
            + Start New Exam
          </Button>
        </Group>

        <Group align="flex-start" gap="xl" wrap="nowrap">
          {/* Left: subject table + rules */}
          <Stack style={{ flex: 1, minWidth: 0 }} gap="lg">
            {/* CSCA exam table */}
            <Box style={{ backgroundColor: "white", borderRadius: rem(14), overflow: "hidden" }}>
              <Box px="lg" py="md" style={{ borderBottom: "1px solid #F1F5F9" }}>
                <Text size="sm" fw={700} c={INK}>CSCA Exam Structure</Text>
              </Box>
              {/* Table header */}
              <Box px="lg" py="sm" style={{ backgroundColor: SURFACE, display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1.2fr 0.6fr", gap: rem(8) }}>
                {["Subject", "Language", "Duration", "Questions", "Score"].map((h) => (
                  <Text key={h} size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>{h}</Text>
                ))}
              </Box>
              {ALL_SUBJECTS.map((subj, i) => {
                const meta = SUBJECT_META[subj];
                const subCfg = SUBJECT_CONFIG[subj];
                const Icon = meta.icon;
                return (
                  <Box
                    key={subj}
                    px="lg"
                    py="md"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1.4fr 1fr 1.2fr 0.6fr",
                      gap: rem(8),
                      alignItems: "center",
                      borderBottom: i < ALL_SUBJECTS.length - 1 ? "1px solid #F1F5F9" : "none",
                    }}
                  >
                    <Group gap={8} wrap="nowrap">
                      <Box style={{ width: rem(24), height: rem(24), borderRadius: rem(6), backgroundColor: meta.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={13} stroke={1.5} color={meta.iconColor} />
                      </Box>
                      <Text size="sm" fw={600} c={INK}>{subj}</Text>
                    </Group>
                    <Text size="sm" c="dimmed">{subCfg.langLabel}</Text>
                    <Text size="sm" c="dimmed">{subCfg.duration / 60} min</Text>
                    <Text size="sm" c="dimmed">{subCfg.questionCount} MCQ</Text>
                    <Text size="sm" c="dimmed">0–100</Text>
                  </Box>
                );
              })}
            </Box>

            {/* Rules */}
            <Box p="lg" style={{ backgroundColor: "white", borderRadius: rem(14) }}>
              <Text size="sm" fw={700} c={INK} mb="sm">Exam Rules</Text>
              <Stack gap={8}>
                {[
                  "Subject and language are chosen once before the exam and cannot be changed.",
                  "Questions are AI-generated and randomised each session.",
                  "You cannot bookmark or save individual questions.",
                  "Answers are submitted all at once — no per-question feedback during the exam.",
                  "Correct answers and explanations are not revealed after submission.",
                  "The timer cannot be paused. Running out of time auto-submits your answers.",
                ].map((rule, i) => (
                  <Group key={i} gap={10} align="flex-start">
                    <Box style={{ width: rem(5), height: rem(5), borderRadius: "50%", backgroundColor: MUTED, flexShrink: 0, marginTop: rem(8) }} />
                    <Text size="sm" c="dimmed">{rule}</Text>
                  </Group>
                ))}
              </Stack>
            </Box>
          </Stack>

          {/* Right: past attempts */}
          <Box visibleFrom="md" style={{ width: rem(300), flexShrink: 0 }}>
            <Text fw={700} size="sm" c={INK} mb="sm">Recent Attempts</Text>
            <Stack gap="xs">
              {PAST_EXAMS.map((exam) => {
                const meta = SUBJECT_META[exam.subject];
                const Icon = meta.icon;
                return (
                  <Box key={exam.id} p="md" style={{ backgroundColor: "white", borderRadius: rem(12) }}>
                    <Group justify="space-between" mb={6}>
                      <Badge
                        size="sm"
                        radius="sm"
                        style={{ backgroundColor: exam.passed ? "#DCFCE7" : "#FEE2E2", color: exam.passed ? CORRECT_GREEN : WRONG_RED, fontWeight: 700 }}
                      >
                        {exam.passed ? "PASS" : "FAIL"}
                      </Badge>
                      <Text size="xs" c="dimmed">{exam.date}</Text>
                    </Group>
                    <Group gap={6} mb={4}>
                      <Box style={{ width: rem(18), height: rem(18), borderRadius: rem(4), backgroundColor: meta.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={10} stroke={1.5} color={meta.iconColor} />
                      </Box>
                      <Text size="sm" fw={600} c={INK}>{exam.subject}</Text>
                    </Group>
                    <Group gap={6}>
                      <Text size="xs" c="dimmed">{exam.score}/{exam.total} ({exam.pct}%)</Text>
                      <Text size="xs" c="dimmed">·</Text>
                      <Text size="xs" c="dimmed">{exam.duration}</Text>
                      <Text size="xs" c="dimmed">·</Text>
                      <Text size="xs" c="dimmed">{exam.lang}</Text>
                    </Group>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Group>

        {/* Setup Modal */}
        <Modal
          opened={setupOpen}
          onClose={() => setSetupOpen(false)}
          title={<Text fw={700} size="md" c={INK}>Exam Setup</Text>}
          centered
          radius="lg"
          size="md"
        >
          <Stack gap="lg">
            {/* Subject selection */}
            <Box>
              <Text size="sm" fw={600} c={INK} mb={4}>Subject</Text>
              <Text size="xs" c="dimmed" mb="sm">Choose one subject for this exam session.</Text>
              <Stack gap="xs">
                {ALL_SUBJECTS.map((subj) => {
                  const meta = SUBJECT_META[subj];
                  const Icon = meta.icon;
                  const selected = setupSubject === subj;
                  const subCfg = SUBJECT_CONFIG[subj];
                  return (
                    <UnstyledButton
                      key={subj}
                      onClick={() => setSetupSubject(subj)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: rem(12),
                        padding: `${rem(10)} ${rem(14)}`,
                        borderRadius: rem(10),
                        border: `2px solid ${selected ? meta.iconColor : "#E2E8F0"}`,
                        backgroundColor: selected ? meta.iconBg : "white",
                        transition: "all 150ms ease",
                      }}
                    >
                      <Box style={{ width: rem(32), height: rem(32), borderRadius: rem(8), backgroundColor: selected ? meta.iconColor : SURFACE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={16} stroke={1.5} color={selected ? "white" : MUTED} />
                      </Box>
                      <Box style={{ flex: 1 }}>
                        <Text size="sm" fw={600} c={selected ? INK : MUTED}>{subj}</Text>
                        <Text size="xs" c="dimmed">{subCfg.langLabel} · {subCfg.duration / 60} min · {subCfg.questionCount} questions</Text>
                      </Box>
                      <Box style={{
                        width: rem(18), height: rem(18), borderRadius: "50%", flexShrink: 0,
                        border: `2px solid ${selected ? meta.iconColor : "#D1D5DB"}`,
                        backgroundColor: selected ? meta.iconColor : "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {selected && <Box style={{ width: rem(6), height: rem(6), borderRadius: "50%", backgroundColor: "white" }} />}
                      </Box>
                    </UnstyledButton>
                  );
                })}
              </Stack>
            </Box>

            {/* Language — only for bilingual subjects */}
            {isLangFixed ? (
              <Box p="sm" style={{ backgroundColor: SURFACE, borderRadius: rem(10) }}>
                <Group gap={8}>
                  <Text size="sm" c="dimmed">Language:</Text>
                  <Badge size="sm" radius="sm" style={{ backgroundColor: "#F5F3FF", color: VIOLET, fontWeight: 600 }}>
                    Mandarin only
                  </Badge>
                  <Text size="xs" c="dimmed">— fixed for this subject</Text>
                </Group>
              </Box>
            ) : (
              <Box>
                <Text size="sm" fw={600} c={INK} mb={4}>Language</Text>
                <Text size="xs" c="dimmed" mb="sm">Cannot be changed once the exam begins.</Text>
                <SimpleGrid cols={2}>
                  {(["en", "zh"] as const).map((l) => (
                    <UnstyledButton
                      key={l}
                      onClick={() => setSetupLang(l)}
                      style={{
                        padding: `${rem(14)} ${rem(12)}`,
                        borderRadius: rem(12),
                        border: `2px solid ${setupLang === l ? PRIMARY : "#E2E8F0"}`,
                        backgroundColor: setupLang === l ? CREAM : "white",
                        textAlign: "center",
                        transition: "all 150ms ease",
                      }}
                    >
                      <Text fw={700} size="lg" c={setupLang === l ? PRIMARY : INK}>{l === "en" ? "EN" : "中文"}</Text>
                      <Text size="xs" c="dimmed" mt={2}>{l === "en" ? "English" : "Mandarin"}</Text>
                    </UnstyledButton>
                  ))}
                </SimpleGrid>
              </Box>
            )}

            {/* CTA */}
            <Box pt="xs" style={{ borderTop: "1px solid #F1F5F9" }}>
              <Group justify="space-between" align="center">
                <Text size="xs" c="dimmed">
                  {ALL_QUESTIONS.filter((q) => q.subject === setupSubject).length} questions (mock) · {cfg.duration / 60} min · {PASS_MARK}% to pass
                </Text>
                <Button
                  radius="xl"
                  style={{ backgroundColor: INK, color: "white", fontWeight: 600 }}
                  onClick={() => { setSetupOpen(false); setPhase("generating"); }}
                >
                  Generate &amp; Start
                </Button>
              </Group>
            </Box>
          </Stack>
        </Modal>
      </Box>
    );
  }

  // ── Generating ────────────────────────────────────────────────────────────────

  if (phase === "generating") {
    const meta = SUBJECT_META[setupSubject];
    const Icon = meta.icon;
    return (
      <Box style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: rem(24), minHeight: "60vh" }}>
        <style>{`@keyframes exam-spin { to { transform: rotate(360deg) } }`}</style>
        <Box style={{ position: "relative", width: rem(80), height: rem(80) }}>
          <Box style={{ width: rem(80), height: rem(80), borderRadius: "50%", border: `5px solid ${SURFACE}`, borderTop: `5px solid ${meta.iconColor}`, animation: "exam-spin 0.9s linear infinite" }} />
          <Box style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box style={{ width: rem(44), height: rem(44), borderRadius: rem(12), backgroundColor: meta.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={22} stroke={1.5} color={meta.iconColor} />
            </Box>
          </Box>
        </Box>
        <Stack gap={4} align="center">
          <Text fw={700} size="lg" c={INK}>Generating your exam…</Text>
          <Text size="sm" c="dimmed">{setupSubject} · {SUBJECT_CONFIG[setupSubject].duration / 60} min</Text>
        </Stack>
      </Box>
    );
  }

  // ── Exam ──────────────────────────────────────────────────────────────────────

  if (phase === "exam" && examQuestions.length > 0) {
    const q = examQuestions[current];
    const isLast = current === examQuestions.length - 1;
    const totalQ = examQuestions.length;
    const answeredCount = Object.keys(answers).length;
    const unanswered = totalQ - answeredCount;
    const isLow = timeLeft < 300;
    const isCritical = timeLeft < 60;
    const qText = lang === "zh" ? (q.zh?.text ?? q.text) : q.text;
    const qTopic = lang === "zh" ? (q.zh?.topic ?? q.topic) : q.topic;
    const qOptions = lang === "zh" && q.zh?.options ? q.zh.options : q.options;
    const meta = SUBJECT_META[q.subject];
    const SubjectIcon = meta.icon;

    return (
      <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Sticky top bar */}
        <Box px={{ base: "md", sm: "xl" }} py="sm" style={{ backgroundColor: "white", borderBottom: "1px solid #E2E8F0", position: "sticky", top: 0, zIndex: 100 }}>
          <Group justify="space-between" wrap="nowrap">
            <Group gap={8} wrap="nowrap">
              <Text fw={700} size="sm" c={INK}>Q {current + 1}</Text>
              <Text size="sm" c="dimmed">/ {totalQ}</Text>
              <Box style={{ width: rem(20), height: rem(20), borderRadius: rem(5), backgroundColor: meta.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <SubjectIcon size={12} stroke={1.5} color={meta.iconColor} />
              </Box>
              <Badge size="sm" radius="sm" style={{ backgroundColor: meta.iconBg, color: meta.iconColor, fontWeight: 600 }}>
                {qTopic}
              </Badge>
            </Group>
            <Group gap={6} wrap="nowrap">
              <IconClock size={15} stroke={1.5} color={isCritical ? WRONG_RED : isLow ? "#F59E0B" : MUTED} />
              <Text fw={700} size="sm" c={isCritical ? "red" : isLow ? "orange" : "dimmed"}>
                {fmtTime(timeLeft)}
              </Text>
            </Group>
          </Group>
        </Box>

        {/* Mobile progress */}
        <Box hiddenFrom="lg" px="md" py={6} style={{ backgroundColor: "white", borderBottom: "1px solid #F1F5F9" }}>
          <Group justify="space-between" mb={4}>
            <Text size="xs" c="dimmed">{answeredCount} answered</Text>
            <Text size="xs" c="dimmed">{unanswered} remaining</Text>
          </Group>
          <Progress value={totalQ > 0 ? (answeredCount / totalQ) * 100 : 0} size={4} radius="xl" color="dark" />
        </Box>

        <Box p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
          <Group align="flex-start" gap="xl" wrap="nowrap">
            {/* Question column */}
            <Stack style={{ flex: 1, minWidth: 0 }} gap="md">
              <Box p="xl" className="no-select" style={{ backgroundColor: "white", borderRadius: rem(14) }}>
                <Box p="md" mb="lg" style={{ backgroundColor: SURFACE, borderRadius: rem(10) }}>
                  <Text size="sm" c={INK} lh={1.7}>{qText}</Text>
                </Box>
                <Stack gap="sm">
                  {qOptions.map((opt) => {
                    const chosen = answers[q.id] === opt.key;
                    return (
                      <Box
                        key={opt.key}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.key }))}
                        style={{
                          display: "flex", alignItems: "center", gap: rem(12),
                          padding: `${rem(14)} ${rem(16)}`, borderRadius: rem(10),
                          border: `${chosen ? "2px" : "1.5px"} solid ${chosen ? PRIMARY : "#E2E8F0"}`,
                          backgroundColor: chosen ? CREAM : "white",
                          cursor: "pointer", transition: "all 150ms ease",
                        }}
                      >
                        <Box style={{ width: rem(32), height: rem(32), borderRadius: "50%", backgroundColor: chosen ? PRIMARY : SURFACE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: rem(13), fontWeight: 700, color: chosen ? INK : MUTED }}>
                          {opt.key}
                        </Box>
                        <Text size="sm" c={INK} fw={chosen ? 600 : 400}>{opt.text}</Text>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Group justify="space-between">
                <Button leftSection={<IconChevronLeft size={15} stroke={2} />} variant="outline" color="dark" radius="xl" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
                  Previous
                </Button>
                {isLast ? (
                  <Button radius="xl" style={{ backgroundColor: CORRECT_GREEN, color: "white", fontWeight: 600 }} onClick={() => setSubmitOpen(true)}>
                    Submit Exam
                  </Button>
                ) : (
                  <Button rightSection={<IconChevronRight size={15} stroke={2} />} radius="xl" style={{ backgroundColor: INK, color: "white", fontWeight: 600 }} onClick={() => setCurrent((c) => c + 1)}>
                    Next
                  </Button>
                )}
              </Group>
            </Stack>

            {/* Right sidebar */}
            <Box visibleFrom="lg" style={{ width: rem(272), flexShrink: 0 }}>
              <Stack gap="md">
                <Box p="lg" style={{ backgroundColor: "white", borderRadius: rem(14) }}>
                  <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="md" style={{ letterSpacing: "0.06em" }}>Question Navigator</Text>
                  <SimpleGrid cols={5} spacing={6}>
                    {examQuestions.map((eq, idx) => {
                      const isCurr = idx === current;
                      const isAns = !!answers[eq.id];
                      return (
                        <UnstyledButton
                          key={eq.id}
                          onClick={() => setCurrent(idx)}
                          style={{
                            aspectRatio: "1", borderRadius: rem(6),
                            border: `1.5px solid ${isCurr ? INK : isAns ? PRIMARY : "#E2E8F0"}`,
                            backgroundColor: isCurr ? INK : isAns ? CREAM : "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: rem(11), fontWeight: 600,
                            color: isCurr ? "white" : isAns ? PRIMARY : MUTED,
                          }}
                        >
                          {idx + 1}
                        </UnstyledButton>
                      );
                    })}
                  </SimpleGrid>
                  <Group gap="lg" mt="md">
                    <Group gap={4}><Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: CREAM, border: `1.5px solid ${PRIMARY}` }} /><Text size="xs" c="dimmed">Answered</Text></Group>
                    <Group gap={4}><Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: "white", border: "1.5px solid #E2E8F0" }} /><Text size="xs" c="dimmed">Skipped</Text></Group>
                  </Group>
                </Box>

                <Box p="lg" style={{ backgroundColor: "white", borderRadius: rem(14) }}>
                  <Group justify="space-between" mb={6}>
                    <Text size="xs" c="dimmed">{answeredCount} answered</Text>
                    <Text size="xs" c="dimmed">{unanswered} remaining</Text>
                  </Group>
                  <Progress value={totalQ > 0 ? (answeredCount / totalQ) * 100 : 0} size="sm" radius="xl" color="dark" />
                </Box>

                <Button fullWidth radius="md" style={{ backgroundColor: CORRECT_GREEN, color: "white", fontWeight: 600 }} onClick={() => setSubmitOpen(true)}>
                  Submit Exam
                </Button>
              </Stack>
            </Box>
          </Group>
        </Box>

        <Modal
          opened={submitOpen}
          onClose={() => setSubmitOpen(false)}
          title={<Group gap={8}><IconAlertTriangle size={18} color="#F59E0B" /><Text fw={700} c={INK}>Submit Exam?</Text></Group>}
          centered radius="lg" size="sm"
        >
          <Stack gap="md">
            {unanswered > 0 ? (
              <Text size="sm" c="dimmed">
                You have <Text span fw={700} c={WRONG_RED}>{unanswered} unanswered question{unanswered > 1 ? "s" : ""}</Text>. Skipped questions will be marked incorrect.
              </Text>
            ) : (
              <Text size="sm" c="dimmed">You have answered all {totalQ} questions. Ready to submit?</Text>
            )}
            <Group grow>
              <Button variant="outline" color="dark" radius="xl" onClick={() => setSubmitOpen(false)}>Cancel</Button>
              <Button radius="xl" style={{ backgroundColor: CORRECT_GREEN, color: "white", fontWeight: 600 }} onClick={doSubmit}>Confirm Submit</Button>
            </Group>
          </Stack>
        </Modal>
      </Box>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────────

  if (phase === "results" && result) {
    const totalQ = examQuestions.length;
    const wrong = examQuestions.filter((q) => answers[q.id] && answers[q.id] !== q.correctAnswer).length;
    const skipped = totalQ - Object.keys(answers).length;
    const subjectMeta = SUBJECT_META[examQuestions[0]?.subject ?? "Mathematics"];
    const SubjectResultIcon = subjectMeta.icon;

    return (
      <Box p={{ base: "md", sm: "xl" }}>
        <Stack align="center" gap="xl">
          {result.timedOut && (
            <Box px="lg" py="sm" style={{ backgroundColor: "#FEF3C7", borderRadius: rem(10), border: "1px solid #FCD34D" }}>
              <Group gap={8}>
                <IconClock size={16} color="#D97706" />
                <Text size="sm" fw={600} c="#92400E">Time&apos;s up! Your answers were automatically submitted.</Text>
              </Group>
            </Box>
          )}

          {/* Subject label */}
          <Group gap={8}>
            <Box style={{ width: rem(28), height: rem(28), borderRadius: rem(7), backgroundColor: subjectMeta.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SubjectResultIcon size={15} stroke={1.5} color={subjectMeta.iconColor} />
            </Box>
            <Text size="sm" fw={600} c="dimmed">{examQuestions[0]?.subject}</Text>
          </Group>

          {/* Score circle */}
          <Box style={{
            width: rem(160), height: rem(160), borderRadius: "50%",
            border: `8px solid ${result.passed ? CORRECT_GREEN : WRONG_RED}`,
            backgroundColor: result.passed ? "#F0FDF4" : "#FEF2F2",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            {result.passed ? <IconTrophy size={32} stroke={1.5} color={CORRECT_GREEN} /> : <IconX size={32} stroke={2} color={WRONG_RED} />}
            <Text fw={900} size="xl" c={result.passed ? CORRECT_GREEN : WRONG_RED} lh={1.2} mt={4}>{result.pct}%</Text>
            <Text size="xs" c="dimmed">{result.correct}/{totalQ}</Text>
          </Box>

          <Stack align="center" gap={6}>
            <Badge size="xl" radius="md" style={{ backgroundColor: result.passed ? "#DCFCE7" : "#FEE2E2", color: result.passed ? CORRECT_GREEN : WRONG_RED, fontWeight: 900, fontSize: rem(16), padding: `${rem(10)} ${rem(28)}` }}>
              {result.passed ? "PASS" : "FAIL"}
            </Badge>
            <Text size="sm" c="dimmed" ta="center">
              {result.passed ? "Congratulations! You passed the mock exam." : `You need ${PASS_MARK}% to pass. Keep practising!`}
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 2, xs: 4 }} style={{ width: "100%", maxWidth: rem(560) }}>
            {[
              { label: "Correct",    value: String(result.correct),       color: CORRECT_GREEN },
              { label: "Wrong",      value: String(wrong),                 color: WRONG_RED     },
              { label: "Skipped",    value: String(skipped),               color: MUTED         },
              { label: "Time Taken", value: fmtDuration(result.timeTaken), color: INK           },
            ].map((stat) => (
              <Box key={stat.label} p="md" style={{ backgroundColor: "white", borderRadius: rem(12), textAlign: "center" }}>
                <Text fw={700} size="lg" c={stat.color}>{stat.value}</Text>
                <Text size="xs" c="dimmed" mt={2}>{stat.label}</Text>
              </Box>
            ))}
          </SimpleGrid>

          <Group>
            <Button variant="outline" color="dark" radius="xl" onClick={() => setPhase("landing")}>
              Back to Mock Exam
            </Button>
            <Button radius="xl" style={{ backgroundColor: INK, color: "white", fontWeight: 600 }} onClick={() => { setSetupOpen(true); setPhase("landing"); }}>
              Retake Exam
            </Button>
          </Group>
        </Stack>
      </Box>
    );
  }

  return null;
}
