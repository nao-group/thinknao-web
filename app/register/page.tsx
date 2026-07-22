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
import {
  IconAt,
  IconLock,
  IconSend,
  IconShield,
  IconUser,
} from "@tabler/icons-react";
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

export default function RegisterPage() {
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

      <Box component="form" style={{ display: "flex", flexDirection: "column", gap: rem(20) }}>
        <TextInput
          label="Full name"
          placeholder="Li Wei"
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
              leftSection={<IconAt size={16} stroke={1.5} color="#667080" />}
              variant="filled"
              size="md"
              flex={1}
              styles={{ input: inputStyles.input }}
            />
            <Button
              size="md"
              radius="sm"
              leftSection={<IconSend size={15} stroke={1.5} />}
              style={{
                backgroundColor: INK,
                color: "white",
                fontWeight: 600,
                fontSize: rem(13),
                flexShrink: 0,
              }}
            >
              Send OTP
            </Button>
          </Group>
        </Box>

        <Box>
          <TextInput
            label="Verification Code"
            placeholder="Enter 6-digit OTP"
            leftSection={<IconShield size={16} stroke={1.5} color="#667080" />}
            variant="filled"
            size="md"
            styles={inputStyles}
          />
          <Text size="xs" mt={6} c="dimmed">
            Didn&apos;t receive a code?{" "}
            <Anchor size="xs" fw={600} style={{ color: PRIMARY }}>
              Resend
            </Anchor>
          </Text>
        </Box>

        <PasswordInput
          label="Password"
          placeholder="••••••••••"
          leftSection={<IconLock size={16} stroke={1.5} color="#667080" />}
          variant="filled"
          size="md"
          styles={inputStyles}
        />

        <Checkbox
          label="I agree to the Terms & Privacy Policy"
          size="sm"
          defaultChecked
          styles={{
            label: { fontSize: rem(14), color: INK },
            input: { borderRadius: rem(4) },
          }}
        />

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
