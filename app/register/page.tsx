"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Anchor,
  Box,
  Button,
  Checkbox,
  Group,
  PasswordInput,
  Text,
  TextInput,
  Title,
  rem,
} from "@mantine/core";
import {
  IconAt,
  IconLock,
  IconSend,
  IconShield,
  IconUser,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { AuthSplitLayout } from "@/components/auth-split-layout";
import axios from "axios";

const INK = "#0F172A";
const PRIMARY = "#D4A017";

const inputStyles = {
  input: {
    borderRadius: rem(10),
    fontSize: rem(14),
  },
  label: {
    fontWeight: 500,
    fontSize: rem(14),
    color: INK,
    marginBottom: rem(6),
  },
};

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(true);

  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");

  const OTP_COOLDOWN = 60;
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCountdown() {
    setCountdown(OTP_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  async function handleSendOtp() {
    if (!email || !fullName) {
      setOtpError("Please enter your name and email first.");
      return;
    }
    setOtpError("");
    setSendingOtp(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/otp/send`, {
        full_name: fullName,
        email,
      });
      setOtpSent(true);
      startCountdown();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setOtpError("This email is already registered. Try logging in.");
        } else {
          setOtpError(err.response?.data?.detail ?? "Failed to send OTP.");
        }
      } else {
        setOtpError("Something went wrong. Please try again.");
      }
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agreed) {
      setError("You must agree to the Terms & Privacy Policy.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        full_name: fullName,
        email,
        otp,
        password,
      });
      notifications.show({
        title: "Account created!",
        message: "You're all set. Please log in to continue.",
        color: "green",
        autoClose: 4000,
      });
      router.push("/login");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (err.response?.status === 400) {
          setError(detail ?? "Invalid or expired verification code.");
        } else {
          setError(detail ?? "Registration failed. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout>
      <Text
        size="xs"
        fw={600}
        c="dimmed"
        tt="uppercase"
        style={{ letterSpacing: "0.08em" }}
        mb={8}
      >
        Get started
      </Text>

      <Title order={1} mb={8} style={{ fontSize: rem(36), color: INK }}>
        Create your account
      </Title>

      <Text size="sm" c="dimmed" mb={32}>
        Start prepping for the CSCA exam today.
      </Text>

      <Box
        component="form"
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: rem(20) }}
      >
        <TextInput
          label="Full name"
          placeholder="Li Wei"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          leftSection={<IconUser size={16} stroke={1.5} color="#667080" />}
          variant="default"
          size="md"
          styles={{
            ...inputStyles,
            input: { ...inputStyles.input, border: `1.5px solid ${INK}` },
          }}
        />

        <Box>
          <Text size="sm" fw={500} mb={6} style={{ color: INK }}>
            Email
          </Text>
          <Group gap="xs" align="flex-start">
            <TextInput
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftSection={<IconAt size={16} stroke={1.5} color="#667080" />}
              variant="filled"
              size="md"
              flex={1}
              styles={{ input: inputStyles.input }}
            />
            <Button
              size="md"
              radius="sm"
              loading={sendingOtp}
              disabled={countdown > 0}
              onClick={handleSendOtp}
              leftSection={!sendingOtp && <IconSend size={15} stroke={1.5} />}
              style={{
                backgroundColor: countdown > 0 ? "#667080" : INK,
                color: "white",
                fontWeight: 600,
                fontSize: rem(13),
                flexShrink: 0,
              }}
            >
              {otpSent
                ? countdown > 0
                  ? `Resend (${countdown}s)`
                  : "Resend"
                : "Send OTP"}
            </Button>
          </Group>
          {otpError && (
            <Text size="xs" c="red" mt={4}>
              {otpError}
            </Text>
          )}
        </Box>

        <Box>
          <TextInput
            label="Verification Code"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            disabled={!otpSent}
            leftSection={<IconShield size={16} stroke={1.5} color="#667080" />}
            variant="filled"
            size="md"
            styles={inputStyles}
          />
          {otpSent && (
            <Text size="xs" mt={6} c="dimmed">
              Didn&apos;t receive a code?{" "}
              {countdown > 0 ? (
                <Text span size="xs" c="dimmed">
                  Resend in {countdown}s
                </Text>
              ) : (
                <Anchor
                  size="xs"
                  fw={600}
                  style={{ color: PRIMARY }}
                  onClick={handleSendOtp}
                >
                  Resend
                </Anchor>
              )}
            </Text>
          )}
        </Box>

        <PasswordInput
          label="Password"
          placeholder="••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          leftSection={<IconLock size={16} stroke={1.5} color="#667080" />}
          variant="filled"
          size="md"
          styles={inputStyles}
        />

        <Checkbox
          label="I agree to the Terms & Privacy Policy"
          size="sm"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          styles={{
            label: { fontSize: rem(14), color: INK },
            input: { borderRadius: rem(4) },
          }}
        />

        {error && (
          <Text size="sm" c="red">
            {error}
          </Text>
        )}

        <Button
          type="submit"
          fullWidth
          size="md"
          radius="md"
          loading={submitting}
          disabled={!fullName.trim() || !email.trim() || !otpSent || !otp.trim() || !password.trim() || !agreed}
          rightSection={!submitting && <span>→</span>}
          style={{
            backgroundColor: !fullName.trim() || !email.trim() || !otpSent || !otp.trim() || !password.trim() || !agreed ? "#94A3B8" : INK,
            color: "white",
            fontWeight: 600,
            fontSize: rem(15),
            height: rem(52),
            opacity: 1,
          }}
        >
          Create account
        </Button>
      </Box>

      <Text size="sm" c="dimmed" ta="center" mt={24}>
        Already have an account?{" "}
        <Anchor fw={700} style={{ color: PRIMARY }} component={Link} href="/login">
          Log in
        </Anchor>
      </Text>
    </AuthSplitLayout>
  );
}
