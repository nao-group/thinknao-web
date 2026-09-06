"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Box, Button, Stack, Text, rem } from "@mantine/core";
import { IconArrowRight, IconBrandWhatsapp, IconRefresh } from "@tabler/icons-react";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { INK, MUTED } from "@/constants/colors";

export default function PaymentFailedPage() {
  const router = useRouter();

  return (
    <Box className="payment-success-page payment-failed-page">
      <Box className="payment-success-card payment-failed-card" style={{ width: "100%", maxWidth: 540 }}>
        <Box className="payment-success-header" style={{ padding: `${rem(24)} ${rem(32)}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Text className="checkout-heading" fw={700} size="lg" style={{ color: "#FFFAF0" }}>ThinkNao</Text>
          <Text size="xs" style={{ color: "rgba(255,250,240,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Payment Status</Text>
        </Box>

        <Box className="payment-success-visual payment-failed-visual">
          <Image src="/images/payment/failed-retry-transparent.png" alt="Student finding another path after a temporary payment issue" width={1536} height={1024} priority className="payment-success-illustration payment-failed-illustration" />
        </Box>

        <Stack className="payment-success-body" gap={0} p={rem(32)}>
          <Box style={{ textAlign: "center", marginBottom: rem(24) }}>
            <Box className="payment-success-badge payment-failed-badge">
              <IconRefresh size={15} stroke={2.2} />
              Payment needs another try
            </Box>
            <Text className="checkout-heading" fw={800} fz={27} style={{ color: INK }}>Let&apos;s get you back on track</Text>
          </Box>

          <Text size="sm" ta="center" style={{ color: MUTED, lineHeight: 1.7, marginBottom: rem(28) }}>
            We couldn&apos;t complete your payment, but your learning journey is still waiting. No charges were made, so you can safely try again.
          </Text>

          <Box className="payment-success-info payment-failed-info" style={{ borderRadius: rem(12), padding: rem(16), marginBottom: rem(28), textAlign: "center" }}>
            <Text size="xs" fw={700} style={{ color: "#9a4f3e", marginBottom: rem(4) }}>Your selected plan is still available</Text>
            <Text size="xs" style={{ color: MUTED }}>Check your payment details or choose another method on the checkout page.</Text>
          </Box>

          <LandingActionButton presentation="auth" fullWidth size="md" rightSection={<IconArrowRight size={16} stroke={2.2} />} onClick={() => router.push("/checkout")} style={{ marginBottom: rem(12) }}>
            Try payment again
          </LandingActionButton>

          <Button component="a" href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6285284229998"}?text=${encodeURIComponent("Hi ThinkNao! My payment failed and I need help completing my subscription.")}`} target="_blank" rel="noopener noreferrer" variant="outline" fullWidth size="sm" leftSection={<IconBrandWhatsapp size={16} />} styles={{ root: { borderColor: "rgba(15,23,42,0.16)", color: INK, borderRadius: rem(10), fontWeight: 500 } }}>
            Need help? Chat with us
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
