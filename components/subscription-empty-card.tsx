"use client";

import Image from "next/image";
import { Box, Stack, Text } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { LandingActionButton } from "@/components/ui/landing-action-button";

export function SubscriptionEmptyCard() {
  const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL ?? "";

  return (
    <Box className="subscription-empty-card">
      <Text className="subscription-empty-card__title" fw={700} size="sm">
        Subscription
      </Text>

      <Box className="subscription-empty-card__visual">
        <Image
          src="/images/subscription/empty-plan-transparent.png"
          alt="Student discovering a new learning path"
          width={1536}
          height={1024}
          className="subscription-empty-card__illustration"
        />
      </Box>

      <Stack gap={4} align="center" className="subscription-empty-card__copy">
        <Text fw={750} size="sm" c="white" ta="center">
          Your learning path is ready
        </Text>
        <Text size="xs" c="rgba(255,255,255,.58)" ta="center" lh={1.5}>
          Choose a plan to unlock every ThinkNAO learning tool.
        </Text>
      </Stack>

      <LandingActionButton
        onClick={() => window.location.assign(`${landingUrl}/#pricing`)}
        presentation="compact"
        fullWidth
        size="sm"
        rightSection={<IconArrowRight size={15} stroke={2.2} />}
        className="subscription-empty-card__action"
      >
        Explore plans
      </LandingActionButton>
    </Box>
  );
}
