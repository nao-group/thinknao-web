"use client";

import {
  Badge,
  Box,
  Button,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  UnstyledButton,
  rem,
} from "@mantine/core";
import { INK, SURFACE, PRIMARY, CREAM, MUTED, VIOLET } from "@/constants/colors";
import type { Lang } from "@/components/language-toggle";
import { ALL_QUESTIONS, ALL_SUBJECTS, SUBJECT_CONFIG, SUBJECT_META } from "../data";
import type { Subject } from "../types";

interface SetupModalProps {
  opened: boolean;
  onClose: () => void;
  setupSubject: Subject;
  onSetupSubjectChange: (subject: Subject) => void;
  setupLang: Lang;
  onSetupLangChange: (lang: Lang) => void;
  onStart: () => void;
  passMark: number;
}

// ─── Exam setup modal (landing phase) ──────────────────────────────────────────

export function SetupModal({
  opened,
  onClose,
  setupSubject,
  onSetupSubjectChange,
  setupLang,
  onSetupLangChange,
  onStart,
  passMark,
}: SetupModalProps) {
  const cfg = SUBJECT_CONFIG[setupSubject];
  const isLangFixed = !!cfg.langFixed;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700} size="md" c={INK}>Exam Setup</Text>}
      centered
      radius="lg"
      size="md"
    >
      <Stack gap="lg">
        {/* Subject selection */}
        <Box>
          <Text size="sm" fw={600} c={INK} mb={4}>Subject</Text>
          <Text size="xs" c="dimmed" mb="sm">Choose one subject for this exam session.</Text>
          <Stack gap="xs">
            {ALL_SUBJECTS.map((subj) => {
              const meta = SUBJECT_META[subj];
              const Icon = meta.icon;
              const selected = setupSubject === subj;
              const subCfg = SUBJECT_CONFIG[subj];
              return (
                <UnstyledButton
                  key={subj}
                  onClick={() => onSetupSubjectChange(subj)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: rem(12),
                    padding: `${rem(10)} ${rem(14)}`,
                    borderRadius: rem(10),
                    border: `2px solid ${selected ? meta.iconColor : "#E2E8F0"}`,
                    backgroundColor: selected ? meta.iconBg : "white",
                    transition: "all 150ms ease",
                  }}
                >
                  <Box style={{ width: rem(32), height: rem(32), borderRadius: rem(8), backgroundColor: selected ? meta.iconColor : SURFACE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={16} stroke={1.5} color={selected ? "white" : MUTED} />
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text size="sm" fw={600} c={selected ? INK : MUTED}>{subj}</Text>
                    <Text size="xs" c="dimmed">{subCfg.langLabel} · {subCfg.duration / 60} min · {subCfg.questionCount} questions</Text>
                  </Box>
                  <Box style={{
                    width: rem(18), height: rem(18), borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${selected ? meta.iconColor : "#D1D5DB"}`,
                    backgroundColor: selected ? meta.iconColor : "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {selected && <Box style={{ width: rem(6), height: rem(6), borderRadius: "50%", backgroundColor: "white" }} />}
                  </Box>
                </UnstyledButton>
              );
            })}
          </Stack>
        </Box>

        {/* Language — only for bilingual subjects */}
        {isLangFixed ? (
          <Box p="sm" style={{ backgroundColor: SURFACE, borderRadius: rem(10) }}>
            <Group gap={8}>
              <Text size="sm" c="dimmed">Language:</Text>
              <Badge size="sm" radius="sm" style={{ backgroundColor: "#F5F3FF", color: VIOLET, fontWeight: 600 }}>
                Mandarin only
              </Badge>
              <Text size="xs" c="dimmed">— fixed for this subject</Text>
            </Group>
          </Box>
        ) : (
          <Box>
            <Text size="sm" fw={600} c={INK} mb={4}>Language</Text>
            <Text size="xs" c="dimmed" mb="sm">Cannot be changed once the exam begins.</Text>
            <SimpleGrid cols={2}>
              {(["en", "zh"] as const).map((l) => (
                <UnstyledButton
                  key={l}
                  onClick={() => onSetupLangChange(l)}
                  style={{
                    padding: `${rem(14)} ${rem(12)}`,
                    borderRadius: rem(12),
                    border: `2px solid ${setupLang === l ? PRIMARY : "#E2E8F0"}`,
                    backgroundColor: setupLang === l ? CREAM : "white",
                    textAlign: "center",
                    transition: "all 150ms ease",
                  }}
                >
                  <Text fw={700} size="lg" c={setupLang === l ? PRIMARY : INK}>{l === "en" ? "EN" : "中文"}</Text>
                  <Text size="xs" c="dimmed" mt={2}>{l === "en" ? "English" : "Mandarin"}</Text>
                </UnstyledButton>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* CTA */}
        <Box pt="xs" style={{ borderTop: "1px solid #F1F5F9" }}>
          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">
              {ALL_QUESTIONS.filter((q) => q.subject === setupSubject).length} questions (mock) · {cfg.duration / 60} min · {passMark}% to pass
            </Text>
            <Button
              radius="xl"
              style={{ backgroundColor: INK, color: "white", fontWeight: 600 }}
              onClick={onStart}
            >
              Generate &amp; Start
            </Button>
          </Group>
        </Box>
      </Stack>
    </Modal>
  );
}
