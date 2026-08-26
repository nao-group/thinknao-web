import type React from "react";
import {
  IconAtom,
  IconBook,
  IconFlask,
  IconMathFunction,
  IconMicroscope,
} from "@tabler/icons-react";
import type { Lang } from "@/components/language-toggle";
import { CREAM, PRIMARY, INDIGO, PANDA, VIOLET, EMERALD } from "@/constants/colors";
import type { Subject, MockQ } from "./types";

// ─── Subject config ─────────────────────────────────────────────────────────────

export const SUBJECT_CONFIG: Record<
  Subject,
  { duration: number; questionCount: number; langFixed?: Lang; langLabel: string }
> = {
  "Humanities Chinese": { duration: 90 * 60, questionCount: 80, langFixed: "zh", langLabel: "Mandarin only" },
  "STEM Chinese":      { duration: 90 * 60, questionCount: 80, langFixed: "zh", langLabel: "Mandarin only" },
  Mathematics:            { duration: 60 * 60, questionCount: 48, langLabel: "Mandarin or English" },
  Physics:                { duration: 60 * 60, questionCount: 48, langLabel: "Mandarin or English" },
  Chemistry:              { duration: 60 * 60, questionCount: 48, langLabel: "Mandarin or English" },
};

export const SUBJECT_META: Record<Subject, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
  "Humanities Chinese": { icon: IconBook,        iconBg: "#F5F3FF", iconColor: VIOLET  },
  "STEM Chinese":      { icon: IconMicroscope,  iconBg: "#ECFDF5", iconColor: EMERALD },
  Mathematics:            { icon: IconMathFunction, iconBg: CREAM,    iconColor: PRIMARY },
  Physics:                { icon: IconAtom,         iconBg: "#EEF0FF", iconColor: INDIGO  },
  Chemistry:              { icon: IconFlask,        iconBg: "#FDF0EC", iconColor: PANDA   },
};

export const ALL_SUBJECTS: Subject[] = [
  "Humanities Chinese",
  "STEM Chinese",
  "Mathematics",
  "Physics",
  "Chemistry",
];

// ─── Data ──────────────────────────────────────────────────────────────────────

export const PAST_EXAMS: {
  id: number; date: string; score: number; total: number; pct: number;
  passed: boolean; duration: string; lang: string; subject: Subject;
}[] = [
  { id: 1, date: "Jul 18, 2026", score: 5, total: 6, pct: 83, passed: true,  duration: "42:18", lang: "EN",  subject: "Mathematics" },
  { id: 2, date: "Jul 10, 2026", score: 3, total: 6, pct: 50, passed: false, duration: "57:44", lang: "中文", subject: "Humanities Chinese" },
  { id: 3, date: "Jun 28, 2026", score: 4, total: 6, pct: 67, passed: true,  duration: "51:07", lang: "中文", subject: "STEM Chinese" },
];

export const ALL_QUESTIONS: MockQ[] = [
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

  // ── Humanities Chinese (6) — Mandarin only ──────────────────────────────────
  {
    id: 21, subject: "Humanities Chinese", topic: "成语典故",
    text: "\"望梅止渴\"这个成语故事中的主人公是谁？",
    options: [{ key: "A", text: "刘备" }, { key: "B", text: "曹操" }, { key: "C", text: "孙权" }, { key: "D", text: "关羽" }],
    correctAnswer: "B",
  },
  {
    id: 22, subject: "Humanities Chinese", topic: "古典诗词",
    text: "\"但愿人长久，千里共婵娟\"出自哪位诗人的作品？",
    options: [{ key: "A", text: "李白" }, { key: "B", text: "杜甫" }, { key: "C", text: "苏轼" }, { key: "D", text: "辛弃疾" }],
    correctAnswer: "C",
  },
  {
    id: 23, subject: "Humanities Chinese", topic: "语言知识",
    text: "下列词语中，哪一组是反义词？",
    options: [{ key: "A", text: "晴朗 — 明亮" }, { key: "B", text: "勤奋 — 懒惰" }, { key: "C", text: "高兴 — 快乐" }, { key: "D", text: "美丽 — 漂亮" }],
    correctAnswer: "B",
  },
  {
    id: 24, subject: "Humanities Chinese", topic: "修辞手法",
    text: "\"月亮像一块银盘\"使用了哪种修辞手法？",
    options: [{ key: "A", text: "排比" }, { key: "B", text: "拟人" }, { key: "C", text: "比喻" }, { key: "D", text: "夸张" }],
    correctAnswer: "C",
  },
  {
    id: 25, subject: "Humanities Chinese", topic: "文学常识",
    text: "《红楼梦》的作者是谁？",
    options: [{ key: "A", text: "吴承恩" }, { key: "B", text: "施耐庵" }, { key: "C", text: "曹雪芹" }, { key: "D", text: "罗贯中" }],
    correctAnswer: "C",
  },
  {
    id: 26, subject: "Humanities Chinese", topic: "古典诗词",
    text: "\"朱门酒肉臭，路有冻死骨\"是哪位诗人的名句？",
    options: [{ key: "A", text: "王维" }, { key: "B", text: "孟浩然" }, { key: "C", text: "杜甫" }, { key: "D", text: "李商隐" }],
    correctAnswer: "C",
  },

  // ── STEM Chinese (6) — Mandarin only ──────────────────────────────────────
  {
    id: 27, subject: "STEM Chinese", topic: "科学知识",
    text: "\"光合作用\"是指植物利用什么将二氧化碳和水转化为有机物？",
    options: [{ key: "A", text: "热能" }, { key: "B", text: "光能" }, { key: "C", text: "化学能" }, { key: "D", text: "电能" }],
    correctAnswer: "B",
  },
  {
    id: 28, subject: "STEM Chinese", topic: "说明方法",
    text: "\"细胞是生命的基本单位\"这句话属于哪种说明方法？",
    options: [{ key: "A", text: "举例子" }, { key: "B", text: "打比方" }, { key: "C", text: "下定义" }, { key: "D", text: "分类别" }],
    correctAnswer: "C",
  },
  {
    id: 29, subject: "STEM Chinese", topic: "科技词汇",
    text: "\"可生物降解\"对应的英文词是？",
    options: [{ key: "A", text: "Recyclable" }, { key: "B", text: "Biodegradable" }, { key: "C", text: "Renewable" }, { key: "D", text: "Combustible" }],
    correctAnswer: "B",
  },
  {
    id: 30, subject: "STEM Chinese", topic: "语言应用",
    text: "在科技说明文中，\"综上所述\"一词通常出现在文章的哪个部分？",
    options: [{ key: "A", text: "开头" }, { key: "B", text: "中间" }, { key: "C", text: "结尾" }, { key: "D", text: "标题" }],
    correctAnswer: "C",
  },
  {
    id: 31, subject: "STEM Chinese", topic: "科技词汇",
    text: "\"基因编辑\"中\"编辑\"最接近下列哪个词的意思？",
    options: [{ key: "A", text: "出版" }, { key: "B", text: "阅读" }, { key: "C", text: "修改" }, { key: "D", text: "复制" }],
    correctAnswer: "C",
  },
  {
    id: 32, subject: "STEM Chinese", topic: "科技词汇",
    text: "\"人工智能\"的英文缩写是？",
    options: [{ key: "A", text: "IT" }, { key: "B", text: "AI" }, { key: "C", text: "AR" }, { key: "D", text: "VR" }],
    correctAnswer: "B",
  },
];
