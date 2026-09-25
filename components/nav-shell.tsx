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
  IconBook,
  IconCalculator,
  IconChartBar,
  IconChartHistogram,
  IconChevronLeft,
  IconChevronRight,
  IconLayoutGrid,
  IconPencil,
  IconCalendarEvent,
  IconUsers,
} from "@tabler/icons-react";
import { ProfileMenu } from "@/components/profile-menu";
import { AppTour } from "@/components/app-tour";
import { SubscriptionExpiryBanner } from "@/components/subscription-expiry-banner";
import { ColorSchemeToggle } from "@/components/color-scheme-toggle";
import { useAuthStore } from "@/store/auth";
import { useNavStore } from "@/store/nav";
import { INK } from "@/constants/colors";
import styles from "./nav-shell.module.css";
import { fetchSubscription, type Subscription } from "@/lib/payments";

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
      { label: "Words", icon: IconBook, href: "/references/words" },
      { label: "Formulas", icon: IconCalculator, href: "/references/formulas" },
      { label: "Practice", icon: IconPencil, href: "/practice" },
      { label: "Mock Exam", icon: IconAlignJustified, href: "/mock-exam" },
      { label: "Learning Stats", icon: IconChartHistogram, href: "/learning-stats" },
    ],
  },
  {
    label: "EVENTS",
    items: [{ label: "Tryout", icon: IconCalendarEvent, href: "/tryout" }],
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
  const source = collapsed ? "nao_icon" : "think_nao";
  const size = collapsed
    ? { width: rem(36), height: rem(36) }
    : { width: rem(168), height: "auto", maxHeight: rem(46) };

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.lightSchemeLogo}
        src={`/images/logo/${source}_light.png`}
        alt="ThinkNAO"
        style={{ ...size, objectFit: "contain", flexShrink: 0 }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.darkSchemeLogo}
        src={`/images/logo/${source}_dark.png`}
        alt=""
        aria-hidden="true"
        style={{ ...size, objectFit: "contain", flexShrink: 0 }}
      />
    </>
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
      className={styles.navItem}
      data-tour={item.href}
      data-active={active || undefined}
      data-collapsed={collapsed || undefined}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={18} stroke={1.65} aria-hidden="true" />
      {!collapsed && <span>{item.label}</span>}
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
  "/references/words":    "Study time",
  "/references/formulas": "Study time",
  "/mock-exam":           "Test yourself",
  "/learning-stats":      "See your progress",
  "/tryout":              "Join an event",
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
  "/references/words": "Words",
  "/references/formulas": "Formulas",
  "/mock-exam": "Mock Exam",
  "/learning-stats": "Learning Stats",
  "/tryout": "Tryout",
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


function getBreadcrumbs(pathname: string, sessionName?: string | null, problemCode?: string | null) {
  if (BREADCRUMBS[pathname]) return BREADCRUMBS[pathname];
  const savedProblemMatch = pathname.match(/^\/practice\/saved-problems\/([^/]+)$/);
  if (savedProblemMatch) {
    // The URL segment is the question's UUID, which is meaningless to a reader —
    // show the question code (e.g. "MT-EF-0005-0000") that the page publishes to
    // the nav store once loaded, and just "Problem" until it arrives.
    return [
      { label: "Practice", href: "/practice" },
      { label: "Saved Problems", href: "/practice/saved-problems" },
      { label: problemCode ? `Problem ${problemCode}` : "Problem", href: "" },
    ];
  }
  const practiceMatch = pathname.match(/^\/practice\/([^/]+)$/);
  if (practiceMatch) {
    return [
      { label: "Practice", href: "/practice" },
      { label: sessionName || "Loading…", href: "" },
    ];
  }
  return null;
}

