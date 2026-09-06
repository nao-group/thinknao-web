"use client";

import Image from "next/image";
import { Box, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { IconArrowRight, IconCheck, IconChevronLeft } from "@tabler/icons-react";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { INK, MUTED, PRIMARY } from "@/constants/colors";

interface FinishPracticeModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  answered: number;
  total: number;
  loading: boolean;
}

export function FinishPracticeModal({
  opened,
  onClose,
  onConfirm,
  answered,
  total,
  loading,
}: FinishPracticeModalProps) {
  const unanswered = Math.max(0, total - answered);

  return (
    <Modal
      opened={opened}
      onClose={loading ? () => undefined : onClose}
      centered
      size={480}
      radius={24}
      padding={0}
      withCloseButton={!loading}
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      aria-labelledby="finish-practice-title"
      classNames={{
        content: "finish-practice-modal",
        header: "finish-practice-modal__header",
        close: "finish-practice-modal__close",
        body: "finish-practice-modal__body",
      }}
    >
      <Box className="finish-practice-modal__visual">
        <Image
          src="/images/practice/finish-confirmation-transparent.png"
          alt="Student carefully reviewing a final answer checklist"
          width={1536}
          height={1024}
          className="finish-practice-modal__illustration"
        />
      </Box>

      <Stack className="finish-practice-modal__content" gap={0} align="center">
        <Box className="finish-practice-modal__eyebrow">
          <IconCheck size={14} stroke={2.4} />
          Final check
        </Box>
        <Text id="finish-practice-title" className="checkout-heading" fz={26} fw={800} ta="center" c={INK}>
          Ready to finish this practice?
        </Text>
        <Text mt={10} size="sm" ta="center" c={MUTED} lh={1.65} maw={390}>
          Take one last look at your answers. Once you finish, your practice will be submitted and you won&apos;t be able to change them.
        </Text>

        <Box className={unanswered > 0 ? "finish-practice-modal__status is-warning" : "finish-practice-modal__status"}>
          <Text size="sm" fw={750} c={unanswered > 0 ? "#9a4f3e" : INK}>
            {answered} of {total} answers submitted
          </Text>
          <Text size="xs" c={MUTED}>
            {unanswered > 0
              ? `${unanswered} unanswered ${unanswered === 1 ? "question" : "questions"} will be left incomplete.`
              : "Everything is answered. You’re ready to see your results."}
          </Text>
        </Box>

        <Group grow w="100%" mt={22} gap={12} className="finish-practice-modal__actions">
          <Button
            variant="outline"
            radius="xl"
            leftSection={<IconChevronLeft size={16} />}
            onClick={onClose}
            disabled={loading}
            styles={{ root: { minHeight: 48, borderColor: "rgba(15,23,42,.16)", color: INK, fontWeight: 700 } }}
          >
            Review answers
          </Button>
          <LandingActionButton
            presentation="compact"
            radius="xl"
            rightSection={<IconArrowRight size={16} />}
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
            loaderProps={{ type: "dots", color: PRIMARY }}
          >
            Yes, finish practice
          </LandingActionButton>
        </Group>
      </Stack>
    </Modal>
  );
}
