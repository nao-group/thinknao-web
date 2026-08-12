import type React from "react";
import { IconAtom, IconBook, IconFlask, IconMathFunction, IconMicroscope } from "@tabler/icons-react";
import { CREAM, PRIMARY, INDIGO, PANDA, VIOLET, EMERALD } from "@/constants/colors";
import type { Subject } from "../types";

export const SUBJECT_META: Record<Subject, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
  "Liberal Arts Chinese": { icon: IconBook,        iconBg: "#F5F3FF", iconColor: VIOLET  },
  "Science Chinese":      { icon: IconMicroscope,  iconBg: "#ECFDF5", iconColor: EMERALD },
  Mathematics:            { icon: IconMathFunction, iconBg: CREAM,    iconColor: PRIMARY },
  Physics:                { icon: IconAtom,         iconBg: "#EEF0FF", iconColor: INDIGO  },
  Chemistry:              { icon: IconFlask,        iconBg: "#FDF0EC", iconColor: PANDA   },
};
