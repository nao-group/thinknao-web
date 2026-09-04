"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Anchor,
  Box,
  Button,
  Divider,
  Group,
  Loader,
  Modal,
  Skeleton,
  Stack,
  Text,
  TextInput,
  rem,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBrandWhatsapp,
  IconCheck,
  IconTag,
  IconX,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { useAuthStore } from "@/store/auth";
import { INK, PRIMARY, MUTED, CREAM } from "@/constants/colors";
import { fetchPlans, validateReferral, createPayment, type Plan } from "./api";

const FEATURES = [
  "Unlimited practice questions",
  "All 5 CSCA subjects",
  "AI question generation",
  "Bilingual — English & Chinese",
  "Adaptive mastery tracking",
  "Full-length mock exams",
  "Flashcards",
  "AI Study Assistant",
  "Community & Leaderboard",
  "Priority support",
];

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getAccessUntil(durationMonths: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + durationMonths);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Skeletons ──────────────────────────────────────────────────────────────────

function SummaryCardSkeleton() {
  return (
    <Box className="warm-surface" style={{ padding: rem(24) }}>
      <Skeleton height={16} width="70%" mb={rem(16)} radius="sm" />
      <Box
        style={{
          border: "1.5px solid rgba(15,23,42,0.08)",
          borderRadius: rem(12),
          padding: rem(16),
          background: "white",
          marginBottom: rem(14),
        }}
      >
        <Skeleton height={14} width="60%" mb={rem(8)} radius="sm" />
        <Skeleton height={11} width="80%" mb={rem(12)} radius="sm" />
        <Skeleton height={26} width="50%" radius="sm" />
      </Box>
      <Skeleton height={44} radius="md" mb={rem(14)} />
      <Skeleton height={36} width="70%" mx="auto" mb={rem(8)} radius="sm" />
      <Skeleton height={14} width="40%" mx="auto" mb={rem(10)} radius="sm" />
      <Skeleton height={36} radius="md" />
    </Box>
  );
}

