"use client";

import { useState } from "react";
import {
  AppShell,
  Box,
  Burger,
  Group,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAlignJustified,
  IconChevronLeft,
  IconChevronRight,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconPencil,
  IconStar,
  IconTrophy,
  IconUsers,
} from "@tabler/icons-react";

const INK = "#0F172A";
const MUTED = "#667080";
const ACTIVE_BG = "#374151";
const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 72;

const NAV_ITEMS = [
  { label: "Dashboard", icon: IconLayoutDashboard, href: "/dashboard" },
  { label: "Practice", icon: IconPencil, href: "/dashboard/practice" },
  { label: "Mock Exam", icon: IconAlignJustified, href: "/dashboard/mock-exam" },
  { label: "Leaderboard", icon: IconTrophy, href: "/dashboard/leaderboard" },
  { label: "Community", icon: IconUsers, href: "/dashboard/community" },
];

function LogoMark() {
  return (
    <Box
      style={{
        width: rem(36),
        height: rem(36),
        borderRadius: rem(8),
        backgroundColor: INK,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <IconLayoutGrid size={20} stroke={1.5} color="white" />
    </Box>
  );
}

function NavItem({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[0];
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  const button = (
    <UnstyledButton
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: rem(10),
        padding: collapsed ? `${rem(10)} 0` : `${rem(10)} ${rem(12)}`,
        borderRadius: rem(10),
        width: "100%",
        fontSize: rem(14),
        fontWeight: active ? 600 : 400,
        color: active ? "white" : MUTED,
        backgroundColor: active ? ACTIVE_BG : "transparent",
        transition: "background-color 150ms ease, color 150ms ease",
      }}
    >
      <Icon size={18} stroke={1.5} />
      {!collapsed && item.label}
    </UnstyledButton>
  );

  if (collapsed) {
    return (
      <Tooltip label={item.label} position="right" withArrow>
        {button}
      </Tooltip>
    );
  }

  return button;
}

function UnlockCard() {
  return (
    <Box
      m="xs"
      p="md"
      style={{ borderRadius: rem(14), backgroundColor: INK }}
    >
      <Box
        mb={10}
        style={{
          width: rem(32),
          height: rem(32),
          borderRadius: rem(8),
          backgroundColor: "rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconStar size={16} stroke={1.5} color="white" />
      </Box>
      <Text fw={700} size="sm" c="white" mb={4}>
        Unlock Full Access
      </Text>
      <Text size="xs" c="rgba(255,255,255,0.55)" mb={12} lh={1.5}>
        Get unlimited practice sets & mock exams for your CSCA prep.
      </Text>
      <UnstyledButton
        style={{
          display: "block",
          width: "100%",
          padding: `${rem(8)} ${rem(12)}`,
          borderRadius: rem(8),
          backgroundColor: "rgba(255,255,255,0.15)",
          color: "white",
          fontWeight: 600,
          fontSize: rem(13),
          textAlign: "center",
        }}
      >
        Subscribe Now
      </UnstyledButton>
    </Box>
  );
}

export function NavShell({ children }: { children: React.ReactNode }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("/dashboard");

  const toggleCollapsed = () => setCollapsed((c) => !c);

  return (
    <AppShell
      navbar={{
        width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened },
      }}
      padding={0}
    >
      <AppShell.Navbar
        style={{
          backgroundColor: "white",
          borderRight: "1px solid #E2E8F0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo — click to collapse/expand (desktop) */}
        <UnstyledButton
          onClick={toggleCollapsed}
          visibleFrom="sm"
          px={collapsed ? rem(8) : "md"}
          py="md"
          style={{
            width: "100%",
            borderBottom: "1px solid #E2E8F0",
            cursor: "pointer",
          }}
        >
          <Group gap={10} justify={collapsed ? "center" : "flex-start"} wrap="nowrap">
            <LogoMark />
            {!collapsed && (
              <Text fw={700} size="md" c={INK} lh={1} style={{ whiteSpace: "nowrap" }}>
                ThinkNao
              </Text>
            )}
          </Group>
        </UnstyledButton>

        {/* Logo — mobile only (non-interactive) */}
        <Box
          hiddenFrom="sm"
          px="md"
          py="md"
          style={{ borderBottom: "1px solid #E2E8F0" }}
        >
          <Group gap={10} wrap="nowrap">
            <LogoMark />
            <Text fw={700} size="md" c={INK} lh={1} style={{ whiteSpace: "nowrap" }}>
              ThinkNao
            </Text>
          </Group>
        </Box>

        {/* Nav items */}
        <ScrollArea flex={1} px={collapsed ? rem(8) : "xs"} py="xs">
          <Stack gap={2}>
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                active={active === item.href}
                collapsed={collapsed}
                onClick={() => setActive(item.href)}
              />
            ))}
          </Stack>
        </ScrollArea>

        {/* Unlock card — hidden when collapsed */}
        {!collapsed && <UnlockCard />}

        {/* Collapse toggle arrow — desktop only */}
        <Box
          visibleFrom="sm"
          px="xs"
          py="xs"
          style={{ borderTop: "1px solid #E2E8F0" }}
        >
          <UnstyledButton
            onClick={toggleCollapsed}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-end",
              width: "100%",
              height: rem(32),
              borderRadius: rem(8),
              color: MUTED,
              padding: `0 ${rem(4)}`,
            }}
          >
            {collapsed ? (
              <IconChevronRight size={15} stroke={1.5} />
            ) : (
              <Group gap={4}>
                <Text size="xs" c={MUTED}>
                  Collapse
                </Text>
                <IconChevronLeft size={15} stroke={1.5} />
              </Group>
            )}
          </UnstyledButton>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main
        style={{
          backgroundColor: "#F3F5F7",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Mobile top bar */}
        <Box
          hiddenFrom="sm"
          px="md"
          py="sm"
          style={{
            backgroundColor: "white",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            gap: rem(12),
          }}
        >
          <Burger opened={mobileOpened} onClick={toggleMobile} size="sm" color={INK} />
          <Group gap={10} wrap="nowrap">
            <LogoMark />
            <Text fw={700} size="md" c={INK} lh={1}>
              ThinkNao
            </Text>
          </Group>
        </Box>

        {children}
      </AppShell.Main>
    </AppShell>
  );
}