export function NavShell({ children }: { children: React.ReactNode }) {
  const [renderedAt] = useState(() => Date.now());
  const [mobileOpened, { toggle: toggleMobile, open: openMobile }] = useDisclosure();
  const [collapsed, setCollapsed] = useState(true);
  const [tourOpen, setTourOpen] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [expiryBannerDismissed, setExpiryBannerDismissed] = useState(false);

  useEffect(() => {
    let active = true;
    fetchSubscription()
      .then((result) => { if (active) setSubscription(result); })
      .catch(() => { if (active) setSubscription(null); });
    return () => { active = false; };
  }, []);

  const toggleCollapsed = () => setCollapsed((current) => !current);
  const pathname = usePathname();
  const router = useRouter();
  const storeSessionName = useNavStore((s) => s.sessionName);
  const storeProblemCode = useNavStore((s) => s.problemCode);
  const firstName = useAuthStore((s) => s.user?.full_name?.split(" ")[0] ?? "");
  const fullName = useAuthStore((s) => s.user?.full_name ?? "");
  const email = useAuthStore((s) => s.user?.email ?? "");
  const tourUser = useAuthStore((s) => s.user);
  const avatarUrl = useAuthStore((s) => s.user?.avatar_url ?? undefined);

  useEffect(() => {
    if (pathname !== "/dashboard" || !tourUser?.onboarding_completed) return;
    const key = `thinknao:tour:v1:${tourUser.user_id}`;
    if (window.localStorage.getItem(key)) return;
    const timer = window.setTimeout(() => {
      setCollapsed(false);
      if (window.innerWidth < 768) openMobile();
      setTourOpen(true);
    }, 850);
    return () => window.clearTimeout(timer);
  }, [pathname, tourUser?.onboarding_completed, tourUser?.user_id, openMobile]);

  useEffect(() => {
    function replayTour() {
      router.push("/dashboard");
      setCollapsed(false);
      if (window.innerWidth < 768) openMobile();
      setTourOpen(true);
    }
    window.addEventListener("thinknao:start-tour", replayTour);
    return () => window.removeEventListener("thinknao:start-tour", replayTour);
  }, [router, openMobile]);

  function finishTour() {
    if (tourUser?.user_id) window.localStorage.setItem(`thinknao:tour:v1:${tourUser.user_id}`, "done");
    setTourOpen(false);
  }
  const initials = fullName ? fullName.slice(0, 1).toUpperCase() : "?";

  const navbarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;
  const breadcrumbs = getBreadcrumbs(pathname, storeSessionName, storeProblemCode);
  const expiryRemaining = subscription?.expires_at ? new Date(subscription.expires_at).getTime() - renderedAt : 0;
  const showExpiryBanner = Boolean(
    !expiryBannerDismissed &&
    subscription?.status === "active" &&
    expiryRemaining > 0 &&
    expiryRemaining <= 3 * 24 * 60 * 60 * 1000
  );

  const allNavItems = NAV_SECTIONS.flatMap((s) => s.items);
  const hasExactMatch = allNavItems.some((i) => i.href === pathname);
  function isActive(href: string) {
    return hasExactMatch ? pathname === href : pathname.startsWith(href + "/");
  }

  return (
    <AppShell
      className={styles.shell}
      header={{ height: HEADER_HEIGHT }}
      navbar={{
        width: navbarWidth,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened },
      }}
      padding={0}
    >
      {/* ── Full-width header ── */}
      <AppShell.Header className={styles.header}>
        <Group h={HEADER_HEIGHT} wrap="nowrap" gap={0}>
          {/* Logo section — width tracks sidebar */}
          <UnstyledButton
            className={styles.logoButton}
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
              transition: "width 200ms ease, padding 200ms ease",
              cursor: "pointer",
            }}
          >
            <LogoMark collapsed={collapsed} />
          </UnstyledButton>

          {/* Mobile burger + logo */}
          <Group hiddenFrom="sm" px="md" gap="sm" align="center">
            <Burger opened={mobileOpened} onClick={toggleMobile} size="sm" color="#F7FBFC" />
            <LogoMark collapsed={false} />
          </Group>

          {/* Welcome + actions */}
          <Group flex={1} px={{ base: "md", sm: "xl" }} justify="space-between" align="center" wrap="nowrap">
            <Box visibleFrom="sm">
              <Text className={styles.greeting} c="#F7FBFC" lh={1.2}>
                {getGreeting(pathname)}, {firstName}!
              </Text>
              {breadcrumbs ? (
                <Group gap={4} align="center">
                  {breadcrumbs.map((crumb, i) => (
                    <Group key={crumb.label} gap={4} align="center">
                      {i > 0 && <Text size="sm" c="rgba(226, 241, 244, .58)">›</Text>}
                      {crumb.href ? (
                        <Text
                          size="sm"
                          c="rgba(226, 241, 244, .72)"
                          style={{ cursor: "pointer", textDecoration: "none" }}
                          onClick={() => router.push(crumb.href)}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(226, 241, 244, .72)")}
                        >
                          {crumb.label}
                        </Text>
                      ) : (
                        <Text size="sm" c="rgba(226, 241, 244, .58)">{crumb.label}</Text>
                      )}
                    </Group>
                  ))}
                </Group>
              ) : (
                <Text size="sm" c="rgba(226, 241, 244, .58)">
                  {PAGE_LABELS[pathname] ?? "Dashboard"}
                </Text>
              )}
            </Box>

            <Group gap="sm" align="center" style={{ marginLeft: "auto" }}>
              <Box data-tour="appearance"><ColorSchemeToggle className={styles.themeToggle} /></Box>
              <ProfileMenu />
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      {/* ── Sidebar ── */}
      <AppShell.Navbar
        className={styles.navbar}
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ScrollArea flex={1} px={collapsed ? 0 : "xs"} py="md">
          <Stack gap={0}>
            {NAV_SECTIONS.map((section, si) => (
              <Box key={section.label} mb={si < NAV_SECTIONS.length - 1 ? 4 : 0}>
                {/* Section label — hidden when collapsed */}
                {!collapsed && (
                  <Text
                    className={styles.sectionLabel}
                    size="xs"
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
          className={styles.sidebarFooter}
          px={collapsed ? rem(8) : "xs"}
          py="xs"
        >
          <UnstyledButton
            className={styles.profileButton}
            data-tour="profile"
            onClick={() => router.push("/profile")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: rem(10),
              padding: collapsed ? `${rem(9)} 0` : `${rem(9)} ${rem(12)}`,
              width: "100%",
            }}
          >
            <Avatar src={avatarUrl} size={28} radius="xl" style={{ backgroundColor: INK, flexShrink: 0 }}>
              <Text size="xs" fw={700} c="white" style={{ lineHeight: 1 }}>
                {initials}
              </Text>
            </Avatar>
            {!collapsed && (
              <Box style={{ minWidth: 0 }}>
                <Text size="sm" fw={600} c="#F7FBFC" style={{ lineHeight: 1.2 }} truncate>
                  {fullName || "Profile"}
                </Text>
                <Text size="xs" c="rgba(226, 241, 244, .62)" truncate>
                  {email}
                </Text>
              </Box>
            )}
          </UnstyledButton>
        </Box>

        {/* Collapse toggle — desktop only */}
        <Box
          className={styles.sidebarFooter}
          visibleFrom="sm"
          px="xs"
          py="xs"
        >
          <UnstyledButton
            className={styles.collapseButton}
            onClick={toggleCollapsed}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-end",
              width: "100%",
              height: rem(32),
              borderRadius: rem(8),
              color: "rgba(226, 241, 244, .7)",
              padding: `0 ${rem(4)}`,
            }}
          >
            {collapsed ? (
              <IconChevronRight size={15} stroke={1.5} />
            ) : (
              <Group gap={4}>
                <Text size="xs" c="rgba(226, 241, 244, .7)">Collapse</Text>
                <IconChevronLeft size={15} stroke={1.5} />
              </Group>
            )}
          </UnstyledButton>
        </Box>
      </AppShell.Navbar>

      {/* ── Main content ── */}
      <AppShell.Main
        className={styles.main}
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {showExpiryBanner && subscription?.expires_at && (
          <SubscriptionExpiryBanner
            expiresAt={subscription.expires_at}
            onDismiss={() => setExpiryBannerDismissed(true)}
          />
        )}
        <Box key={pathname} className={styles.pageTransition}>
          {children}
        </Box>
      </AppShell.Main>
      <span className={styles.innerCorner} aria-hidden="true" />
      {tourOpen && pathname === "/dashboard" && <AppTour onClose={finishTour} />}
    </AppShell>
  );
}
