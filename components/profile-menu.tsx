"use client";

import { Avatar, Badge, Box, Group, Menu, Text, UnstyledButton, rem } from "@mantine/core";
import { IconChevronDown, IconLogout, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const INK = "#0F172A";

export function ProfileMenu() {
  const router = useRouter();

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
              LW
            </Avatar>
            <Box visibleFrom="sm">
              <Group gap={6} align="center">
                <Text size="sm" fw={600} c={INK} lh={1.3}>
                  Li Wei
                </Text>
                <Badge size="xs" color="dark" variant="filled" radius="sm">
                  PRO
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">
                23 days left · Expires Aug 13, 2026
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
        >
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
