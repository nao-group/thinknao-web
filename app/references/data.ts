export type Subject = "Mathematics" | "Physics" | "Chemistry" | "Liberal Arts Chinese" | "Science Chinese";

export interface WordEntry {
  id: string;
  subject: Subject;
  term: string;       // English term
  zh?: string;        // Chinese characters
  pinyin?: string;    // Romanised pronunciation
  definition: string;
  example?: string;
}

export interface FormulaEntry {
  id: string;
  subject: Subject;
  name: string;       // English name
  zhName?: string;    // Chinese name
  pinyin?: string;
  formula: string;
  description: string;
  variables?: string[];
}

export const WORDS: WordEntry[] = [
  // Mathematics
  {
    id: "w1", subject: "Mathematics", term: "Derivative",
    zh: "导数", pinyin: "Dǎoshù",
    definition: "The instantaneous rate of change of a function with respect to one of its variables.",
    example: "If f(x) = x², then f′(x) = 2x.",
  },
  {
    id: "w2", subject: "Mathematics", term: "Integral",
    zh: "积分", pinyin: "Jīfēn",
    definition: "The reverse process of differentiation; represents the accumulated area under a curve.",
    example: "∫x dx = x²/2 + C",
  },
  {
    id: "w3", subject: "Mathematics", term: "Asymptote",
    zh: "渐近线", pinyin: "Jiànjìnxiàn",
    definition: "A line that a curve approaches arbitrarily closely but never actually reaches.",
    example: "y = 1/x has a vertical asymptote at x = 0.",
  },
  {
    id: "w4", subject: "Mathematics", term: "Vector",
    zh: "向量", pinyin: "Xiàngliàng",
    definition: "A quantity possessing both magnitude and direction, typically represented as an arrow.",
    example: "Velocity is a vector; speed is a scalar.",
  },
  {
    id: "w5", subject: "Mathematics", term: "Convergence",
    zh: "收敛", pinyin: "Shōuliǎn",
    definition: "The property of a sequence or series approaching a finite limit as terms increase without bound.",
    example: "1 + 1/2 + 1/4 + … converges to 2.",
  },
  {
    id: "w6", subject: "Mathematics", term: "Matrix",
    zh: "矩阵", pinyin: "Jǔzhèn",
    definition: "A rectangular array of numbers arranged in rows and columns used to represent linear transformations.",
    example: "A 2×3 matrix has 2 rows and 3 columns.",
  },
  // Physics
  {
    id: "w7", subject: "Physics", term: "Momentum",
    zh: "动量", pinyin: "Dòngliàng",
    definition: "A measure of the quantity of motion of a body; the product of its mass and velocity.",
    example: "A 5 kg object at 3 m/s has momentum p = 15 kg·m/s.",
  },
  {
    id: "w8", subject: "Physics", term: "Inertia",
    zh: "惯性", pinyin: "Guànxìng",
    definition: "The tendency of an object to resist any change in its state of motion unless acted upon by an external force.",
    example: "A stationary book stays at rest due to inertia.",
  },
  {
    id: "w9", subject: "Physics", term: "Resonance",
    zh: "共振", pinyin: "Gòngzhèn",
    definition: "The tendency of a system to oscillate with greater amplitude when driven at its natural frequency.",
    example: "A swing reaches its maximum height when pushed at its natural frequency.",
  },
  {
    id: "w10", subject: "Physics", term: "Refraction",
    zh: "折射", pinyin: "Zhéshè",
    definition: "The bending of a wave as it passes obliquely from one medium into another of different density.",
    example: "A straw appears bent when placed in a glass of water.",
  },
  {
    id: "w11", subject: "Physics", term: "Entropy",
    zh: "熵", pinyin: "Shāng",
    definition: "A thermodynamic quantity representing the degree of disorder or randomness in a system.",
    example: "Ice melting into water increases the entropy of the system.",
  },
  {
    id: "w12", subject: "Physics", term: "Equilibrium",
    zh: "平衡", pinyin: "Pínghéng",
    definition: "A state in which all competing influences are balanced, resulting in zero net force or change.",
    example: "A book resting on a table is in mechanical equilibrium.",
  },
  // Chemistry
  {
    id: "w13", subject: "Chemistry", term: "Mole",
    zh: "摩尔", pinyin: "Mó'ěr",
    definition: "A unit of amount equal to 6.022 × 10²³ particles (Avogadro's number) of any substance.",
    example: "One mole of carbon-12 has a mass of exactly 12 grams.",
  },
  {
    id: "w14", subject: "Chemistry", term: "Isotope",
    zh: "同位素", pinyin: "Tóngwèisù",
    definition: "Atoms of the same element that have equal numbers of protons but different numbers of neutrons.",
    example: "Carbon-12 and Carbon-14 are isotopes of carbon.",
  },
  {
    id: "w15", subject: "Chemistry", term: "Catalyst",
    zh: "催化剂", pinyin: "Cuīhuàjì",
    definition: "A substance that increases the rate of a chemical reaction without being permanently consumed.",
    example: "Enzymes are biological catalysts.",
  },
  {
    id: "w16", subject: "Chemistry", term: "Electrolyte",
    zh: "电解质", pinyin: "Diànjiězhì",
    definition: "A substance that dissociates into ions when dissolved in water, making the solution electrically conductive.",
    example: "Sodium chloride (NaCl) is a strong electrolyte.",
  },
  {
    id: "w17", subject: "Chemistry", term: "Oxidation",
    zh: "氧化", pinyin: "Yǎnghuà",
    definition: "A chemical process in which an atom, ion, or molecule loses one or more electrons.",
    example: "Fe → Fe²⁺ + 2e⁻ (iron is oxidized when it rusts)",
  },
  {
    id: "w18", subject: "Chemistry", term: "Reduction",
    zh: "还原", pinyin: "Huányuán",
    definition: "A chemical process in which an atom, ion, or molecule gains one or more electrons.",
    example: "Cu²⁺ + 2e⁻ → Cu (copper ion is reduced to copper metal)",
  },
  // Liberal Arts Chinese
  { id: "w19", subject: "Liberal Arts Chinese", term: "Four-Character Idiom",
    zh: "成语", pinyin: "Chéngyǔ",
    definition: "A four-character idiomatic expression rooted in classical Chinese history or literature, conveying deep meaning concisely.",
    example: "\"望梅止渴\" — quench thirst by thinking of plums (to console oneself with false hopes)." },
  { id: "w20", subject: "Liberal Arts Chinese", term: "Personification",
    zh: "拟人", pinyin: "Nǐrén",
    definition: "A rhetorical device that attributes human qualities, emotions, or actions to non-human things.",
    example: "\"风在树间低语\" — The wind whispers among the trees." },
  { id: "w21", subject: "Liberal Arts Chinese", term: "Metaphor / Simile",
    zh: "比喻", pinyin: "Bǐyù",
    definition: "Comparing one thing to another using 像 (like), 如 (as), or 是 (is) to create vivid imagery.",
    example: "\"月亮像一块银盘\" — The moon is like a silver plate." },
  { id: "w22", subject: "Liberal Arts Chinese", term: "Imagery",
    zh: "意象", pinyin: "Yìxiàng",
    definition: "A vivid picture created through language in poetry or prose that evokes sensory experience and emotion.",
    example: "The 'falling leaves' (落叶) image often symbolises parting, melancholy, or the passage of time." },
  { id: "w23", subject: "Liberal Arts Chinese", term: "Parallelism",
    zh: "排比", pinyin: "Páibǐ",
    definition: "A rhetorical device using three or more grammatically parallel clauses to build rhythm and emphasis.",
    example: "\"我们要努力学习，我们要认真思考，我们要勤于实践。\"" },
  { id: "w24", subject: "Liberal Arts Chinese", term: "Classical Allusion",
    zh: "典故", pinyin: "Diǎngù",
    definition: "A reference to a famous historical event, person, or literary work to add depth and authority.",
    example: "\"破釜沉舟\" alludes to Xiang Yu destroying his boats, signifying total commitment." },
  // Science Chinese
  { id: "w25", subject: "Science Chinese", term: "Photosynthesis",
    zh: "光合作用", pinyin: "Guānghé zuòyòng",
    definition: "The process by which plants use sunlight, water, and CO₂ to produce glucose and oxygen.",
    example: "6CO₂ + 6H₂O + 光能 → C₆H₁₂O₆ + 6O₂" },
  { id: "w26", subject: "Science Chinese", term: "Gene",
    zh: "基因", pinyin: "Jīyīn",
    definition: "The basic unit of heredity encoded in DNA that determines the characteristics of living organisms.",
    example: "基因突变可能导致遗传疾病 — Gene mutations may cause hereditary diseases." },
  { id: "w27", subject: "Science Chinese", term: "Biodegradation",
    zh: "生物降解", pinyin: "Shēngwù jiàngjiě",
    definition: "The breakdown of organic matter by microorganisms into simpler, environmentally harmless substances.",
    example: "可生物降解塑料对环境更友好 — Biodegradable plastics are more environmentally friendly." },
  { id: "w28", subject: "Science Chinese", term: "Catalyst",
    zh: "催化剂", pinyin: "Cuīhuàjì",
    definition: "A substance that increases the rate of a chemical reaction without being consumed in the process.",
    example: "二氧化锰是双氧水分解的催化剂 — MnO₂ is a catalyst for the decomposition of H₂O₂." },
  { id: "w29", subject: "Science Chinese", term: "Inertia",
    zh: "惯性", pinyin: "Guànxìng",
    definition: "The tendency of an object to resist any change in its state of motion, as stated in Newton's First Law.",
    example: "急刹车时乘客向前倾 — Passengers lean forward when a vehicle brakes suddenly (due to inertia)." },
  { id: "w30", subject: "Science Chinese", term: "Radiation",
    zh: "辐射", pinyin: "Fúshè",
    definition: "The emission and propagation of energy through space or a medium in the form of waves or particles.",
    example: "太阳能以辐射形式传播到地球 — Solar energy travels to Earth in the form of radiation." },
];

