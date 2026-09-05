"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Loader, Stack, Text, rem } from "@mantine/core";
import { IconArrowRight, IconBrandWhatsapp, IconCircleCheck } from "@tabler/icons-react";
import { useAuthStore } from "@/store/auth";
import { INK, PRIMARY, MUTED, CREAM } from "@/constants/colors";

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
      style={{
        minHeight: "100vh",
        background: "#F3F5F7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: rem(24),
      }}
    >
      <Box
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#FFFDF8",
          borderRadius: rem(20),
          border: "1px solid rgba(15,23,42,0.07)",
          boxShadow: "0 10px 40px rgba(55,43,22,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Header bar */}
        <Box
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1e2d45 100%)",
            padding: `${rem(24)} ${rem(32)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text fw={700} size="lg" style={{ color: "#FFFAF0", letterSpacing: "-0.02em" }}>
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

        {/* Body */}
        <Stack gap={0} p={rem(32)}>
          {/* Success icon */}
          <Box style={{ textAlign: "center", marginBottom: rem(24) }}>
            <Box
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: CREAM,
                border: `2px solid rgba(212,160,23,0.25)`,
                marginBottom: rem(16),
              }}
            >
              <IconCircleCheck size={40} stroke={1.5} color={PRIMARY} />
            </Box>

            <Text
              size="xs"
              fw={600}
              style={{
                color: MUTED,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: rem(6),
              }}
            >
              Payment Confirmed
            </Text>
            <Text fw={800} size="xl" style={{ color: INK, letterSpacing: "-0.02em" }}>
              You&apos;re all set! 🎉
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
            style={{
              background: CREAM,
              border: "1.5px solid rgba(212,160,23,0.2)",
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
          <Button
            fullWidth
            size="md"
            rightSection={<IconArrowRight size={16} stroke={2.2} />}
            onClick={() => router.push(user ? "/dashboard" : "/login")}
            style={{
              background: "linear-gradient(145deg, #172033 0%, #0d1422 58%, #202b40 100%)",
              color: "#FFFAF0",
              borderRadius: rem(12),
              fontWeight: 700,
              height: rem(48),
              marginBottom: rem(12),
            }}
          >
            {user ? "Go to Dashboard" : "Log in to access"}
          </Button>

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
