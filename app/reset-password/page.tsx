"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Center,
  Loader,
  PasswordInput,
  Text,
  Title,
  rem,
} from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { AuthSplitLayout } from "@/components/auth-split-layout";
import axios from "axios";

const INK = "#0F172A";

const inputStyles = {
  input: { borderRadius: rem(10), fontSize: rem(14) },
  label: { fontWeight: 500, fontSize: rem(14), color: INK, marginBottom: rem(6) },
};

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tokenInvalid, setTokenInvalid] = useState(!token);

  useEffect(() => {
    if (!token) setTokenInvalid(true);
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        token,
        new_password: password,
      });
      notifications.show({
        title: "Password updated!",
        message: "Your password has been reset. Please log in.",
        color: "green",
        autoClose: 4000,
      });
      router.push("/login");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400 || status === 404) {
          setTokenInvalid(true);
        } else {
          setError(err.response?.data?.detail ?? "Something went wrong. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (tokenInvalid) {
    return (
      <Box style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: rem(16), paddingTop: rem(32) }}>
        <Box
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: "#FEE2E2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            color: "#DC2626",
          }}
        >
          &#10005;
        </Box>
        <Title order={2} style={{ color: INK, textAlign: "center" }}>
          Link expired or invalid
        </Title>
        <Text size="sm" c="dimmed" ta="center" maw={360}>
          This password reset link has already been used or has expired (15-minute
          limit). Please request a new one from the login page.
        </Text>
        <Button
          mt={8}
          size="md"
          radius="md"
          style={{ backgroundColor: INK, color: "white", fontWeight: 600 }}
          onClick={() => router.push("/login")}
        >
          Back to login
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Text
        size="xs"
        fw={600}
        c="dimmed"
        tt="uppercase"
        style={{ letterSpacing: "0.08em" }}
        mb={8}
      >
        Security
      </Text>

      <Title order={1} mb={8} style={{ fontSize: rem(36), color: INK }}>
        Set a new password
      </Title>

      <Text size="sm" c="dimmed" mb={32}>
        Choose a strong password you haven&apos;t used before.
      </Text>

      <Box
        component="form"
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: rem(20) }}
      >
        <PasswordInput
          label="New password"
          placeholder="••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          leftSection={<IconLock size={16} stroke={1.5} color="#667080" />}
          size="md"
          styles={inputStyles}
          description="Minimum 8 characters"
        />

        <PasswordInput
          label="Confirm new password"
          placeholder="••••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          leftSection={<IconLock size={16} stroke={1.5} color="#667080" />}
          size="md"
          styles={inputStyles}
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
          rightSection={!submitting && <span>→</span>}
          style={{
            backgroundColor: INK,
            color: "white",
            fontWeight: 600,
            fontSize: rem(15),
            height: rem(52),
            marginTop: rem(4),
          }}
        >
          Reset password
        </Button>
      </Box>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthSplitLayout>
      <Suspense
        fallback={
          <Center h={200}>
            <Loader color="dark" size="sm" />
          </Center>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthSplitLayout>
  );
}
