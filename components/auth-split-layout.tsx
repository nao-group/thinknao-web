import { Box, Group, Text, rem } from "@mantine/core";
import { IconLayoutGrid } from "@tabler/icons-react";

const FEATURES = ["Practice & Mock Exams", "AI Assistant", "Flashcards"];

function ThinkNaoLogo() {
  return (
    <Group gap={10} wrap="nowrap">
      <Box
        style={{
          width: rem(36),
          height: rem(36),
          borderRadius: rem(8),
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <IconLayoutGrid size={20} stroke={1.5} color="#0F172A" />
      </Box>
      <Text fw={700} size="md" c="white" lh={1}>
        ThinkNao
      </Text>
    </Group>
  );
}

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box style={{ display: "flex", minHeight: "100dvh" }}>
      {/* Left hero panel */}
      <Box
        visibleFrom="md"
        style={{
          width: "42%",
          flexShrink: 0,
          backgroundColor: "#0F172A",
          backgroundImage:
            "radial-gradient(ellipse at 30% 60%, rgba(212,160,23,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(102,112,176,0.08) 0%, transparent 50%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: rem(40),
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circle */}
        <Box
          style={{
            position: "absolute",
            bottom: "-120px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />

        <ThinkNaoLogo />

        <Box>
          <Text
            fw={700}
            c="white"
            lh={1.2}
            mb={16}
            style={{ fontSize: rem(34) }}
          >
            Study smarter for your CSCA exam.
          </Text>
          <Text size="sm" c="rgba(255,255,255,0.6)" lh={1.6}>
            Adaptive practice, AI mock exams, and a study buddy who actually gets your questions.
          </Text>
        </Box>

        <Group gap="xs">
          {FEATURES.map((f, i) => (
            <Group key={f} gap="xs">
              {i > 0 && (
                <Box
                  style={{
                    width: rem(4),
                    height: rem(4),
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.3)",
                  }}
                />
              )}
              <Text size="xs" c="rgba(255,255,255,0.5)">
                {f}
              </Text>
            </Group>
          ))}
        </Group>
      </Box>

      {/* Right form panel */}
      <Box
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: rem(40),
          backgroundColor: "white",
          overflowY: "auto",
        }}
      >
        <Box style={{ width: "100%", maxWidth: rem(420) }}>{children}</Box>
      </Box>
    </Box>
  );
}
