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
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: {
    correctStatement: string;
    intro: string;
    steps: string[];
    conclusion: string;
  };
  dateAdded: string;
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
      { key: "A", text: "f′(x) = 4x + 3; critical point at x = −3/4" },
      { key: "B", text: "f′(x) = 4x − 3; critical point at x = 3/4" },
      { key: "C", text: "f′(x) = 2x + 3; critical point at x = −3/2" },
      { key: "D", text: "f′(x) = 4x + 3; critical point at x = 3/4" },
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
      { key: "A", text: "C₆H₁₂O₆; optical isomerism" },
      { key: "B", text: "C₆H₁₂O₆; structural isomerism" },
      { key: "C", text: "C₁₂H₂₂O₁₁; optical isomerism" },
      { key: "D", text: "C₆H₁₀O₅; geometric isomerism" },
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
      { key: "A", text: "E = hf − φ, where φ is the work function" },
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
      { key: "A", text: "SN1: two-step, unimolecular; SN2: one-step, bimolecular" },
      { key: "B", text: "SN1: one-step, bimolecular; SN2: two-step, unimolecular" },
      { key: "C", text: "Both are two-step bimolecular mechanisms" },
      { key: "D", text: "SN1 involves inversion; SN2 involves racemization" },
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
      { key: "A", text: "4/3 square units" },
      { key: "B", text: "2/3 square units" },
      { key: "C", text: "8/3 square units" },
      { key: "D", text: "1/3 square units" },
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
      { key: "A", text: "Energy doubles" },
      { key: "B", text: "Energy halves" },
      { key: "C", text: "Energy stays the same" },
      { key: "D", text: "Energy quadruples" },
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
      { key: "A", text: "sp³d² hybridization; octahedral shape; 90° bond angles" },
      { key: "B", text: "sp³ hybridization; tetrahedral shape; 109.5° bond angles" },
      { key: "C", text: "sp³d hybridization; trigonal bipyramidal; 120° and 90°" },
      { key: "D", text: "sp² hybridization; planar triangular; 120° bond angles" },
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
      { key: "A", text: "1, ω, ω² where ω = e^(2πi/3)" },
      { key: "B", text: "1, i, −1" },
      { key: "C", text: "1, −1, i" },
      { key: "D", text: "1, ω, ω² where ω = e^(πi/3)" },
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
      { key: "A", text: "EMF = −dΦ/dt; applications: generators and transformers" },
      { key: "B", text: "EMF = dΦ/dt; applications: resistors and capacitors" },
      { key: "C", text: "EMF = Φ/t; applications: motors and LEDs" },
      { key: "D", text: "EMF = −Φ·t; applications: inductors and diodes" },
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
      { key: "A", text: "Crystalline: ordered, sharp MP (NaCl, diamond); Amorphous: disordered, no sharp MP (glass, rubber)" },
      { key: "B", text: "Crystalline: disordered (glass, rubber); Amorphous: ordered (NaCl, diamond)" },
      { key: "C", text: "Both have sharp melting points; differ only in hardness" },
      { key: "D", text: "Crystalline: no definite shape (wax, plastic); Amorphous: definite shape (quartz, iron)" },
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
    dateAdded: "2026-07-11",
  },
];
