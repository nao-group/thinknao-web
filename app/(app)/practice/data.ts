import {
  IconAtom,
  IconBook,
  IconFlask,
  IconMathFunction,
  IconMicroscope,
} from "@tabler/icons-react";
import { PRIMARY, CREAM, INDIGO, PANDA, VIOLET, EMERALD } from "@/constants/colors";

// ─── Constants ────────────────────────────────────────────────────────────────

export const SUBJECTS = [
  { key: "math",    label: "Mathematics",         icon: IconMathFunction, iconBg: CREAM,     iconColor: PRIMARY, subjectCode: "MT" },
  { key: "physics", label: "Physics",              icon: IconAtom,         iconBg: "#EEF0FF", iconColor: INDIGO,  subjectCode: "PH" },
  { key: "chem",    label: "Chemistry",            icon: IconFlask,        iconBg: "#FDF0EC", iconColor: PANDA,   subjectCode: "CM" },
  { key: "lac",     label: "Humanities Chinese", icon: IconBook,         iconBg: "#F5F3FF", iconColor: VIOLET,  subjectCode: "WH" },
  { key: "sc",      label: "STEM Chinese",      icon: IconMicroscope,   iconBg: "#ECFDF5", iconColor: EMERALD, subjectCode: "LH" },
] as const;

export type SubjectKey = (typeof SUBJECTS)[number]["key"];

export interface TopicGroupDefinition {
  label: string;
  topics: readonly string[];
}

/** Frontend-only learning paths. Topic names are matched against the API response. */
export const TOPIC_GROUPS: Partial<Record<SubjectKey, readonly TopicGroupDefinition[]>> = {
  math: [
    { label: "Sets and Inequalities", topics: ["Sets", "Inequalities"] },
    { label: "Functions", topics: ["Functions", "Elementary Functions", "Sequences", "Calculus"] },
    { label: "Geometry and Algebra", topics: ["Complex Numbers", "Vectors", "Analytic Geometry", "Space Coordinate System", "Solid Geometry"] },
    { label: "Probability and Statistics", topics: ["Probability and Statistics"] },
  ],
  physics: [
    { label: "Mechanics", topics: ["Kinematics", "Newton's Laws of Motion", "Work and Energy", "Momentum and Impulse", "Circular Motion and Gravitation"] },
    { label: "Electricity and Magnetism", topics: ["Electrostatics", "Electric Circuits", "Magnetic Field", "Electromagnetic Induction"] },
    { label: "Waves and Optics", topics: ["Simple Harmonic Motion and Waves", "Geometrical Optics", "Physical Optics"] },
    { label: "Thermodynamics", topics: ["Molecular Kinetic Theory", "Gas Laws", "Laws of Thermodynamics"] },
    { label: "Modern Physics", topics: ["Photoelectric Effect", "Atomic Structure", "Nuclear Physics"] },
  ],
  chem: [
    { label: "Basic Chemical Concepts", topics: ["Matter and Classification of Substances", "Atomic Structure and Periodic Table", "Chemical Nomenclature and Equation Writing", "Mole Calculation"] },
    { label: "Inorganic Chemistry", topics: ["Inorganic Properties", "Ionic Reactions and Tests", "Redox Reactions", "Chemical Experiment and Application", "Industrial Chemistry Process"] },
    { label: "Organic Chemistry", topics: ["Basic Organic Chemistry"] },
    { label: "Physical Chemistry", topics: ["Chemical Bonding and Intermolecular Forces", "Ideal Gas Law", "Electrolyte Solution Theory", "Solution Concentration and pH", "Chemical Reaction Rate and Equilibrium"] },
  ],
};

/** Visual metadata keyed by API subject_code */
export const SUBJECT_META: Record<string, {
  icon: React.ComponentType<{ size?: number; stroke?: number; color?: string }>;
  iconBg: string;
  iconColor: string;
}> = {
  MT: { icon: IconMathFunction, iconBg: CREAM,     iconColor: PRIMARY },
  PH: { icon: IconAtom,         iconBg: "#EEF0FF", iconColor: INDIGO  },
  CM: { icon: IconFlask,        iconBg: "#FDF0EC", iconColor: PANDA   },
  WH: { icon: IconBook,         iconBg: "#F5F3FF", iconColor: VIOLET  },
  LH: { icon: IconMicroscope,   iconBg: "#ECFDF5", iconColor: EMERALD },
};

export const QUESTION_COUNTS = [10, 20, 40, "Custom"] as const;
export const PAGE_SIZE = 10;
