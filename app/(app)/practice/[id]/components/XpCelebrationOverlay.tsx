"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Box, Text } from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import { PRIMARY } from "@/constants/colors";
import { formatXp } from "@/lib/format";

// Bigger, wider burst than the inline pill's — this one's meant to read from across the screen.
const BURST_STARS = [
  { angle: -75, delay: 0,    size: 20 },
  { angle: -35, delay: 0.04, size: 15 },
  { angle: -10, delay: 0.08, size: 18 },
  { angle: 15,  delay: 0.02, size: 14 },
  { angle: 45,  delay: 0.06, size: 20 },
  { angle: 80,  delay: 0.03, size: 16 },
  { angle: 130, delay: 0.05, size: 17 },
  { angle: 165, delay: 0.01, size: 14 },
  { angle: -150, delay: 0.07, size: 19 },
  { angle: -115, delay: 0.03, size: 15 },
];

/** Center-screen "+XP" celebration — pops in, holds, fades over ~1s. Remount via `key` to replay. */
export function XpCelebrationOverlay({ xp }: { xp: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <Box
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 10000,
      }}
    >
      <Box style={{ position: "relative", animation: "xpCelebrateWrap 1000ms ease forwards" }}>
        <Box
          style={{
            position: "absolute",
            inset: 0,
            margin: "auto",
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${PRIMARY}33 0%, transparent 70%)`,
          }}
        />
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
              animation: `xpCelebrateBurst 900ms ease-out ${star.delay}s forwards`,
              // @ts-expect-error -- CSS custom property, not in React's CSSProperties type
              "--angle": `${star.angle}deg`,
              opacity: 0,
            }}
          />
        ))}
        <Box
          px="xl"
          py="md"
          style={{
            position: "relative",
            backgroundColor: "#FFF9EC",
            border: `2px solid ${PRIMARY}`,
            borderRadius: 999,
            boxShadow: "0 8px 24px rgba(212, 160, 23, 0.25)",
            animation: "xpCelebratePop 450ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <Text size="28px" fw={900} c={PRIMARY} style={{ lineHeight: 1 }}>+{formatXp(xp)} XP</Text>
        </Box>
      </Box>

      <style>{`
        @keyframes xpCelebratePop {
          0%   { transform: scale(0.3); opacity: 0; }
          55%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes xpCelebrateBurst {
          0%   { opacity: 0; transform: rotate(var(--angle)) translateY(0) scale(0.5); }
          20%  { opacity: 1; }
          100% { opacity: 0; transform: rotate(var(--angle)) translateY(-70px) scale(1); }
        }
        @keyframes xpCelebrateWrap {
          0%, 70% { opacity: 1; }
          100%    { opacity: 0; }
        }
      `}</style>
    </Box>,
    document.body
  );
}
