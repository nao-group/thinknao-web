"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Box, Button, Stack, Text, rem } from "@mantine/core";
import { IconArrowRight, IconBrandWhatsapp, IconCircleCheck } from "@tabler/icons-react";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { useAuthStore } from "@/store/auth";
import { INK, PRIMARY, MUTED } from "@/constants/colors";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [countdown, setCountdown] = useState(5);

  // Auto-redirect after 5 seconds
  useEffect(() => {
    if (countdown <= 0) {
      router.push(user ? "/dashboard" : "/login");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, router, user]);

  return (
    <Box
      className="payment-success-page"
    >
      <Box
        className="payment-success-card"
        style={{
          width: "100%",
          maxWidth: 540,
        }}
      >
        {/* Header bar */}
        <Box
          className="payment-success-header"
          style={{
            padding: `${rem(24)} ${rem(32)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text className="checkout-heading" fw={700} size="lg" style={{ color: "#FFFAF0" }}>
            ThinkNao
          </Text>
          <Text
            size="xs"
            style={{
              color: "rgba(255,250,240,0.5)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Payment Receipt
          </Text>
        </Box>

        <Box className="payment-success-visual">
          <Image
            src="/images/payment/success-journey-transparent.png"
            alt="Student celebrating an activated learning subscription at the Great Wall"
            width={768}
            height={512}
            priority
            className="payment-success-illustration"
          />
        </Box>

        {/* Body */}
        <Stack className="payment-success-body" gap={0} p={rem(32)}>
          {/* Success icon */}
          <Box style={{ textAlign: "center", marginBottom: rem(24) }}>
            <Box className="payment-success-badge">
              <IconCircleCheck size={15} stroke={2.2} />
              Payment Confirmed
            </Box>

            <Text className="checkout-heading" fw={800} fz={27} style={{ color: INK }}>
              You&apos;re all set!
            </Text>
          </Box>

          {/* Message */}
          <Text
            size="sm"
            ta="center"
            style={{ color: MUTED, lineHeight: 1.7, marginBottom: rem(28) }}
          >
            Your payment was successful and your ThinkNao subscription is now active.
            An invoice has been sent to your email.
          </Text>

          {/* Info card */}
          <Box
            className="payment-success-info"
            style={{
              borderRadius: rem(12),
              padding: rem(16),
              marginBottom: rem(28),
              textAlign: "center",
            }}
          >
            <Text size="xs" style={{ color: MUTED, marginBottom: rem(4) }}>
              Your access is now active. Start learning right away from your dashboard.
            </Text>
            <Text size="xs" fw={600} style={{ color: PRIMARY }}>
              Redirecting in {countdown}s...
            </Text>
          </Box>

          {/* CTA */}
          <LandingActionButton
            presentation="auth"
            fullWidth
            size="md"
            rightSection={<IconArrowRight size={16} stroke={2.2} />}
            onClick={() => router.push(user ? "/dashboard" : "/login")}
            style={{ marginBottom: rem(12) }}
          >
            {user ? "Go to Dashboard" : "Log in to access"}
          </LandingActionButton>

          <Button
            component="a"
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6285284229998"}?text=${encodeURIComponent("Hi ThinkNao! I just completed my payment and need help getting started.")}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            fullWidth
            size="sm"
            leftSection={<IconBrandWhatsapp size={16} />}
            styles={{
              root: {
                borderColor: "rgba(15,23,42,0.16)",
                color: INK,
                borderRadius: rem(10),
                fontWeight: 500,
              },
            }}
          >
            Need help? Chat with us
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