// ── Main content ───────────────────────────────────────────────────────────────

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const planId = searchParams.get("plan") ?? "biannual";
  const currentUrl = `/checkout?plan=${planId}`;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState(false);

  const [referralInput, setReferralInput] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [referralError, setReferralError] = useState("");
  const [referralLoading, setReferralLoading] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Derive the product slug from the plan ID prefix (e.g. 'THINK-...' → 'thinknao').
  // Falls back to fetching all plans if the prefix is unrecognised.
  const productSlug = planId.startsWith("THINK-") ? "thinknao" : undefined;

  useEffect(() => {
    fetchPlans(productSlug)
      .then(setPlans)
      .catch(() => setPlansError(true))
      .finally(() => setPlansLoading(false));
  }, [productSlug]);

  const plan = plans.find((p) => p.id === planId) ?? plans[0] ?? null;
  const total = plan ? plan.total_price_idr - referralDiscount : 0;
  const accessUntil = plan ? getAccessUntil(plan.duration_months) : "";

  async function handleApplyReferral() {
    const code = referralInput.trim();
    if (!code) return;
    setReferralLoading(true);
    setReferralError("");
    try {
      const result = await validateReferral(code);
      if (result.valid) {
        setReferralCode(code.toUpperCase());
        setReferralDiscount(result.discount_amount);
        setShowReferralInput(false);
      } else {
        setReferralError(result.message ?? "Invalid referral code.");
      }
    } catch {
      setReferralError("Failed to validate code. Please try again.");
    } finally {
      setReferralLoading(false);
    }
  }

  function handleRemoveReferral() {
    setReferralCode("");
    setReferralInput("");
    setReferralDiscount(0);
    setReferralError("");
    setShowReferralInput(false);
  }

  async function handlePay() {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!plan) return;
    setPaymentLoading(true);
    try {
      const { payment_url } = await createPayment(plan.id, referralCode || undefined);
      window.location.href = payment_url;
    } catch {
      notifications.show({
        title: "Payment failed",
        message: "Something went wrong. Please try again.",
        color: "red",
        autoClose: 4000,
      });
    } finally {
      setPaymentLoading(false);
    }
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (plansError) {
    return (
      <Box style={{ minHeight: "100vh", background: "#F3F5F7", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Stack align="center" gap={rem(12)}>
          <Text fw={600} style={{ color: INK }}>Failed to load plan data.</Text>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setPlansError(false); setPlansLoading(true); fetchPlans().then(setPlans).catch(() => setPlansError(true)).finally(() => setPlansLoading(false)); }}
            style={{ borderColor: INK, color: INK }}
          >
            Try again
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box style={{ minHeight: "100vh", background: "#F3F5F7" }}>

      {/* Sticky page header */}
      <Box
        style={{
          background: "white",
          borderBottom: "1px solid rgba(15, 23, 42, 0.07)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Box
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: `${rem(14)} ${rem(24)}`,
            display: "flex",
            alignItems: "center",
            gap: rem(12),
          }}
        >
          <Button
            variant="subtle"
            size="sm"
            leftSection={<IconArrowLeft size={15} stroke={2} />}
            onClick={() => router.back()}
            style={{ color: MUTED, paddingLeft: rem(4) }}
          >
            Back
          </Button>
          <Text fw={700} size="lg" style={{ color: INK }}>
            Draft Invoice
          </Text>
          {plan?.savings_badge && (
            <Box
              style={{
                background: "linear-gradient(145deg, #202b40 0%, #0d1422 72%)",
                color: "#FFFAF0",
                fontSize: rem(11),
                fontWeight: 700,
                padding: `${rem(3)} ${rem(10)}`,
                borderRadius: 999,
                letterSpacing: "0.03em",
              }}
            >
              {plan.savings_badge}
            </Box>
          )}
        </Box>
      </Box>

      {/* Two-column body */}
      <Box
        className="checkout-layout"
        style={{ maxWidth: 1100, margin: "0 auto", padding: `${rem(40)} ${rem(24)}` }}
      >

        {/* ── Left: order details ── */}
        <Stack gap={rem(32)}>

          {/* Detail pemesanan */}
          <Box>
            <Text fw={700} size="xl" style={{ color: INK, marginBottom: rem(6) }}>
              Order Details
            </Text>
            <Text size="sm" style={{ color: MUTED, lineHeight: 1.6, marginBottom: rem(20) }}>
              Please review and confirm your selected plan.
              Once payment is made, we are unable to issue refunds for any reason.
            </Text>

            {/* Plan card — dark */}
            {plansLoading || !plan ? (
              <Skeleton height={80} radius={rem(16)} />
            ) : (
              <Box
                style={{
                  background: "linear-gradient(135deg, #0F172A 0%, #1e2d45 100%)",
                  borderRadius: rem(16),
                  padding: `${rem(20)} ${rem(24)}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: rem(16),
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Text
                    size="xs"
                    style={{ color: "rgba(255,250,240,0.55)", marginBottom: rem(4), letterSpacing: "0.04em" }}
                  >
                    STUDY PLAN
                  </Text>
                  <Text fw={600} size="md" style={{ color: "#FFFAF0" }}>
                    {plan.name}
                  </Text>
                </Box>
                <Box style={{ textAlign: "right" }}>
                  <Text
                    size="xs"
                    style={{ color: "rgba(255,250,240,0.55)", marginBottom: rem(4), letterSpacing: "0.04em" }}
                  >
                    ACCESS UNTIL
                  </Text>
                  <Text fw={600} size="sm" style={{ color: "#FFFAF0" }}>
                    {accessUntil}
                  </Text>
                </Box>
              </Box>
            )}
          </Box>

          {/* Yang akan kamu dapatkan */}
          <Box>
            <Text fw={700} size="lg" style={{ color: INK, marginBottom: rem(16) }}>
              What you'll get
            </Text>
            <Stack gap={rem(11)}>
              {FEATURES.map((feature) => (
                <Group key={feature} gap={rem(12)} wrap="nowrap">
                  <Box
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: CREAM,
                      border: `1.5px solid rgba(212, 160, 23, 0.3)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconCheck size={12} stroke={2.5} color={PRIMARY} />
                  </Box>
                  <Text size="sm" style={{ color: INK, lineHeight: 1.5 }}>
                    {feature}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Box>

        </Stack>

        {/* ── Right: order summary (sticky) ── */}
        <Box className="checkout-sidebar">
          {plansLoading || !plan ? (
            <SummaryCardSkeleton />
          ) : (
            <Box className="warm-surface" style={{ padding: rem(24) }}>

              {/* Heading */}
              <Text
                fw={700}
                size="sm"
                style={{ color: PRIMARY, marginBottom: rem(16), lineHeight: 1.5, letterSpacing: "-0.01em" }}
              >
                One step away from unlocking ThinkNao!
              </Text>

              {/* Plan preview */}
              <Box
                style={{
                  border: "1.5px solid rgba(15, 23, 42, 0.08)",
                  borderRadius: rem(12),
                  padding: `${rem(16)} ${rem(16)}`,
                  background: "white",
                  marginBottom: rem(14),
                }}
              >
                <Text fw={700} size="sm" style={{ color: INK, marginBottom: rem(2) }}>
                  {plan.name}
                </Text>
                <Text size="xs" style={{ color: MUTED, marginBottom: rem(10) }}>
                  Full access for {plan.name_short} ({plan.duration_months * 30} days)
                </Text>
                <Group gap={rem(4)} align="baseline">
                  <Text fw={800} size="xl" style={{ color: INK }}>
                    {formatIDR(plan.price_per_month_idr)}
                  </Text>
                  <Text size="sm" style={{ color: MUTED }}>/month</Text>
                </Group>
                {plan.billing_note && (
                  <Text size="xs" style={{ color: MUTED, marginTop: rem(2) }}>
                    {plan.billing_note}
                  </Text>
                )}
              </Box>

              {/* Referral code section */}
              <Box
                style={{
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  borderRadius: rem(12),
                  marginBottom: rem(16),
                  overflow: "hidden",
                }}
              >
                {referralCode ? (
                  <Group
                    p={rem(13)}
                    justify="space-between"
                    style={{ background: "#F0FDF4", borderBottom: "1px solid #BBF7D0" }}
                  >
                    <Group gap={rem(8)}>
                      <IconTag size={15} color="#16A34A" stroke={2} />
                      <Text size="sm" fw={600} style={{ color: "#16A34A" }}>
                        {referralCode}
                      </Text>
                      <Text size="xs" style={{ color: "#16A34A" }}>
                        − {formatIDR(referralDiscount)}
                      </Text>
                    </Group>
                    <Button
                      variant="subtle"
                      size="compact-xs"
                      onClick={handleRemoveReferral}
                      style={{ color: MUTED, minWidth: "auto", padding: rem(2) }}
                    >
                      <IconX size={14} />
                    </Button>
                  </Group>
                ) : (
                  <Button
                    variant="subtle"
                    fullWidth
                    justify="space-between"
                    leftSection={<IconTag size={15} stroke={1.5} />}
                    rightSection={
                      <IconArrowRight
                        size={13}
                        stroke={2}
                        style={{
                          transform: showReferralInput ? "rotate(90deg)" : "none",
                          transition: "transform 200ms ease",
                        }}
                      />
                    }
                    onClick={() => setShowReferralInput(!showReferralInput)}
                    style={{
                      color: INK,
                      padding: `${rem(13)} ${rem(14)}`,
                      height: "auto",
                      borderRadius: 0,
                      fontSize: rem(13),
                      fontWeight: 500,
                    }}
                  >
                    Have a referral code? Save more!
                  </Button>
                )}

                {showReferralInput && !referralCode && (
                  <Box
                    style={{
                      padding: `${rem(12)} ${rem(14)}`,
                      borderTop: "1px solid rgba(15, 23, 42, 0.07)",
                      background: "#FAFAF9",
                    }}
                  >
                    <Group gap={rem(8)}>
                      <TextInput
                        placeholder="Enter referral code"
                        value={referralInput}
                        onChange={(e) => {
                          setReferralInput(e.target.value.toUpperCase());
                          if (referralError) setReferralError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyReferral()}
                        size="sm"
                        flex={1}
                        error={referralError || undefined}
                        styles={{
                          input: {
                            borderRadius: rem(8),
                            fontSize: rem(13),
                            fontFamily: "monospace",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          },
                        }}
                      />
                      <Button
                        size="sm"
                        loading={referralLoading}
                        disabled={!referralInput.trim()}
                        onClick={handleApplyReferral}
                        style={{
                          backgroundColor: INK,
                          color: "white",
                          borderRadius: rem(8),
                          fontWeight: 600,
                          minWidth: rem(64),
                        }}
                      >
                        Apply
                      </Button>
                    </Group>
                  </Box>
                )}
              </Box>

              {/* Line items */}
              <Stack gap={rem(9)} mb={rem(12)}>
                <Group justify="space-between">
                  <Text size="sm" style={{ color: MUTED }}>
                    {plan.name_short} plan
                  </Text>
                  <Text size="sm" style={{ color: INK, fontWeight: 500 }}>
                    {formatIDR(plan.total_price_idr)}
                  </Text>
                </Group>
                {referralDiscount > 0 && (
                  <Group justify="space-between">
                    <Text size="sm" style={{ color: "#16A34A" }}>
                      Referral discount
                    </Text>
                    <Text size="sm" fw={600} style={{ color: "#16A34A" }}>
                      − {formatIDR(referralDiscount)}
                    </Text>
                  </Group>
                )}
              </Stack>

              <Divider color="rgba(15, 23, 42, 0.07)" mb={rem(12)} />

              <Group justify="space-between" mb={rem(20)}>
                <Text fw={700} size="md" style={{ color: INK }}>
                  Total
                </Text>
                <Text fw={800} size="xl" style={{ color: PRIMARY }}>
                  {formatIDR(total)}
                </Text>
              </Group>

              {/* CTA */}
              <LandingActionButton
                presentation="auth"
                fullWidth
                size="md"
                loading={paymentLoading}
                onClick={handlePay}
                rightSection={!paymentLoading && <IconArrowRight size={16} stroke={2.2} />}
                style={{ marginBottom: rem(12) }}
              >
                Pay now
              </LandingActionButton>

              <Text size="xs" ta="center" style={{ color: MUTED, marginBottom: rem(10) }}>
                Not sure yet?
              </Text>

              <Button
                component="a"
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? "6285284229998"}?text=${encodeURIComponent("Hi ThinkNao! I have a question about the subscription plans.")}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                fullWidth
                size="sm"
                leftSection={<IconBrandWhatsapp size={16} />}
                styles={{
                  root: {
                    borderColor: "rgba(15, 23, 42, 0.16)",
                    color: INK,
                    borderRadius: rem(10),
                    fontWeight: 500,
                  },
                }}
              >
                Chat via WhatsApp
              </Button>

            </Box>
          )}
        </Box>
      </Box>

      {/* Auth gate modal */}
      <Modal
        opened={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        centered
        radius="md"
        size="sm"
        title={
          <Text fw={700} size="lg" style={{ color: INK }}>
            We want to know you more first
          </Text>
        }
      >
        <Stack gap={rem(20)}>
          <Text size="sm" style={{ color: MUTED, lineHeight: 1.6 }}>
            Create an account to continue with payment — it only takes a minute,
            and your selected plan will be saved automatically.
          </Text>

          <LandingActionButton
            presentation="auth"
            fullWidth
            size="md"
            onClick={() =>
              router.push(`/register?redirect=${encodeURIComponent(currentUrl)}`)
            }
            rightSection={<IconArrowRight size={16} stroke={2.2} />}
          >
            Create Account
          </LandingActionButton>

          <Text size="sm" ta="center" style={{ color: MUTED }}>
            Already have an account?{" "}
            <Anchor
              fw={700}
              style={{ color: INK }}
              component={Link}
              href={`/login?redirect=${encodeURIComponent(currentUrl)}`}
            >
              Log in
            </Anchor>
          </Text>
        </Stack>
      </Modal>
    </Box>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <Box
          style={{
            minHeight: "100vh",
            background: "#F3F5F7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader color="gold" size="md" />
        </Box>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
