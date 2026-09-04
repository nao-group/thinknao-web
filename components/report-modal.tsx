"use client";

import { useState } from "react";
import { Box, Button, Group, Modal, Stack, Text, Textarea, UnstyledButton, rem } from "@mantine/core";
import { IconAlertCircle, IconCircleCheck } from "@tabler/icons-react";
import { INK, PANDA, CORRECT_GREEN } from "@/constants/colors";
import { submitReport } from "@/lib/reports";

const REPORT_REASONS = [
  "Incorrect answer key",
  "Unclear or ambiguous question",
  "Formula or equation error",
  "Typo or language error",
  "Other",
] as const;

export function ReportModal({
  opened,
  onClose,
  questionId,
  sessionId,
}: {
  opened: boolean;
  onClose: () => void;
  /** The question being reported. Optional — some surfaces have no single
   *  question in view, and a report without one is still worth recording. */
  questionId?: string;
  /** Where it was reported from, kept for reproducing the context. */
  sessionId?: string;
}) {
  const [reason, setReason] = useState<string | null>(null);
  const [otherText, setOtherText] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    onClose();
    setTimeout(() => {
      setReason(null);
      setOtherText("");
      setDone(false);
      setSubmitting(false);
      setError(null);
    }, 200);
  }

  const canSubmit =
    reason !== null && (reason !== "Other" || otherText.trim().length > 0) && !submitting;

  async function submit() {
    if (!reason) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitReport({
        reason,
        details: otherText.trim() || undefined,
        question_id: questionId,
        session_id: sessionId,
      });
      setDone(true);
      setTimeout(handleClose, 1600);
    } catch (err) {
      console.error("Report submit failed:", err);
      // Don't fake a thank-you on failure — the report wasn't recorded, and
      // silently dropping it is how a broken report button goes unnoticed.
      setError("Couldn't send that report. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap={8} align="center">
          <IconAlertCircle size={18} color={PANDA} stroke={2} />
          <Text fw={700} size="md" c={INK}>Report a Problem</Text>
        </Group>
      }
      radius="md"
      size="sm"
      overlayProps={{ backgroundOpacity: 0.3, blur: 2 }}
    >
      {done ? (
        <Box py="xl" style={{ textAlign: "center" }}>
          <IconCircleCheck size={44} color={CORRECT_GREEN} style={{ display: "block", margin: "0 auto" }} />
          <Text fw={700} size="md" c={INK} mt="md">Thanks for the report!</Text>
          <Text size="sm" c="dimmed" mt={4}>We'll review this question shortly.</Text>
        </Box>
      ) : (
        <>
          <Text size="sm" c="dimmed" mb="md">What's wrong with this question?</Text>

          <Stack gap="sm" mb={reason === "Other" ? "sm" : "xl"}>
            {REPORT_REASONS.map((r) => {
              const active = reason === r;
              return (
                <UnstyledButton
                  key={r}
                  onClick={() => setReason(r)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: rem(10),
                    padding: `${rem(10)} ${rem(12)}`,
                    borderRadius: rem(10),
                    border: `1.5px solid ${active ? PANDA : "#E2E8F0"}`,
                    backgroundColor: active ? "#FDF0EC" : "white",
                    transition: "all 150ms ease",
                  }}
                >
                  <Box
                    style={{
                      width: rem(16),
                      height: rem(16),
                      borderRadius: "50%",
                      border: `2px solid ${active ? PANDA : "#CBD5E1"}`,
                      backgroundColor: active ? PANDA : "white",
                      flexShrink: 0,
                      transition: "all 150ms ease",
                    }}
                  />
                  <Text size="sm" fw={active ? 600 : 400} c={INK}>{r}</Text>
                </UnstyledButton>
              );
            })}
          </Stack>

          {reason === "Other" && (
            <Textarea
              autoFocus
              placeholder="Please describe the issue..."
              value={otherText}
              onChange={(e) => setOtherText(e.currentTarget.value)}
              minRows={3}
              mb="xl"
              styles={{
                input: { borderRadius: rem(10), fontSize: rem(14) },
              }}
            />
          )}

          {error && (
            <Group gap={6} p="sm" mb="md" style={{ backgroundColor: "#FEF2F2", borderRadius: rem(8), border: "1px solid #FECACA" }}>
              <IconAlertCircle size={15} color="#EF4444" />
              <Text size="sm" c="#EF4444">{error}</Text>
            </Group>
          )}

          <Group justify="space-between">
            <Button variant="outline" color="dark" radius="md" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              radius="md"
              disabled={!canSubmit}
              loading={submitting}
              loaderProps={{ type: "dots", color: "white" }}
              onClick={submit}
              style={{
                backgroundColor: canSubmit ? PANDA : "#94A3B8",
                color: "white",
                fontWeight: 600,
                opacity: 1,
              }}
            >
              Submit Report
            </Button>
          </Group>
        </>
      )}
    </Modal>
  );
}
