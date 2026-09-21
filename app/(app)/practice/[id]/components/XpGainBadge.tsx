"use client";

import { Box, Text, rem } from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import { PRIMARY } from "@/constants/colors";

// Fixed angles (not random) so this stays deterministic and SSR-safe.
const BURST_STARS = [
  { angle: -60, delay: 0,    size: 10 },
  { angle: -20, delay: 0.03, size: 13 },
  { angle: 20,  delay: 0.06, size: 11 },
  { angle: 60,  delay: 0.02, size: 9  },
  { angle: -90, delay: 0.08, size: 8  },
  { angle: 90,  delay: 0.05, size: 12 },
];

/** Pop-in "+XP" pill with a little gold star burst — remount (via `key`) to replay. */
export function XpGainBadge({ xp }: { xp: number }) {
  return (
    <Box style={{ position: "relative", display: "inline-flex" }}>
      {BURST_STARS.map((star, i) => (
        <IconStarFilled
          key={i}
          size={star.size}
          color={PRIMARY}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            marginTop: -star.size / 2,
            marginLeft: -star.size / 2,
            animation: `xpStarBurst 650ms ease-out ${star.delay}s forwards`,
            // @ts-expect-error -- CSS custom property, not in React's CSSProperties type
            "--angle": `${star.angle}deg`,
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      ))}
      <Box
        px="sm"
        py={4}
        style={{
          backgroundColor: "#FFF9EC",
          border: `1.5px solid ${PRIMARY}`,
          borderRadius: rem(999),
          animation: "xpPillPop 420ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          position: "relative",
        }}
      >
        <Text size="xs" fw={700} c={PRIMARY}>+{xp} XP</Text>
      </Box>

      <style>{`
        @keyframes xpPillPop {
          0%   { transform: scale(0.4); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes xpStarBurst {
          0% {
            opacity: 0;
            transform: rotate(var(--angle)) translateY(0) scale(0.5);
          }
          25% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: rotate(var(--angle)) translateY(-32px) scale(1);
          }
        }
      `}</style>
    </Box>
  );
}
