"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AppShell,
  Avatar,
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
  IconChartBar,
  IconChevronLeft,
  IconChevronRight,
  IconLayoutGrid,
  IconPencil,
  IconUsers,
} from "@tabler/icons-react";
import { ProfileMenu } from "@/components/profile-menu";
import { useAuthStore } from "@/store/auth";

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
      { label: "References", icon: IconBook, href: "/references" },
      { label: "Practice", icon: IconPencil, href: "/practice" },
      { label: "Mock Exam", icon: IconAlignJustified, href: "/mock-exam" },
    ],
  },
  {
    label: "OTHERS",
    items: [
      { label: "Leaderboard", icon: IconChartBar, href: "/leaderboard" },
      { label: "Community", icon: IconUsers, href: "/dashboard/community" },
    ],
  },
];

function LogoMark({ collapsed }: { collapsed?: boolean }) {
  if (collapsed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/images/logo/thinknao_o.svg"
        alt="ThinkNao"
        style={{ width: rem(36), height: rem(36), objectFit: "contain", flexShrink: 0 }}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/logo/thinknao_full.svg"
      alt="ThinkNao"
      style={{ height: rem(32), objectFit: "contain", flexShrink: 0 }}
    />
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
  const [hovered, setHovered] = useState(false);

  const button = (
    <UnstyledButton
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
        color: active ? "white" : hovered ? INK : MUTED,
        backgroundColor: active ? ACTIVE_BG : hovered ? "rgba(245, 158, 11, 0.08)" : "transparent",
        transition: "background-color 150ms ease, color 150ms ease",
      }}
    >
      <Icon
        size={17}
        stroke={1.5}
        style={hovered ? { animation: "icon-spin 400ms ease forwards" } : undefined}
      />
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


const GREETING_PREFIX: Record<string, string> = {
  "/dashboard":           "Welcome back",
  "/practice":            "Let's practice",
  "/references":          "Study time",
  "/mock-exam":           "Test yourself",
  "/leaderboard":         "How do you rank",
  "/dashboard/community": "Connect & share",
  "/profile":             "Your profile",
};

function getGreeting(pathname: string): string {
  if (GREETING_PREFIX[pathname]) return GREETING_PREFIX[pathname];
  // Fall back to the closest parent route (longest prefix match)
  const match = Object.keys(GREETING_PREFIX)
    .filter((k) => pathname.startsWith(k + "/"))
    .sort((a, b) => b.length - a.length)[0];
  return match ? GREETING_PREFIX[match] : "Welcome back";
}

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/practice": "Practice",
  "/references": "References",
  "/mock-exam": "Mock Exam",
  "/leaderboard": "Leaderboard",
  "/dashboard/community": "Community",
  "/profile": "Profile",
  "/practice/saved-problems": "Saved Problems",
};

const BREADCRUMBS: Record<string, { label: string; href: string }[]> = {
  "/practice/saved-problems": [
    { label: "Practice", href: "/practice" },
    { label: "Saved Problems", href: "" },
  ],
};

function slugToLabel(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getBreadcrumbs(pathname: string) {
  if (BREADCRUMBS[pathname]) return BREADCRUMBS[pathname];
  const savedProblemMatch = pathname.match(/^\/practice\/saved-problems\/([^/]+)$/);
  if (savedProblemMatch) {
    return [
      { label: "Practice", href: "/practice" },
      { label: "Saved Problems", href: "/practice/saved-problems" },
      { label: `Problem ${savedProblemMatch[1]}`, href: "" },
    ];
  }
  const practiceMatch = pathname.match(/^\/practice\/([^/]+)$/);
  if (practiceMatch) {
    return [
      { label: "Practice", href: "/practice" },
      { label: slugToLabel(practiceMatch[1]), href: "" },
    ];
  }
  return null;
}

export function NavShell({ children }: { children: React.ReactNode }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("nav-collapsed") === "true");
  }, []);

  const toggleCollapsed = () =>
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("nav-collapsed", String(next));
      return next;
    });
  const pathname = usePathname();
  const router = useRouter();
  const firstName = useAuthStore((s) => s.user?.full_name?.split(" ")[0] ?? "");
  const fullName = useAuthStore((s) => s.user?.full_name ?? "");
  const email = useAuthStore((s) => s.user?.email ?? "");
  const avatarUrl = useAuthStore((s) => s.user?.avatar_url ?? undefined);
  const initials = fullName ? fullName.slice(0, 1).toUpperCase() : "?";

  const navbarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;
  const breadcrumbs = getBreadcrumbs(pathname);

  const allNavItems = NAV_SECTIONS.flatMap((s) => s.items);
  const hasExactMatch = allNavItems.some((i) => i.href === pathname);
  function isActive(href: string) {
    return hasExactMatch ? pathname === href : pathname.startsWith(href + "/");
  }

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
            <LogoMark collapsed={collapsed} />
          </UnstyledButton>

          {/* Mobile burger + logo */}
          <Group hiddenFrom="sm" px="md" gap="sm" align="center">
            <Burger opened={mobileOpened} onClick={toggleMobile} size="sm" color={INK} />
            <LogoMark collapsed={false} />
          </Group>

          {/* Welcome + actions */}
          <Group flex={1} px={{ base: "md", sm: "xl" }} justify="space-between" align="center" wrap="nowrap">
            <Box visibleFrom="sm">
              <Text fw={700} size="xl" c={INK} lh={1.5}>
                {getGreeting(pathname)}, {firstName}!
              </Text>
              {breadcrumbs ? (
                <Group gap={4} align="center">
                  {breadcrumbs.map((crumb, i) => (
                    <Group key={crumb.label} gap={4} align="center">
                      {i > 0 && <Text size="sm" c="dimmed">›</Text>}
                      {crumb.href ? (
                        <Text
                          size="sm"
                          c={MUTED}
                          style={{ cursor: "pointer", textDecoration: "none" }}
                          onClick={() => router.push(crumb.href)}
                          onMouseEnter={(e) => (e.currentTarget.style.color = INK)}
                          onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
                        >
                          {crumb.label}
                        </Text>
                      ) : (
                        <Text size="sm" c="dimmed">{crumb.label}</Text>
                      )}
                    </Group>
                  ))}
                </Group>
              ) : (
                <Text size="sm" c="dimmed">
                  {PAGE_LABELS[pathname] ?? "Dashboard"}
                </Text>
              )}
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
                      active={isActive(item.href)}
                      collapsed={collapsed}
                      onClick={() => router.push(item.href)}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </ScrollArea>

        {/* Profile button */}
        <Box
          px={collapsed ? rem(8) : "xs"}
          py="xs"
          style={{ borderTop: "1px solid #E2E8F0" }}
        >
          <UnstyledButton
            onClick={() => router.push("/profile")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: rem(10),
              padding: collapsed ? `${rem(9)} 0` : `${rem(9)} ${rem(12)}`,
              borderRadius: rem(10),
              width: "100%",
              transition: "background-color 150ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(245, 158, 11, 0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <Avatar src={avatarUrl} size={28} radius="xl" style={{ backgroundColor: INK, flexShrink: 0 }}>
              <Text size="xs" fw={700} c="white" style={{ lineHeight: 1 }}>
                {initials}
              </Text>
            </Avatar>
            {!collapsed && (
              <Box style={{ minWidth: 0 }}>
                <Text size="sm" fw={600} c={INK} style={{ lineHeight: 1.2 }} truncate>
                  {fullName || "Profile"}
                </Text>
                <Text size="xs" c={MUTED} truncate>
                  {email}
                </Text>
              </Box>
            )}
          </UnstyledButton>
        </Box>

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
