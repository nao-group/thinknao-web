"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Anchor,
  Box,
  Button,
  Checkbox,
  Group,
  Modal,
  PasswordInput,
  Radio,
  Stack,
  Text,
  TextInput,
  Title,
  rem,
} from "@mantine/core";
import { IconAt, IconDeviceDesktop, IconLock, IconMail } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { AuthSplitLayout } from "@/components/auth-split-layout";
import { useAuthStore } from "@/store/auth";
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

interface Session {
  session_id: string;
  device: string;
  created_at: string;
}

interface MaxDevicesPayload {
  login_token: string;
  sessions: Session[];
}

export default function LoginPage() {
  const router = useRouter();
  const { setAccessToken, setUser } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Max devices modal state
  const [maxDevices, setMaxDevices] = useState<MaxDevicesPayload | null>(null);
  const [selectedSession, setSelectedSession] = useState("");
  const [revoking, setRevoking] = useState(false);

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");

  async function handleForgotPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        email: forgotEmail,
      });
      setForgotSent(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setForgotError(err.response?.data?.detail ?? "Something went wrong. Please try again.");
      } else {
        setForgotError("Something went wrong. Please try again.");
      }
    } finally {
      setForgotLoading(false);
    }
  }

  function closeForgotModal() {
    setForgotOpen(false);
    setForgotEmail("");
    setForgotSent(false);
    setForgotError("");
  }

  function storeSession(accessToken: string, refreshToken: string, user: { id: string; user_id: string; full_name: string; email: string }) {
    setAccessToken(accessToken);
    setUser(user);
    localStorage.setItem("refresh_token", refreshToken);
    document.cookie = "auth_session=1; path=/; max-age=2592000";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        { email, password }
      );
      storeSession(data.access_token, data.refresh_token, data.user);
      notifications.show({
        title: "Welcome back!",
        message: `Good to see you again, ${data.user.full_name.split(" ")[0]}.`,
        color: "green",
        autoClose: 3000,
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          const payload = err.response.data as MaxDevicesPayload;
          setMaxDevices(payload);
          setSelectedSession(payload.sessions[0]?.session_id ?? "");
        } else {
          setError(err.response?.data?.detail ?? "Invalid email or password.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke() {
    if (!maxDevices || !selectedSession) return;
    setRevoking(true);
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/sessions/revoke`,
        { login_token: maxDevices.login_token, session_id: selectedSession }
      );
      setMaxDevices(null);
      storeSession(data.access_token, data.refresh_token, data.user);
      notifications.show({
        title: "Welcome back!",
        message: `Good to see you again, ${data.user.full_name.split(" ")[0]}.`,
        color: "green",
        autoClose: 3000,
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setMaxDevices(null);
        setError("Session expired. Please try logging in again.");
      } else {
        setError("Failed to sign out device. Try again.");
      }
    } finally {
      setRevoking(false);
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
        Welcome back
      </Text>

      <Title order={1} mb={8} style={{ fontSize: rem(36), color: INK }}>
        Log in to ThinkNao
      </Title>

      <Text size="sm" c="dimmed" mb={32}>
        Pick up right where you left off.
      </Text>

      <Box
        component="form"
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: rem(20) }}
      >
        <TextInput
          label="Email"
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          leftSection={<IconAt size={16} stroke={1.5} color="#667080" />}
          variant="filled"
          size="md"
          styles={inputStyles}
        />

        <PasswordInput
          label="Password"
          placeholder="••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          leftSection={<IconLock size={16} stroke={1.5} color="#667080" />}
          size="md"
          styles={{
            ...inputStyles,
            input: {
              ...inputStyles.input,
              border: `1.5px solid ${INK}`,
              backgroundColor: "white",
            },
          }}
        />

        <Group justify="space-between" align="center">
          <Checkbox
            label="Remember me"
            size="sm"
            styles={{
              label: { fontSize: rem(14), color: INK },
              input: { borderRadius: rem(4) },
            }}
          />
          <Anchor
            size="sm"
            fw={600}
            style={{ color: PRIMARY, cursor: "pointer" }}
            onClick={() => setForgotOpen(true)}
          >
            Forgot password?
          </Anchor>
        </Group>

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
          loading={loading}
          rightSection={!loading && <span>→</span>}
          style={{
            backgroundColor: INK,
            color: "white",
            fontWeight: 600,
            fontSize: rem(15),
            height: rem(52),
            marginTop: rem(4),
          }}
        >
          Log in
        </Button>
      </Box>

      <Text size="sm" c="dimmed" ta="center" mt={24}>
        New to ThinkNao?{" "}
        <Anchor fw={700} c={INK} component={Link} href="/register">
          Create an account
        </Anchor>
      </Text>

      {/* Max devices modal */}
      <Modal
        opened={!!maxDevices}
        onClose={() => setMaxDevices(null)}
        title={
          <Text fw={700} size="lg" c={INK}>
            Device limit reached
          </Text>
        }
        centered
        radius="md"
      >
        <Text size="sm" c="dimmed" mb={20}>
          You&apos;re signed in on 2 devices (the maximum). Choose one to sign
          out so you can continue.
        </Text>

        <Radio.Group
          value={selectedSession}
          onChange={setSelectedSession}
          mb={24}
        >
          <Stack gap="sm">
            {maxDevices?.sessions.map((s) => (
              <Radio.Card
                key={s.session_id}
                value={s.session_id}
                radius="md"
                p="sm"
                style={{ border: `1.5px solid ${selectedSession === s.session_id ? INK : "#e5e7eb"}` }}
              >
                <Group>
                  <IconDeviceDesktop size={18} stroke={1.5} color="#667080" />
                  <Box>
                    <Text size="sm" fw={500} c={INK}>
                      {s.device}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Signed in{" "}
                      {new Date(s.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </Box>
                </Group>
              </Radio.Card>
            ))}
          </Stack>
        </Radio.Group>

        <Button
          fullWidth
          size="md"
          radius="md"
          loading={revoking}
          onClick={handleRevoke}
          style={{ backgroundColor: INK, color: "white", fontWeight: 600 }}
        >
          Sign out selected device &amp; continue
        </Button>
      </Modal>

      {/* Forgot password modal */}
      <Modal
        opened={forgotOpen}
        onClose={closeForgotModal}
        title={
          <Text fw={700} size="lg" c={INK}>
            Reset your password
          </Text>
        }
        centered
        radius="md"
      >
        {forgotSent ? (
          <Stack align="center" gap="md" py="sm">
            <Box
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: "#F7E7D3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconMail size={26} stroke={1.5} color={PRIMARY} />
            </Box>
            <Text fw={600} size="md" c={INK} ta="center">
              Check your inbox
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              We sent a password reset link to{" "}
              <Text span fw={600} c={INK}>
                {forgotEmail}
              </Text>
              . The link expires in 15 minutes.
            </Text>
            <Text size="xs" c="dimmed" ta="center">
              Didn&apos;t receive it? Check your spam folder or{" "}
              <Anchor
                size="xs"
                fw={600}
                style={{ color: PRIMARY, cursor: "pointer" }}
                onClick={() => { setForgotSent(false); setForgotError(""); }}
              >
                try again
              </Anchor>
              .
            </Text>
          </Stack>
        ) : (
          <Box component="form" onSubmit={handleForgotPassword}>
            <Text size="sm" c="dimmed" mb={20}>
              Enter the email address for your account and we&apos;ll send you a
              reset link.
            </Text>
            <TextInput
              label="Email address"
              placeholder="you@example.com"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              leftSection={<IconAt size={16} stroke={1.5} color="#667080" />}
              size="md"
              styles={inputStyles}
              mb={forgotError ? 8 : 20}
            />
            {forgotError && (
              <Text size="sm" c="red" mb={16}>
                {forgotError}
              </Text>
            )}
            <Button
              type="submit"
              fullWidth
              size="md"
              radius="md"
              loading={forgotLoading}
              style={{ backgroundColor: INK, color: "white", fontWeight: 600 }}
            >
              Send reset link
            </Button>
          </Box>
        )}
      </Modal>
    </AuthSplitLayout>
  );
}
