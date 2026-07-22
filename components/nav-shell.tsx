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
  IconBell,
  IconBook,
  IconCards,
  IconChartBar,
  IconChevronLeft,
  IconChevronRight,
  IconLayoutGrid,
  IconPencil,
  IconUsers,
} from "@tabler/icons-react";
import { ProfileMenu } from "@/components/profile-menu";

const INK = "#0F172A";
const MUTED = "#667080";
const ACTIVE_BG = "#374151";
const HEADER_HEIGHT = 80;
const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 72;

const NAV_SECTIONS = [
  {
    label: "HOME",
    items: [{ label: "Dashboard", icon: IconLayoutGrid, href: "/dashboard" }],
  },
  {
    label: "LEARNING",
    items: [
      { label: "Practice", icon: IconPencil, href: "/dashboard/practice" },
      { label: "Flashcards", icon: IconCards, href: "/dashboard/flashcards" },
      { label: "References", icon: IconBook, href: "/dashboard/references" },
      { label: "Mock Exam", icon: IconAlignJustified, href: "/dashboard/mock-exam" },
    ],
  },
  {
    label: "OTHERS",
    items: [
      { label: "Leaderboard", icon: IconChartBar, href: "/dashboard/leaderboard" },
      { label: "Community", icon: IconUsers, href: "/dashboard/community" },
    ],
  },
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
  item: { label: string; icon: React.ElementType; href: string };
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
        padding: collapsed ? `${rem(9)} 0` : `${rem(9)} ${rem(12)}`,
        borderRadius: rem(10),
        width: "100%",
        fontSize: rem(14),
        fontWeight: active ? 600 : 400,
        color: active ? "white" : MUTED,
        backgroundColor: active ? ACTIVE_BG : "transparent",
        transition: "background-color 150ms ease, color 150ms ease",
      }}
    >
      <Icon size={17} stroke={1.5} />
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


export function NavShell({ children }: { children: React.ReactNode }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("/dashboard");

  const toggleCollapsed = () => setCollapsed((c) => !c);
  const navbarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <AppShell
      header={{ height: HEADER_HEIGHT }}
      navbar={{
        width: navbarWidth,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened },
      }}
      padding={0}
    >
      {/* ── Full-width header ── */}
      <AppShell.Header style={{ borderBottom: "1px solid #E2E8F0" }}>
        <Group h="100%" wrap="nowrap" gap={0}>
          {/* Logo section — width tracks sidebar */}
          <UnstyledButton
            onClick={toggleCollapsed}
            visibleFrom="sm"
            style={{
              width: navbarWidth,
              height: "100%",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              paddingInline: collapsed ? 0 : rem(20),
              justifyContent: collapsed ? "center" : "flex-start",
              borderRight: "1px solid #E2E8F0",
              transition: "width 200ms ease, padding 200ms ease",
              cursor: "pointer",
            }}
          >
            <Group gap={10} wrap="nowrap">
              <LogoMark />
              {!collapsed && (
                <Text fw={700} size="md" c={INK} lh={1} style={{ whiteSpace: "nowrap" }}>
                  ThinkNao
                </Text>
              )}
            </Group>
          </UnstyledButton>

          {/* Mobile burger + logo */}
          <Group hiddenFrom="sm" px="md" gap="sm" align="center">
            <Burger opened={mobileOpened} onClick={toggleMobile} size="sm" color={INK} />
            <Group gap={10} wrap="nowrap">
              <LogoMark />
              <Text fw={700} size="md" c={INK} lh={1}>
                ThinkNao
              </Text>
            </Group>
          </Group>

          {/* Welcome + actions */}
          <Group flex={1} px={{ base: "md", sm: "xl" }} justify="space-between" align="center" wrap="nowrap">
            <Box visibleFrom="sm">
              <Text fw={700} size="xl" c={INK} lh={1.5}>
                Welcome back, Li Wei!
              </Text>
              <Text size="sm" c="dimmed">
                Dashboard
              </Text>
            </Box>

            <Group gap="sm" align="center" style={{ marginLeft: "auto" }}>
              <ProfileMenu />
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      {/* ── Sidebar ── */}
      <AppShell.Navbar
        style={{
          backgroundColor: "white",
          borderRight: "1px solid #E2E8F0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ScrollArea flex={1} px={collapsed ? rem(8) : "xs"} py="sm">
          <Stack gap={0}>
            {NAV_SECTIONS.map((section, si) => (
              <Box key={section.label} mb={si < NAV_SECTIONS.length - 1 ? 4 : 0}>
                {/* Section label — hidden when collapsed */}
                {!collapsed && (
                  <Text
                    size="xs"
                    fw={600}
                    c="dimmed"
                    tt="uppercase"
                    style={{ letterSpacing: "0.07em", paddingInline: rem(12) }}
                    mb={4}
                    mt={si > 0 ? 16 : 4}
                  >
                    {section.label}
                  </Text>
                )}
                {collapsed && si > 0 && (
                  <Box
                    my={8}
                    style={{ height: 1, backgroundColor: "#E2E8F0", marginInline: rem(8) }}
                  />
                )}

                <Stack gap={2}>
                  {section.items.map((item) => (
                    <NavItem
                      key={item.href}
                      item={item}
                      active={active === item.href}
                      collapsed={collapsed}
                      onClick={() => setActive(item.href)}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </ScrollArea>

        {/* Unlock card */}
        {/* Collapse toggle — desktop only */}
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
                <Text size="xs" c={MUTED}>Collapse</Text>
                <IconChevronLeft size={15} stroke={1.5} />
              </Group>
            )}
          </UnstyledButton>
        </Box>
      </AppShell.Navbar>

      {/* ── Main content ── */}
      <AppShell.Main
        style={{
          backgroundColor: "#F3F5F7",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
