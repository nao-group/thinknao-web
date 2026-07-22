"use client";

import Link from "next/link";
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
import { IconAt, IconLock } from "@tabler/icons-react";
import { AuthSplitLayout } from "@/components/auth-split-layout";

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

export default function LoginPage() {
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

      <Box component="form" style={{ display: "flex", flexDirection: "column", gap: rem(20) }}>
        <TextInput
          label="Email"
          placeholder="you@example.com"
          type="email"
          leftSection={<IconAt size={16} stroke={1.5} color="#667080" />}
          variant="filled"
          size="md"
          styles={inputStyles}
        />

        <PasswordInput
          label="Password"
          placeholder="••••••••••"
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
            style={{ color: PRIMARY }}
            component={Link}
            href="/forgot-password"
          >
            Forgot password?
          </Anchor>
        </Group>

        <Button
          type="submit"
          fullWidth
          size="md"
          radius="md"
          rightSection={<span>→</span>}
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
    </AuthSplitLayout>
  );
}
