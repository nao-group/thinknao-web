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
import type { Subject } from "./types";

// ─── Subject config ─────────────────────────────────────────────────────────────
// questionCount targets mirror the backend's EXAM_QUESTION_COUNTS
// (nao-service/services/member/exam.py) — kept in sync manually, since
// there's no shared config source between frontend and backend today.

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
