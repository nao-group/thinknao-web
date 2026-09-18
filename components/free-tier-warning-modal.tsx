"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Box, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { IconArrowRight, IconSparkles } from "@tabler/icons-react";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { INK, MUTED } from "@/constants/colors";

interface WarnOptions {
  remaining: number;
  cap: number;
  unit: string; // e.g. "practice questions", "mock exam", "conversations"
}

function FreeTierWarningModal({
  opened, onClose, onContinue, remaining, cap, unit,
}: { opened: boolean; onClose: () => void; onContinue: () => void; remaining: number; cap: number; unit: string }) {
  const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL ?? "";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size={480}
      radius={24}
      padding={0}
      overlayProps={{ backgroundOpacity: 0.45, blur: 4 }}
      aria-labelledby="free-tier-warning-title"
      classNames={{
        content: "free-tier-warning-modal",
        header: "free-tier-warning-modal__header",
        close: "free-tier-warning-modal__close",
        body: "free-tier-warning-modal__body",
      }}
    >
      <Box className="free-tier-warning-modal__visual">
        <Image
          src="/images/subscription/free-plan-journey-transparent.png"
          alt="An open study book and golden path toward a Chinese moon gate"
          width={1854}
          height={848}
          className="free-tier-warning-modal__illustration"
        />
      </Box>
      <Stack className="free-tier-warning-modal__content" gap={0} align="center">
        <Box className="free-tier-warning-modal__eyebrow">
          <IconSparkles size={13} stroke={2.2} aria-hidden="true" />
          Free plan
        </Box>
        <Text id="free-tier-warning-title" className="checkout-heading" fz={26} fw={800} ta="center" c={INK}>
          Make the most of your free access
        </Text>
        <Text mt={10} size="sm" ta="center" c={MUTED} lh={1.65} maw={390}>
          Keep exploring with your free access, or choose a plan for unlimited practice and mock exams.
        </Text>
        <Box className="free-tier-warning-modal__quota">
          <Text className="free-tier-warning-modal__count" c={INK}><strong>{remaining}</strong><span> / {cap}</span></Text>
          <Text size="sm" fw={650} c={INK}>{unit} left</Text>
        </Box>
        <Text mt={11} size="xs" ta="center" c={MUTED}>Continuing for free will count toward your allowance.</Text>
        <Group grow w="100%" mt={22} gap={12} className="free-tier-warning-modal__actions">
          <Button variant="outline" color="dark" radius="xl" onClick={onContinue} className="free-tier-warning-modal__secondary">Continue for free</Button>
          <LandingActionButton
            presentation="compact"
            radius="xl"
            rightSection={<IconArrowRight size={16} aria-hidden="true" />}
            onClick={() => window.location.assign(`${landingUrl}/#pricing`)}
          >
            View plans
          </LandingActionButton>
        </Group>
      </Stack>
    </Modal>
  );
}

/**
 * Pairs with useSubscriptionAccessGuard's upgrade modal: warn while a
 * free-tier student still has quota left, then the caller switches to
 * showUpgradeModal() once they've hit 0. Same "warn → confirm → proceed"
 * shape across practice generation, mock exam start, and new chats.
 */
export function useFreeTierWarning() {
  const [opened, setOpened] = useState(false);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const [opts, setOpts] = useState<WarnOptions>({ remaining: 0, cap: 0, unit: "" });

  const warnBeforeAction = useCallback((action: () => void, o: WarnOptions) => {
    setOpts(o);
    setPending(() => action);
    setOpened(true);
  }, []);

  function handleContinue() {
    setOpened(false);
    pending?.();
  }

  return {
    warnBeforeAction,
    modal: (
      <FreeTierWarningModal
        opened={opened}
        onClose={() => setOpened(false)}
        onContinue={handleContinue}
        remaining={opts.remaining}
        cap={opts.cap}
        unit={opts.unit}
      />
    ),
  };
}
