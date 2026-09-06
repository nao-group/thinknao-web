"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Box, Button, Group, Modal, Stack, Text } from "@mantine/core";
import { IconArrowRight, IconChevronLeft, IconLock } from "@tabler/icons-react";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { fetchSubscription, type Subscription } from "@/lib/payments";
import { INK, MUTED } from "@/constants/colors";

function hasAccess(subscription: Subscription | null) {
  return Boolean(
    subscription?.status === "active" &&
    new Date(subscription.expires_at).getTime() > Date.now()
  );
}

function SubscriptionRequiredModal({ opened, intent, onClose }: { opened: boolean; intent: string; onClose: () => void }) {
  const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL ?? "";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size={480}
      radius={24}
      padding={0}
      classNames={{
        content: "subscription-guard-modal",
        header: "subscription-guard-modal__header",
        close: "subscription-guard-modal__close",
        body: "subscription-guard-modal__body",
      }}
      aria-labelledby="subscription-guard-title"
    >
      <Box className="subscription-guard-modal__visual">
        <Image
          src="/images/subscription/access-required-transparent.png"
          alt="Student ready to unlock a new learning path"
          width={1698}
          height={926}
          className="subscription-guard-modal__illustration"
        />
      </Box>

      <Stack className="subscription-guard-modal__content" gap={0} align="center">
        <Box className="subscription-guard-modal__eyebrow">
          <IconLock size={13} stroke={2.2} />
          Subscription required
        </Box>
        <Text id="subscription-guard-title" className="checkout-heading" fz={26} fw={800} ta="center" c={INK}>
          Unlock your next learning step
        </Text>
        <Text mt={10} size="sm" ta="center" c={MUTED} lh={1.65} maw={390}>
          You need an active ThinkNAO subscription to {intent}. Choose a plan to keep your progress moving forward.
        </Text>

        <Group grow w="100%" mt={24} gap={12} className="subscription-guard-modal__actions">
          <Button variant="outline" radius="xl" leftSection={<IconChevronLeft size={16} />} onClick={onClose} styles={{ root: { minHeight: 48, borderColor: "rgba(15,23,42,.16)", color: INK, fontWeight: 700 } }}>
            Maybe later
          </Button>
          <LandingActionButton presentation="compact" radius="xl" rightSection={<IconArrowRight size={16} />} onClick={() => window.location.assign(`${landingUrl}/#pricing`)}>
            View plans
          </LandingActionButton>
        </Group>
      </Stack>
    </Modal>
  );
}

export function useSubscriptionAccessGuard() {
  const [subscription, setSubscription] = useState<Subscription | null | undefined>(undefined);
  const [opened, setOpened] = useState(false);
  const [intent, setIntent] = useState("continue");

  useEffect(() => {
    let active = true;
    fetchSubscription()
      .then((result) => { if (active) setSubscription(result); })
      .catch(() => { if (active) setSubscription(null); });
    return () => { active = false; };
  }, []);

  const requireSubscription = useCallback(async (action: () => void, actionIntent: string) => {
    let current = subscription;
    if (current === undefined) {
      try {
        current = await fetchSubscription();
        setSubscription(current);
      } catch {
        current = null;
        setSubscription(null);
      }
    }

    if (hasAccess(current)) {
      action();
      return true;
    }

    setIntent(actionIntent);
    setOpened(true);
    return false;
  }, [subscription]);

  return {
    requireSubscription,
    modal: <SubscriptionRequiredModal opened={opened} intent={intent} onClose={() => setOpened(false)} />,
  };
}
