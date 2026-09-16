"use client";

import { useCallback, useState } from "react";
import { Box, Button, Group, Modal, Stack, Text, rem } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import { INK, MUTED, PRIMARY, CREAM } from "@/constants/colors";

interface WarnOptions {
  remaining: number;
  cap: number;
  unit: string; // e.g. "practice questions", "mock exam", "conversations"
}

function FreeTierWarningModal({
  opened, onClose, onContinue, remaining, cap, unit,
}: { opened: boolean; onClose: () => void; onContinue: () => void; remaining: number; cap: number; unit: string }) {
  return (
    <Modal opened={opened} onClose={onClose} centered radius="lg" size="sm" overlayProps={{ backgroundOpacity: 0.3, blur: 2 }}>
      <Stack gap="md" align="center" py="sm" px="xs">
        <Box style={{
          width: rem(48), height: rem(48), borderRadius: "50%",
          backgroundColor: CREAM, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <IconSparkles size={22} stroke={1.5} color={PRIMARY} />
        </Box>
        <Text fw={800} size="lg" c={INK} ta="center">Free Plan</Text>
        <Text size="sm" c={MUTED} ta="center" lh={1.6}>
          You're on the free plan — you have{" "}
          <Text span fw={700} c={PRIMARY}>{remaining} of {cap}</Text>{" "}
          {unit} left.
        </Text>
        <Group grow w="100%" mt="xs">
          <Button variant="outline" color="dark" radius="xl" onClick={onClose}>Cancel</Button>
          <Button radius="xl" style={{ backgroundColor: INK, color: "white", fontWeight: 600 }} onClick={onContinue}>
            Continue
          </Button>
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
