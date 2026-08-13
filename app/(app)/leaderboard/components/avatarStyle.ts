import { CREAM, PRIMARY, INDIGO, PANDA, VIOLET, EMERALD } from "@/constants/colors";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: CREAM,     color: PRIMARY },
  { bg: "#EEF0FF", color: INDIGO  },
  { bg: "#FDF0EC", color: PANDA   },
  { bg: "#F5F3FF", color: VIOLET  },
  { bg: "#ECFDF5", color: EMERALD },
];

export function avatarStyle(index: number) {
  return AVATAR_PALETTE[index % AVATAR_PALETTE.length];
}

export const RANK_MEDAL: Record<number, { color: string; label: string }> = {
  1: { color: "#D4A017", label: "🥇" },
  2: { color: "#9CA3AF", label: "🥈" },
  3: { color: "#CD7F32", label: "🥉" },
};
