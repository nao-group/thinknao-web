"use client";

import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { CORRECT_GREEN, INK, WRONG_RED } from "@/constants/colors";

interface SubmitExamModalProps {
  opened: boolean;
  onClose: () => void;
  unanswered: number;
  totalQ: number;
  onConfirm: () => void;
}

// ─── Submit confirmation modal (exam phase) ────────────────────────────────────

export function SubmitExamModal({ opened, onClose, unanswered, totalQ, onConfirm }: SubmitExamModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Group gap={8}><IconAlertTriangle size={18} color="#F59E0B" /><Text fw={700} c={INK}>Submit Exam?</Text></Group>}
      centered radius="lg" size="sm"
    >
      <Stack gap="md">
        {unanswered > 0 ? (
          <Text size="sm" c="dimmed">
            You have <Text span fw={700} c={WRONG_RED}>{unanswered} unanswered question{unanswered > 1 ? "s" : ""}</Text>. Skipped questions will be marked incorrect.
          </Text>
        ) : (
          <Text size="sm" c="dimmed">You have answered all {totalQ} questions. Ready to submit?</Text>
        )}
        <Group grow>
          <Button variant="outline" color="dark" radius="xl" onClick={onClose}>Cancel</Button>
          <Button radius="xl" style={{ backgroundColor: CORRECT_GREEN, color: "white", fontWeight: 600 }} onClick={onConfirm}>Confirm Submit</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
