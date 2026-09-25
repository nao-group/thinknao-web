/** Frontend-only sample. Replace code lookup, questions, grading, and email delivery with the tryout API. */
export const DEMO_CODE = "NAO-HC-ZH-DEMO";
export const TRYOUT_STORAGE_KEY = "thinknao-tryout-demo-v1";
export const TRYOUT_DURATION_SECONDS = 30 * 60;

export type TryoutQuestion = {
  id: string;
  type: "multiple_choice" | "YL" | "cloze" | "XT";
  label: string;
  prompt: string;
  passage?: string;
  options: { key: string; text: string }[];
  blanks?: string[];
  items?: { index: string; prompt: string; options: { key: string; text: string }[] }[];
  sentences?: { index: string; text: string }[];
  correct: Record<string, string>;
};

export const TRYOUT_QUESTIONS: TryoutQuestion[] = [
  {
    id: "hc-01", type: "multiple_choice", label: "词语理解 · Multiple choice",
    prompt: "“循序渐进”最接近下面哪一个意思？",
    options: [
      { key: "A", text: "按照步骤逐渐前进" }, { key: "B", text: "立刻完成所有任务" },
      { key: "C", text: "不断重复同一个步骤" }, { key: "D", text: "先做最难的部分" },
    ], correct: { "1": "A" },
  },
  {
    id: "hc-02", type: "multiple_choice", label: "语法选择 · Multiple choice",
    prompt: "选择最恰当的词语：虽然下雨了，大家____按时到达了教室。",
    options: [
      { key: "A", text: "因为" }, { key: "B", text: "还是" },
      { key: "C", text: "所以" }, { key: "D", text: "或者" },
    ], correct: { "1": "B" },
  },
  {
    id: "hc-03", type: "YL", label: "阅读理解 · YL",
    passage: "周末，小林去了社区图书馆。他发现图书馆新开设了一个中文阅读角。那里不仅有历史和文学书籍，还有供学生讨论的空间。小林借了一本关于丝绸之路的书，打算下周和朋友分享。",
    prompt: "根据短文回答下面的问题。",
    options: [],
    items: [
      { index: "1", prompt: "小林借的书主要关于什么？", options: [
        { key: "A", text: "社区活动" }, { key: "B", text: "中国文学" },
        { key: "C", text: "丝绸之路" }, { key: "D", text: "图书馆管理" },
      ] },
      { index: "2", prompt: "根据短文，中文阅读角还提供什么？", options: [
        { key: "A", text: "学生讨论的空间" }, { key: "B", text: "免费的午餐" },
        { key: "C", text: "体育活动" }, { key: "D", text: "线上考试" },
      ] },
    ], correct: { "1": "C", "2": "A" },
  },
  {
    id: "hc-05", type: "cloze", label: "段落填空 · Fill in the blanks",
    prompt: "学习一门语言需要{1}。每天阅读一点儿，并主动和别人{2}，可以慢慢提高表达能力。",
    blanks: ["1", "2"], options: [
      { key: "A", text: "耐心" }, { key: "B", text: "交流" },
      { key: "C", text: "匆忙" }, { key: "D", text: "忘记" },
    ], correct: { "1": "A", "2": "B" },
  },
  {
    id: "hc-06", type: "XT", label: "选词填空 · XT",
    prompt: "从同一个词库中选择合适的词，填入每一句的空格。",
    options: [
      { key: "A", text: "精彩" }, { key: "B", text: "请教" },
      { key: "C", text: "逐渐" }, { key: "D", text: "安静" },
      { key: "E", text: "遥远" },
    ],
    sentences: [
      { index: "1", text: "这本书的内容很____，我一口气读完了。" },
      { index: "2", text: "如果有不懂的问题，可以____老师。" },
      { index: "3", text: "通过每天练习，她的中文水平____提高了。" },
    ], correct: { "1": "A", "2": "B", "3": "C" },
  },
  {
    id: "hc-07", type: "multiple_choice", label: "文化常识 · Multiple choice",
    prompt: "中国传统节日“中秋节”通常与哪项活动有关？",
    options: [
      { key: "A", text: "赛龙舟" }, { key: "B", text: "赏月、吃月饼" },
      { key: "C", text: "放风筝" }, { key: "D", text: "植树" },
    ], correct: { "1": "B" },
  },
];

export const TRYOUT_STEPS = TRYOUT_QUESTIONS.flatMap((question, groupIndex) =>
  Object.keys(question.correct).map((blank) => ({ groupIndex, blank }))
);
export const TRYOUT_ITEM_COUNT = TRYOUT_STEPS.length;

export type TryoutAttempt = {
  code: string;
  deadline: number;
  answers: Record<string, Record<string, string>>;
  submittedAt?: number;
};

export function readTryoutAttempt(): TryoutAttempt | null {
  try {
    const value = sessionStorage.getItem(TRYOUT_STORAGE_KEY);
    if (!value) return null;
    const attempt = JSON.parse(value) as TryoutAttempt;
    return attempt.code === DEMO_CODE && Number.isFinite(attempt.deadline) && attempt.answers ? attempt : null;
  } catch { return null; }
}

export function saveTryoutAttempt(attempt: TryoutAttempt) {
  sessionStorage.setItem(TRYOUT_STORAGE_KEY, JSON.stringify(attempt));
}

export function scoreTryout(answers: TryoutAttempt["answers"]) {
  const correct = TRYOUT_QUESTIONS.reduce((total, question) => total +
    Object.entries(question.correct).filter(([blank, key]) => answers[question.id]?.[blank] === key).length, 0);
  return { correct, total: TRYOUT_ITEM_COUNT, percentage: Math.round(correct / TRYOUT_ITEM_COUNT * 100) };
}
