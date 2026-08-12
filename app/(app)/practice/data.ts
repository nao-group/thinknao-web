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
  { key: "lac",     label: "Liberal Arts Chinese", icon: IconBook,         iconBg: "#F5F3FF", iconColor: VIOLET,  subjectCode: "WH" },
  { key: "sc",      label: "Science Chinese",      icon: IconMicroscope,   iconBg: "#ECFDF5", iconColor: EMERALD, subjectCode: "LH" },
] as const;

export type SubjectKey = (typeof SUBJECTS)[number]["key"];

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