export const FORMULAS: FormulaEntry[] = [
  // Mathematics
  {
    id: "f1", subject: "Mathematics", name: "Quadratic Formula",
    zhName: "求根公式", pinyin: "Qiúgēn gōngshì",
    formula: "x = (−b ± √(b²−4ac)) / 2a",
    description: "Finds the roots of any quadratic equation ax² + bx + c = 0.",
    variables: ["a = leading coefficient", "b = middle coefficient", "c = constant term"],
  },
  {
    id: "f2", subject: "Mathematics", name: "Pythagorean Theorem",
    zhName: "勾股定理", pinyin: "Gōugǔ dìnglǐ",
    formula: "a² + b² = c²",
    description: "Relates the three sides of a right-angled triangle.",
    variables: ["a, b = legs of the right triangle", "c = hypotenuse"],
  },
  {
    id: "f3", subject: "Mathematics", name: "Circle Area",
    zhName: "圆面积公式", pinyin: "Yuán miànjī gōngshì",
    formula: "A = πr²",
    description: "Calculates the area enclosed by a circle of radius r.",
    variables: ["A = area", "r = radius", "π ≈ 3.14159"],
  },
  {
    id: "f4", subject: "Mathematics", name: "Power Rule",
    zhName: "幂函数求导", pinyin: "Mì hánshù qiúdǎo",
    formula: "d/dx[xⁿ] = nxⁿ⁻¹",
    description: "Differentiates any power function; the most fundamental differentiation rule.",
    variables: ["n = any real exponent"],
  },
  {
    id: "f5", subject: "Mathematics", name: "Geometric Series Sum",
    zhName: "等比数列求和", pinyin: "Děngbǐ shùliè qiúhé",
    formula: "S = a(1 − rⁿ) / (1 − r)",
    description: "Gives the sum of the first n terms of a geometric series.",
    variables: ["a = first term", "r = common ratio (r ≠ 1)", "n = number of terms"],
  },
  {
    id: "f6", subject: "Mathematics", name: "Distance Formula",
    zhName: "距离公式", pinyin: "Jùlí gōngshì",
    formula: "d = √((x₂−x₁)² + (y₂−y₁)²)",
    description: "Calculates the straight-line distance between two points in the coordinate plane.",
    variables: ["(x₁,y₁) and (x₂,y₂) = coordinates of the two points"],
  },
  // Physics
  {
    id: "f7", subject: "Physics", name: "Newton's Second Law",
    zhName: "牛顿第二定律", pinyin: "Niúdùn dì'èr dìnglǜ",
    formula: "F = ma",
    description: "States that the net force on an object equals its mass multiplied by its acceleration.",
    variables: ["F = net force (N)", "m = mass (kg)", "a = acceleration (m/s²)"],
  },
  {
    id: "f8", subject: "Physics", name: "Kinetic Energy",
    zhName: "动能公式", pinyin: "Dòng néng gōngshì",
    formula: "KE = ½mv²",
    description: "The energy an object possesses due to its motion.",
    variables: ["m = mass (kg)", "v = speed (m/s)"],
  },
  {
    id: "f9", subject: "Physics", name: "Gravitational PE",
    zhName: "重力势能", pinyin: "Zhònglì shìnéng",
    formula: "PE = mgh",
    description: "The potential energy stored by an object held at height h above a reference point.",
    variables: ["m = mass (kg)", "g = 9.8 m/s²", "h = height (m)"],
  },
  {
    id: "f10", subject: "Physics", name: "Ohm's Law",
    zhName: "欧姆定律", pinyin: "Ōumǔ dìnglǜ",
    formula: "V = IR",
    description: "Relates voltage, current, and resistance in a linear electrical circuit.",
    variables: ["V = voltage (V)", "I = current (A)", "R = resistance (Ω)"],
  },
  {
    id: "f11", subject: "Physics", name: "Wave Speed",
    zhName: "波速公式", pinyin: "Bōsù gōngshì",
    formula: "v = fλ",
    description: "Relates the speed of a wave to its frequency and wavelength.",
    variables: ["v = wave speed (m/s)", "f = frequency (Hz)", "λ = wavelength (m)"],
  },
  {
    id: "f12", subject: "Physics", name: "Mass-Energy Equivalence",
    zhName: "质能方程", pinyin: "Zhì néng fāngchéng",
    formula: "E = mc²",
    description: "Einstein's equation describing the equivalence of mass and energy.",
    variables: ["E = energy (J)", "m = mass (kg)", "c ≈ 3×10⁸ m/s (speed of light)"],
  },
  // Chemistry
  {
    id: "f13", subject: "Chemistry", name: "Ideal Gas Law",
    zhName: "理想气体方程", pinyin: "Lǐxiǎng qìtǐ fāngchéng",
    formula: "PV = nRT",
    description: "Relates the pressure, volume, temperature, and quantity of an ideal gas.",
    variables: ["P = pressure (atm)", "V = volume (L)", "n = moles", "R = 0.0821 L·atm/mol·K", "T = temperature (K)"],
  },
  {
    id: "f14", subject: "Chemistry", name: "pH Formula",
    zhName: "酸碱度公式", pinyin: "Suānjiǎn dù gōngshì",
    formula: "pH = −log[H⁺]",
    description: "Measures the acidity or basicity of a solution on a scale from 0 to 14.",
    variables: ["[H⁺] = hydrogen ion concentration (mol/L)"],
  },
  {
    id: "f15", subject: "Chemistry", name: "Molarity",
    zhName: "摩尔浓度", pinyin: "Mó'ěr nóngdù",
    formula: "M = n / V",
    description: "Expresses the concentration of a solution as moles of solute per liter.",
    variables: ["M = molarity (mol/L)", "n = moles of solute", "V = volume of solution (L)"],
  },
  {
    id: "f16", subject: "Chemistry", name: "Enthalpy of Reaction",
    zhName: "反应焓变", pinyin: "Fǎnyìng hǎn biàn",
    formula: "ΔH = Σ ΔHf(products) − Σ ΔHf(reactants)",
    description: "Calculates the total heat released or absorbed during a chemical reaction.",
    variables: ["ΔH = enthalpy change (kJ/mol)", "ΔHf = standard enthalpy of formation"],
  },
  {
    id: "f17", subject: "Chemistry", name: "Rate Law",
    zhName: "速率方程", pinyin: "Sùlǜ fāngchéng",
    formula: "Rate = k[A]ᵐ[B]ⁿ",
    description: "Expresses the reaction rate as a function of reactant concentrations.",
    variables: ["k = rate constant", "[A],[B] = molar concentrations", "m,n = reaction orders"],
  },
  {
    id: "f18", subject: "Chemistry", name: "Nernst Equation",
    zhName: "能斯特方程", pinyin: "Néngsītè fāngchéng",
    formula: "E = E° − (RT / nF) ln Q",
    description: "Calculates the electrochemical cell potential under non-standard conditions.",
    variables: ["E° = standard cell potential (V)", "R = 8.314 J/mol·K", "T = temperature (K)", "n = electrons transferred", "F = 96485 C/mol", "Q = reaction quotient"],
  },
];
