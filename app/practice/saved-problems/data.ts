export type SubjectKey = "Mathematics" | "Physics" | "Chemistry";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface SavedProblem {
  id: string;
  subject: SubjectKey;
  difficulty: Difficulty;
  topic: string;
  setName: string;
  setSlug: string;
  question: string;
  options: { key: string; text: string; text_zh?: string }[];
  correctAnswer: string;
  explanation: {
    correctStatement: string;
    intro: string;
    steps: string[];
    conclusion: string;
  };
  dateAdded: string;
  zh?: {
    topic: string;
    question: string;
    explanation: {
      correctStatement: string;
      intro: string;
      steps: string[];
      conclusion: string;
    };
  };
}

export const SAVED_PROBLEMS: SavedProblem[] = [
  {
    id: "1",
    subject: "Mathematics",
    difficulty: "Medium",
    topic: "Differentiation",
    setName: "Mathematics 4",
    setSlug: "mathematics-4",
    question: "If f(x) = 2x² + 3x − 5, find f′(x) and determine the critical points of the function.",
    options: [
      { key: "A", text: "f′(x) = 4x + 3; critical point at x = −3/4", text_zh: "f′(x) = 4x + 3；临界点在 x = −3/4" },
      { key: "B", text: "f′(x) = 4x − 3; critical point at x = 3/4", text_zh: "f′(x) = 4x − 3；临界点在 x = 3/4" },
      { key: "C", text: "f′(x) = 2x + 3; critical point at x = −3/2", text_zh: "f′(x) = 2x + 3；临界点在 x = −3/2" },
      { key: "D", text: "f′(x) = 4x + 3; critical point at x = 3/4", text_zh: "f′(x) = 4x + 3；临界点在 x = 3/4" },
    ],
    correctAnswer: "A",
    explanation: {
      correctStatement: "A — f′(x) = 4x + 3; critical point at x = −3/4",
      intro: "Differentiate using the Power Rule, then set f′(x) = 0:",
      steps: [
        "d/dx(2x²) = 4x",
        "d/dx(3x) = 3",
        "d/dx(−5) = 0",
        "f′(x) = 4x + 3; set to 0 → 4x + 3 = 0 → x = −3/4",
      ],
      conclusion: "∴ f′(x) = 4x + 3, critical point at x = −3/4",
    },
    zh: {
      topic: "微分学",
      question: "若 f(x) = 2x² + 3x − 5，求 f′(x) 并确定函数的临界点。",
      explanation: {
        correctStatement: "A — f′(x) = 4x + 3；临界点在 x = −3/4",
        intro: "运用幂次法则求导，令 f′(x) = 0：",
        steps: [
          "d/dx(2x²) = 4x",
          "d/dx(3x) = 3",
          "d/dx(−5) = 0",
          "f′(x) = 4x + 3；令其为零 → 4x + 3 = 0 → x = −3/4",
        ],
        conclusion: "∴ f′(x) = 4x + 3，临界点在 x = −3/4",
      },
    },
    dateAdded: "2026-07-22",
  },
  {
    id: "2",
    subject: "Physics",
    difficulty: "Hard",
    topic: "Circular Motion",
    setName: "Physics 3",
    setSlug: "physics-3",
    question: "A particle moves in a circle of radius r with angular velocity ω. Derive the expression for centripetal acceleration in terms of r and ω.",
    options: [
      { key: "A", text: "a = ω²r" },
      { key: "B", text: "a = ωr²" },
      { key: "C", text: "a = ω/r" },
      { key: "D", text: "a = r/ω²" },
    ],
    correctAnswer: "A",
    explanation: {
      correctStatement: "A — a = ω²r",
      intro: "Use the relationship between linear and angular velocity:",
      steps: [
        "Linear velocity v = ωr",
        "Centripetal acceleration a = v²/r",
        "Substitute v = ωr: a = (ωr)²/r = ω²r²/r",
        "Simplify: a = ω²r",
      ],
      conclusion: "∴ Centripetal acceleration a = ω²r",
    },
    zh: {
      topic: "圆周运动",
      question: "一质点以角速度 ω 在半径为 r 的圆形轨道上运动。用 r 和 ω 推导向心加速度的表达式。",
      explanation: {
        correctStatement: "A — a = ω²r",
        intro: "利用线速度与角速度的关系：",
        steps: [
          "线速度 v = ωr",
          "向心加速度 a = v²/r",
          "代入 v = ωr：a = (ωr)²/r = ω²r²/r",
          "化简：a = ω²r",
        ],
        conclusion: "∴ 向心加速度 a = ω²r",
      },
    },
    dateAdded: "2026-07-21",
  },
  {
    id: "3",
    subject: "Chemistry",
    difficulty: "Easy",
    topic: "Organic Chemistry",
    setName: "Chemistry 4",
    setSlug: "chemistry-4",
    question: "What is the molecular formula of glucose? What type of isomerism does it exhibit?",
    options: [
      { key: "A", text: "C₆H₁₂O₆; optical isomerism", text_zh: "C₆H₁₂O₆；光学异构" },
      { key: "B", text: "C₆H₁₂O₆; structural isomerism", text_zh: "C₆H₁₂O₆；结构异构" },
      { key: "C", text: "C₁₂H₂₂O₁₁; optical isomerism", text_zh: "C₁₂H₂₂O₁₁；光学异构" },
      { key: "D", text: "C₆H₁₀O₅; geometric isomerism", text_zh: "C₆H₁₀O₅；几何异构" },
    ],
    correctAnswer: "A",
    explanation: {
      correctStatement: "A — C₆H₁₂O₆; optical isomerism",
      intro: "Glucose is a monosaccharide with the following properties:",
      steps: [
        "Molecular formula: C₆H₁₂O₆ (6 carbons, 12 hydrogens, 6 oxygens)",
        "Glucose has 4 chiral carbon centers (C2, C3, C4, C5)",
        "Chiral carbons cause optical isomerism (D and L forms)",
        "D-glucose is the biologically active form",
      ],
      conclusion: "∴ Glucose: C₆H₁₂O₆ exhibiting optical isomerism",
    },
    zh: {
      topic: "有机化学",
      question: "葡萄糖的分子式是什么？它表现出哪种同分异构现象？",
      explanation: {
        correctStatement: "A — C₆H₁₂O₆；光学异构",
        intro: "葡萄糖是一种单糖，具有以下性质：",
        steps: [
          "分子式：C₆H₁₂O₆（6个碳、12个氢、6个氧）",
          "葡萄糖有4个手性碳中心（C2, C3, C4, C5）",
          "手性碳导致光学异构（D型和L型）",
          "D-葡萄糖是生物活性形式",
        ],
        conclusion: "∴ 葡萄糖：C₆H₁₂O₆，呈光学异构",
      },
    },
    dateAdded: "2026-07-20",
  },
  {
    id: "4",
    subject: "Mathematics",
    difficulty: "Hard",
    topic: "Differential Equations",
    setName: "Mathematics 5",
    setSlug: "mathematics-5",
    question: "Solve the differential equation dy/dx + 2y = 4x using the integrating factor method.",
    options: [
      { key: "A", text: "y = 2x − 1 + Ce⁻²ˣ" },
      { key: "B", text: "y = 2x + 1 + Ce²ˣ" },
      { key: "C", text: "y = x − 1 + Ce⁻²ˣ" },
      { key: "D", text: "y = 2x + Ce⁻²ˣ" },
    ],
    correctAnswer: "A",
    explanation: {
      correctStatement: "A — y = 2x − 1 + Ce⁻²ˣ",
      intro: "Apply the integrating factor method (P = 2, Q = 4x):",
      steps: [
        "Integrating factor μ = e∫2 dx = e²ˣ",
        "Multiply both sides by e²ˣ: d/dx(ye²ˣ) = 4xe²ˣ",
        "Integrate both sides: ye²ˣ = ∫4xe²ˣ dx",
        "Using IBP: ye²ˣ = 2xe²ˣ − e²ˣ + C",
        "Divide by e²ˣ: y = 2x − 1 + Ce⁻²ˣ",
      ],
      conclusion: "∴ y = 2x − 1 + Ce⁻²ˣ",
    },
    zh: {
      topic: "微分方程",
      question: "用积分因子法求解微分方程 dy/dx + 2y = 4x。",
      explanation: {
        correctStatement: "A — y = 2x − 1 + Ce⁻²ˣ",
        intro: "应用积分因子法（P = 2，Q = 4x）：",
        steps: [
          "积分因子 μ = e∫2 dx = e²ˣ",
          "两边同乘 e²ˣ：d/dx(ye²ˣ) = 4xe²ˣ",
          "两边积分：ye²ˣ = ∫4xe²ˣ dx",
          "用分部积分法：ye²ˣ = 2xe²ˣ − e²ˣ + C",
          "除以 e²ˣ：y = 2x − 1 + Ce⁻²ˣ",
        ],
        conclusion: "∴ y = 2x − 1 + Ce⁻²ˣ",
      },
    },
    dateAdded: "2026-07-19",
  },
  {
    id: "5",
    subject: "Physics",
    difficulty: "Medium",
    topic: "Modern Physics",
    setName: "Physics 3",
    setSlug: "physics-3",
    question: "Explain the photoelectric effect and derive Einstein's photoelectric equation.",
    options: [
      { key: "A", text: "E = hf − φ, where φ is the work function", text_zh: "E = hf − φ，其中 φ 为逸出功" },
      { key: "B", text: "E = hf + φ" },
      { key: "C", text: "E = φ/hf" },
      { key: "D", text: "E = hf × φ" },
    ],
    correctAnswer: "A",
    explanation: {
      correctStatement: "A — KE_max = hf − φ",
      intro: "Einstein explained the photoelectric effect using photon theory:",
      steps: [
        "Photons carry energy E = hf (h = Planck's constant, f = frequency)",
        "A photon must overcome the work function φ (minimum energy to eject electron)",
        "If hf > φ, the excess energy becomes kinetic energy of the ejected electron",
        "KE_max = hf − φ (Einstein's photoelectric equation)",
      ],
      conclusion: "∴ KE_max = hf − φ",
    },
    zh: {
      topic: "近代物理",
      question: "解释光电效应并推导爱因斯坦光电方程。",
      explanation: {
        correctStatement: "A — KE_max = hf − φ",
        intro: "爱因斯坦用光子理论解释了光电效应：",
        steps: [
          "光子携带能量 E = hf（h = 普朗克常数，f = 频率）",
          "光子必须克服逸出功 φ（逸出电子所需的最小能量）",
          "若 hf > φ，多余能量转化为逸出电子的动能",
          "KE_max = hf − φ（爱因斯坦光电方程）",
        ],
        conclusion: "∴ KE_max = hf − φ",
      },
    },
    dateAdded: "2026-07-18",
  },
  {
    id: "6",
    subject: "Chemistry",
    difficulty: "Medium",
    topic: "Reaction Mechanisms",
    setName: "Chemistry 4",
    setSlug: "chemistry-4",
    question: "Describe the mechanism of SN1 and SN2 reactions with appropriate examples and transition state diagrams.",
    options: [
      { key: "A", text: "SN1: two-step, unimolecular; SN2: one-step, bimolecular", text_zh: "SN1：两步，单分子；SN2：一步，双分子" },
      { key: "B", text: "SN1: one-step, bimolecular; SN2: two-step, unimolecular", text_zh: "SN1：一步，双分子；SN2：两步，单分子" },
      { key: "C", text: "Both are two-step bimolecular mechanisms", text_zh: "两者均为两步双分子机理" },
      { key: "D", text: "SN1 involves inversion; SN2 involves racemization", text_zh: "SN1 导致构型翻转；SN2 导致消旋化" },
    ],
    correctAnswer: "A",
    explanation: {
      correctStatement: "A — SN1: two-step unimolecular; SN2: one-step bimolecular",
      intro: "SN1 and SN2 are nucleophilic substitution mechanisms:",
      steps: [
        "SN1: Step 1 — ionization forms carbocation (rate-determining); Step 2 — nucleophile attacks",
        "SN1 rate = k[substrate]; unimolecular; leads to racemization",
        "SN2: single concerted step — nucleophile attacks from back while leaving group departs",
        "SN2 rate = k[substrate][nucleophile]; bimolecular; leads to inversion (Walden inversion)",
      ],
      conclusion: "∴ SN1 = two-step unimolecular; SN2 = one-step bimolecular",
    },
    zh: {
      topic: "反应机理",
      question: "描述 SN1 和 SN2 反应的机理，并给出适当的例子和过渡态示意图。",
      explanation: {
        correctStatement: "A — SN1：两步单分子；SN2：一步双分子",
        intro: "SN1 和 SN2 是亲核取代反应机理：",
        steps: [
          "SN1：第一步——离子化形成碳正离子（决速步骤）；第二步——亲核试剂进攻",
          "SN1 速率 = k[底物]；单分子；导致消旋化",
          "SN2：一步协同——亲核试剂从背面进攻同时离去基团离开",
          "SN2 速率 = k[底物][亲核试剂]；双分子；导致构型翻转（Walden 翻转）",
        ],
        conclusion: "∴ SN1 = 两步单分子；SN2 = 一步双分子",
      },
    },
    dateAdded: "2026-07-17",
  },
  {
    id: "7",
    subject: "Mathematics",
    difficulty: "Easy",
    topic: "Integration",
    setName: "Mathematics 4",
    setSlug: "mathematics-4",
    question: "Find the area enclosed between the curves y = x² and y = 2x using definite integration.",
    options: [
      { key: "A", text: "4/3 square units", text_zh: "4/3 平方单位" },
      { key: "B", text: "2/3 square units", text_zh: "2/3 平方单位" },
      { key: "C", text: "8/3 square units", text_zh: "8/3 平方单位" },
      { key: "D", text: "1/3 square units", text_zh: "1/3 平方单位" },
    ],
    correctAnswer: "A",
    explanation: {
      correctStatement: "A — 4/3 square units",
      intro: "Find intersection points, then integrate the difference:",
      steps: [
        "Set x² = 2x → x(x−2) = 0 → x = 0 and x = 2",
        "Area = ∫₀² (2x − x²) dx",
        "= [x² − x³/3]₀²",
        "= (4 − 8/3) − 0 = 12/3 − 8/3 = 4/3",
      ],
      conclusion: "∴ Area = 4/3 square units",
    },
    zh: {
      topic: "积分",
      question: "用定积分求曲线 y = x² 与 y = 2x 围成的面积。",
      explanation: {
        correctStatement: "A — 4/3 平方单位",
        intro: "找交点，然后对差值积分：",
        steps: [
          "令 x² = 2x → x(x−2) = 0 → x = 0 和 x = 2",
          "面积 = ∫₀² (2x − x²) dx",
          "= [x² − x³/3]₀²",
          "= (4 − 8/3) − 0 = 12/3 − 8/3 = 4/3",
        ],
        conclusion: "∴ 面积 = 4/3 平方单位",
      },
    },
    dateAdded: "2026-07-16",
  },
  {
    id: "8",
    subject: "Physics",
    difficulty: "Hard",
    topic: "Electrostatics",
    setName: "Physics 4",
    setSlug: "physics-4",
    question: "A parallel plate capacitor is charged to V volts. If the distance between the plates is doubled, find the new energy stored in the capacitor.",
    options: [
      { key: "A", text: "Energy doubles", text_zh: "能量加倍" },
      { key: "B", text: "Energy halves", text_zh: "能量减半" },
      { key: "C", text: "Energy stays the same", text_zh: "能量不变" },
      { key: "D", text: "Energy quadruples", text_zh: "能量变为四倍" },
    ],
    correctAnswer: "A",
    explanation: {
      correctStatement: "A — Energy doubles",
      intro: "Analyze how capacitance and energy change when distance doubles (at constant charge Q):",
      steps: [
        "C = ε₀A/d; doubling d halves C → C′ = C/2",
        "At constant Q: V′ = Q/C′ = 2Q/C = 2V",
        "Energy U = Q²/2C; with C halved: U′ = Q²/(2·C/2) = Q²/C = 2U",
        "Alternatively: U = CV²/2; with C halved and V doubled, U′ = (C/2)(2V)²/2 = 2U",
      ],
      conclusion: "∴ Energy stored doubles when plate distance is doubled at constant charge",
    },
    zh: {
      topic: "静电学",
      question: "一平行板电容器充电至 V 伏。若两板间距加倍，求电容器储存的新能量。",
      explanation: {
        correctStatement: "A — 能量加倍",
        intro: "分析恒定电荷 Q 情况下间距加倍时，电容和能量的变化：",
        steps: [
          "C = ε₀A/d；间距加倍使电容减半 → C′ = C/2",
          "恒定 Q：V′ = Q/C′ = 2Q/C = 2V",
          "能量 U = Q²/2C；电容减半：U′ = Q²/(2·C/2) = Q²/C = 2U",
          "或：U = CV²/2；电容减半、电压加倍，U′ = (C/2)(2V)²/2 = 2U",
        ],
        conclusion: "∴ 在电荷守恒的条件下，极板间距加倍时，储存能量翻倍",
      },
    },
    dateAdded: "2026-07-15",
  },
  {
    id: "9",
    subject: "Chemistry",
    difficulty: "Hard",
    topic: "Chemical Bonding",
    setName: "Chemistry 5",
    setSlug: "chemistry-5",
    question: "Explain the hybridization of SF₆ and draw its 3D structure clearly showing all bond angles.",
    options: [
      { key: "A", text: "sp³d² hybridization; octahedral shape; 90° bond angles", text_zh: "sp³d² 杂化；正八面体形；键角 90°" },
      { key: "B", text: "sp³ hybridization; tetrahedral shape; 109.5° bond angles", text_zh: "sp³ 杂化；正四面体形；键角 109.5°" },
      { key: "C", text: "sp³d hybridization; trigonal bipyramidal; 120° and 90°", text_zh: "sp³d 杂化；三角双锥形；键角 120° 和 90°" },
      { key: "D", text: "sp² hybridization; planar triangular; 120° bond angles", text_zh: "sp² 杂化；平面三角形；键角 120°" },
    ],
    correctAnswer: "A",
    explanation: {
      correctStatement: "A — sp³d² hybridization; octahedral; 90° bond angles",
      intro: "Determine hybridization of sulfur in SF₆:",
      steps: [
        "S has 6 valence electrons; forms 6 bonds with F atoms",
        "6 bond pairs → 6 electron domains → sp³d² hybridization",
        "Uses one s, three p, and two d orbitals (5d level)",
        "6 bond pairs, 0 lone pairs → octahedral geometry; all F−S−F angles = 90°",
      ],
      conclusion: "∴ SF₆: sp³d², octahedral, bond angles = 90°",
    },
    zh: {
      topic: "化学键",
      question: "解释 SF₆ 的杂化类型，并清楚地画出所有键角的三维结构。",
      explanation: {
        correctStatement: "A — sp³d² 杂化；正八面体形；键角 90°",
        intro: "确定 SF₆ 中硫的杂化方式：",
        steps: [
          "S 有 6 个价电子；与 6 个 F 原子成键",
          "6 个成键电子对 → 6 个电子域 → sp³d² 杂化",
          "使用一个 s、三个 p 和两个 d 轨道（5d 能级）",
          "6 个成键电子对，0 个孤对电子 → 正八面体构型；所有 F−S−F 键角 = 90°",
        ],
        conclusion: "∴ SF₆：sp³d²，正八面体形，键角 = 90°",
      },
    },
    dateAdded: "2026-07-14",
  },
  {
    id: "10",
    subject: "Mathematics",
    difficulty: "Medium",
    topic: "Complex Numbers",
    setName: "Mathematics 5",
    setSlug: "mathematics-5",
    question: "Using De Moivre's theorem, find all the cube roots of unity and plot them on the Argand diagram.",
    options: [
      { key: "A", text: "1, ω, ω² where ω = e^(2πi/3)", text_zh: "1, ω, ω²，其中 ω = e^(2πi/3)" },
      { key: "B", text: "1, i, −1" },
      { key: "C", text: "1, −1, i" },
      { key: "D", text: "1, ω, ω² where ω = e^(πi/3)", text_zh: "1, ω, ω²，其中 ω = e^(πi/3)" },
    ],
    correctAnswer: "A",
    explanation: {
      correctStatement: "A — 1, ω, ω² where ω = e^(2πi/3)",
      intro: "Solve z³ = 1 using De Moivre's theorem:",
      steps: [
        "Write 1 = e^(2πki) for k = 0, 1, 2",
        "z = e^(2πki/3) for each value of k",
        "k=0: z₁ = 1; k=1: z₂ = e^(2πi/3) = ω; k=2: z₃ = e^(4πi/3) = ω²",
        "On Argand diagram: equally spaced at 120° on unit circle",
      ],
      conclusion: "∴ Cube roots of unity: 1, ω, ω² (120° apart on unit circle)",
    },
    zh: {
      topic: "复数",
      question: "利用棣莫弗定理，求所有单位复数的立方根，并在阿甘德图上作图。",
      explanation: {
        correctStatement: "A — 1, ω, ω²，其中 ω = e^(2πi/3)",
        intro: "用棣莫弗定理求解 z³ = 1：",
        steps: [
          "将 1 写成 e^(2πki)（k = 0, 1, 2）",
          "z = e^(2πki/3)（对每个 k 值）",
          "k=0：z₁ = 1；k=1：z₂ = e^(2πi/3) = ω；k=2：z₃ = e^(4πi/3) = ω²",
          "在阿甘德图上：单位圆上等间隔分布，相差 120°",
        ],
        conclusion: "∴ 单位复数的立方根：1, ω, ω²（在单位圆上相差 120°）",
      },
    },
    dateAdded: "2026-07-13",
  },
  {
    id: "11",
    subject: "Physics",
    difficulty: "Easy",
    topic: "Electromagnetism",
    setName: "Physics 4",
    setSlug: "physics-4",
    question: "State Faraday's laws of electromagnetic induction and provide two practical applications.",
    options: [
      { key: "A", text: "EMF = −dΦ/dt; applications: generators and transformers", text_zh: "EMF = −dΦ/dt；应用：发电机和变压器" },
      { key: "B", text: "EMF = dΦ/dt; applications: resistors and capacitors", text_zh: "EMF = dΦ/dt；应用：电阻和电容" },
      { key: "C", text: "EMF = Φ/t; applications: motors and LEDs", text_zh: "EMF = Φ/t；应用：电动机和LED" },
      { key: "D", text: "EMF = −Φ·t; applications: inductors and diodes", text_zh: "EMF = −Φ·t；应用：电感和二极管" },
    ],
    correctAnswer: "A",
    explanation: {
      correctStatement: "A — EMF = −dΦ/dt; generators and transformers",
      intro: "Faraday's two laws of electromagnetic induction:",
      steps: [
        "1st Law: An EMF is induced whenever the magnetic flux through a circuit changes",
        "2nd Law: Induced EMF = −dΦ/dt (rate of change of magnetic flux)",
        "Negative sign from Lenz's Law: induced current opposes the change in flux",
        "Applications: electric generators (mechanical → electrical energy); transformers (voltage stepping)",
      ],
      conclusion: "∴ EMF = −dΦ/dt; key applications: generators and transformers",
    },
    zh: {
      topic: "电磁学",
      question: "陈述法拉第电磁感应定律，并举出两个实际应用。",
      explanation: {
        correctStatement: "A — EMF = −dΦ/dt；发电机和变压器",
        intro: "法拉第电磁感应的两条定律：",
        steps: [
          "第一定律：只要穿过回路的磁通量发生变化，就会产生感应电动势",
          "第二定律：感应 EMF = −dΦ/dt（磁通量的变化率）",
          "负号来自楞次定律：感应电流阻碍磁通量的变化",
          "应用：发电机（机械能→电能）；变压器（电压变换）",
        ],
        conclusion: "∴ EMF = −dΦ/dt；主要应用：发电机和变压器",
      },
    },
    dateAdded: "2026-07-12",
  },
  {
    id: "12",
    setName: "Chemistry 5",
    setSlug: "chemistry-5",
    subject: "Chemistry",
    difficulty: "Easy",
    topic: "Solid State",
    question: "What are the key differences between crystalline and amorphous solids? Give two examples of each.",
    options: [
      { key: "A", text: "Crystalline: ordered, sharp MP (NaCl, diamond); Amorphous: disordered, no sharp MP (glass, rubber)", text_zh: "晶体：有序，熔点清晰（NaCl，金刚石）；非晶体：无序，无清晰熔点（玻璃，橡胶）" },
      { key: "B", text: "Crystalline: disordered (glass, rubber); Amorphous: ordered (NaCl, diamond)", text_zh: "晶体：无序（玻璃，橡胶）；非晶体：有序（NaCl，金刚石）" },
      { key: "C", text: "Both have sharp melting points; differ only in hardness", text_zh: "两者均有清晰熔点，仅硬度不同" },
      { key: "D", text: "Crystalline: no definite shape (wax, plastic); Amorphous: definite shape (quartz, iron)", text_zh: "晶体：无固定形状（蜡，塑料）；非晶体：有固定形状（石英，铁）" },
    ],
    correctAnswer: "A",
    explanation: {
      correctStatement: "A — Crystalline: ordered, sharp MP; Amorphous: disordered, no sharp MP",
      intro: "Compare crystalline and amorphous solids:",
      steps: [
        "Crystalline solids: long-range ordered arrangement of particles; sharp melting point; anisotropic",
        "Examples of crystalline: NaCl (ionic), diamond (covalent network)",
        "Amorphous solids: short-range order only; melt over a range of temperatures; isotropic",
        "Examples of amorphous: glass (supercooled liquid), rubber (polymer network)",
      ],
      conclusion: "∴ Crystalline = ordered + sharp MP; Amorphous = disordered + no sharp MP",
    },
    zh: {
      topic: "固态化学",
      question: "晶体固体与非晶体固体的主要区别是什么？各举两例。",
      explanation: {
        correctStatement: "A — 晶体：有序，熔点清晰；非晶体：无序，无清晰熔点",
        intro: "比较晶体与非晶体固体：",
        steps: [
          "晶体固体：粒子呈长程有序排列；有清晰熔点；各向异性",
          "晶体举例：NaCl（离子晶体）、金刚石（共价网状晶体）",
          "非晶体固体：仅有短程有序；在温度范围内软化；各向同性",
          "非晶体举例：玻璃（过冷液体）、橡胶（聚合物网络）",
        ],
        conclusion: "∴ 晶体 = 有序 + 清晰熔点；非晶体 = 无序 + 无清晰熔点",
      },
    },
    dateAdded: "2026-07-11",
  },
];
