"use client";

import { Avatar, Badge, Box, Group, Menu, Text, UnstyledButton, rem } from "@mantine/core";
import { IconChevronDown, IconLogout, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import api from "@/lib/api";

const INK = "#0F172A";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileMenu() {
  const router = useRouter();
  const { user, logout, accessToken } = useAuthStore();

  async function handleSignOut() {
    try {
      if (accessToken) {
        await api.post("/api/auth/logout");
      }
    } catch {
      // proceed with local logout even if API call fails
    }
    logout();
    router.push("/login");
  }

  const displayName = user?.full_name ?? "Guest";
  const initials = getInitials(displayName);

  return (
    <Menu
      position="bottom-end"
      offset={8}
      withArrow
      arrowPosition="center"
      shadow="md"
      radius="md"
      width={200}
    >
      <Menu.Target>
        <UnstyledButton style={{ borderRadius: rem(10), cursor: "pointer" }}>
          <Group gap="xs" align="center">
            <Avatar color="dark" radius="xl" size={38}>
              {initials}
            </Avatar>
            <Box visibleFrom="sm">
              <Group gap={6} align="center">
                <Text size="sm" fw={600} c={INK} lh={1.3}>
                  {displayName}
                </Text>
                <Badge size="xs" color="dark" variant="filled" radius="sm">
                  PRO
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">
                {user?.email ?? ""}
              </Text>
            </Box>
            <IconChevronDown size={24} stroke={2} color="#667080" />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconUser size={15} stroke={1.5} />}
          onClick={() => router.push("/profile")}
        >
          Profile
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<IconLogout size={15} stroke={1.5} />}
          color="red"
          onClick={handleSignOut}
        >
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
