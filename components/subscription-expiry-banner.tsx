"use client";

import { useEffect, useState } from "react";
import { ActionIcon, Box, Group, Stack, Text } from "@mantine/core";
import { IconArrowRight, IconClockHour4, IconX } from "@tabler/icons-react";
import { LandingActionButton } from "@/components/ui/landing-action-button";

function getRemaining(expiresAt: string) {
  const milliseconds = Math.max(0, new Date(expiresAt).getTime() - Date.now());
  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { milliseconds, days, hours, minutes, seconds };
}

export function SubscriptionExpiryBanner({
  expiresAt,
  onDismiss,
}: {
  expiresAt: string;
  onDismiss: () => void;
}) {
  const [remaining, setRemaining] = useState(() => getRemaining(expiresAt));
  const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL ?? "";

  useEffect(() => {
    const update = () => setRemaining(getRemaining(expiresAt));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [expiresAt]);

  if (remaining.milliseconds <= 0) return null;

  const units = [
    [remaining.days, "days"],
    [remaining.hours, "hrs"],
    [remaining.minutes, "min"],
    [remaining.seconds, "sec"],
  ] as const;

  return (
    <Box className="subscription-expiry-banner" role="status" aria-label="Subscription expiry reminder">
      <Group className="subscription-expiry-banner__inner" wrap="nowrap" gap="md">
        <Box className="subscription-expiry-banner__icon" aria-hidden="true">
          <IconClockHour4 size={22} stroke={1.8} />
        </Box>

        <Stack className="subscription-expiry-banner__message" gap={2}>
          <Text className="subscription-expiry-banner__title">
            Keep your learning momentum going
          </Text>
          <Text className="subscription-expiry-banner__description">
            Your ThinkNAO access ends soon. Renew now to keep your practice history and study streak moving.
          </Text>
        </Stack>

        <Group className="subscription-expiry-banner__countdown" gap={6} wrap="nowrap" aria-label={`${remaining.days} days ${remaining.hours} hours ${remaining.minutes} minutes remaining`}>
          {units.map(([value, label]) => (
            <Box className="subscription-expiry-banner__time" key={label}>
              <Text component="span">{String(value).padStart(2, "0")}</Text>
              <small>{label}</small>
            </Box>
          ))}
        </Group>

        <LandingActionButton
          presentation="compact"
          className="subscription-expiry-banner__cta"
          rightSection={<IconArrowRight size={15} stroke={2.2} />}
          onClick={() => window.location.assign(`${landingUrl}/#pricing`)}
        >
          Renew access
        </LandingActionButton>

        <ActionIcon className="subscription-expiry-banner__close" variant="subtle" onClick={onDismiss} aria-label="Dismiss subscription reminder">
          <IconX size={20} stroke={1.8} />
        </ActionIcon>
      </Group>
    </Box>
  );
}
