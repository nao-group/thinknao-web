"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Stack, Text, rem } from "@mantine/core";
import { IconArrowRight, IconBrandWhatsapp, IconCircleX } from "@tabler/icons-react";
import { INK, PRIMARY, MUTED } from "@/constants/colors";

export default function PaymentFailedPage() {
  const router = useRouter();

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
            Payment Status
          </Text>
        </Box>

        {/* Body */}
        <Stack gap={0} p={rem(32)}>
          {/* Failed icon */}
          <Box style={{ textAlign: "center", marginBottom: rem(24) }}>
            <Box
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#FEF2F2",
                border: "2px solid rgba(239,68,68,0.2)",
                marginBottom: rem(16),
              }}
            >
              <IconCircleX size={40} stroke={1.5} color="#EF4444" />
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
              Payment Unsuccessful
            </Text>
            <Text fw={800} size="xl" style={{ color: INK, letterSpacing: "-0.02em" }}>
              Something went wrong
            </Text>
          </Box>

          {/* Message */}
          <Text
            size="sm"
            ta="center"
            style={{ color: MUTED, lineHeight: 1.7, marginBottom: rem(28) }}
          >
            Your payment could not be processed. No charges were made.
            You can try again or reach out to us if you need help.
          </Text>

          {/* CTA */}
          <Button
            fullWidth
            size="md"
            rightSection={<IconArrowRight size={16} stroke={2.2} />}
            onClick={() => router.push("/checkout")}
            style={{
              background: "linear-gradient(145deg, #172033 0%, #0d1422 58%, #202b40 100%)",
              color: "#FFFAF0",
              borderRadius: rem(12),
              fontWeight: 700,
              height: rem(48),
              marginBottom: rem(12),
            }}
          >
            Try again
          </Button>

          <Button
            component="a"
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6285284229998"}?text=${encodeURIComponent("Hi ThinkNao! My payment failed and I need help completing my subscription.")}`}
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
            Contact support via WhatsApp
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
