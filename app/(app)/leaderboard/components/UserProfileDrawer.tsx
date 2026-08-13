"use client";

import {
  Anchor,
  Avatar,
  Badge,
  Box,
  Drawer,
  Group,
  Stack,
  Text,
  rem,
} from "@mantine/core";
import {
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconMapPin,
  IconSchool,
  IconTarget,
  IconTrophy,
} from "@tabler/icons-react";
import { INK, SURFACE, PRIMARY, CREAM, MUTED } from "@/constants/colors";
import { getInitials } from "@/lib/format";
import { avatarStyle, RANK_MEDAL } from "./avatarStyle";
import { XpStats } from "./XpStats";
import type { LeaderboardEntry } from "../types";

// ─── Profile Drawer ────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <Group gap={8} align="center">
      <Icon size={14} stroke={1.5} color={MUTED} style={{ flexShrink: 0 }} />
      <Text size="sm" c={INK}>{text}</Text>
    </Group>
  );
}

function SocialRow({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  handle,
  baseUrl,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  handle: string | null;
  baseUrl: string;
}) {
  if (!handle) return null;
  return (
    <Group gap={10} align="center">
      <Box
        style={{
          width: rem(32),
          height: rem(32),
          borderRadius: rem(8),
          backgroundColor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={16} stroke={1.5} color={iconColor} />
      </Box>
      <Box style={{ minWidth: 0 }}>
        <Text size="xs" fw={600} c={MUTED}>{label}</Text>
        <Anchor href={`${baseUrl}${handle}`} target="_blank" size="sm" fw={600} c={INK} underline="hover">
          @{handle}
        </Anchor>
      </Box>
    </Group>
  );
}

export function UserProfileDrawer({
  entry,
  onClose,
}: {
  entry: LeaderboardEntry | null;
  onClose: () => void;
}) {
  const av = entry ? avatarStyle(entry.rank - 1) : { bg: CREAM, color: PRIMARY };
  const medal = entry ? RANK_MEDAL[entry.rank] : null;
  const hasSocial = entry && (entry.instagram || entry.tiktok || entry.linkedin);

  return (
    <Drawer
      opened={!!entry}
      onClose={onClose}
      position="right"
      size={rem(340)}
      withCloseButton={false}
      overlayProps={{ backgroundOpacity: 0.25, blur: 1 }}
      transitionProps={{ transition: "slide-left", duration: 220 }}
      styles={{
        body: { padding: 0, height: "100%", display: "flex", flexDirection: "column" },
        content: { borderRadius: `${rem(16)} 0 0 ${rem(16)}`, overflow: "hidden", display: "flex", flexDirection: "column" },
      }}
    >
      {entry && (
        <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Banner + avatar */}
          <Box
            style={{
              position: "relative",
              height: rem(160),
              background: `linear-gradient(135deg, ${INK} 0%, #1E2A4A 60%, #252060 100%)`,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Decorative rings */}
            {[
              { size: 200, top: -60, right: -40, opacity: 0.08 },
              { size: 140, top: -20, right: 60, opacity: 0.06 },
            ].map((ring, i) => (
              <Box
                key={i}
                style={{
                  position: "absolute",
                  top: rem(ring.top),
                  right: rem(ring.right),
                  width: rem(ring.size),
                  height: rem(ring.size),
                  borderRadius: "50%",
                  border: `1px solid rgba(255,255,255,${ring.opacity})`,
                  pointerEvents: "none",
                }}
              />
            ))}
            {/* Rank badge */}
            <Box
              style={{
                position: "absolute",
                top: rem(12),
                right: rem(12),
                padding: `${rem(4)} ${rem(10)}`,
                borderRadius: rem(999),
                backgroundColor: medal ? medal.color : "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                gap: rem(4),
              }}
            >
              <IconTrophy size={12} color="white" />
              <Text size="xs" fw={700} c="white">#{entry.rank}</Text>
            </Box>
            {/* Avatar centered on banner */}
            <Avatar
              size={rem(88)}
              radius="xl"
              style={{
                backgroundColor: av.bg,
                color: av.color,
                fontWeight: 700,
                fontSize: rem(24),
                border: "4px solid rgba(255,255,255,0.2)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              {getInitials(entry.full_name)}
            </Avatar>
          </Box>

          {/* Scrollable content */}
          <Box style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
            <Box px="lg" pt="md" pb="xl">
              {/* Name + XP */}
              <Group justify="space-between" align="flex-start" mb={4}>
                <Text fw={800} size="lg" c={INK} style={{ lineHeight: 1.2 }}>
                  {entry.full_name}
                </Text>
                <Badge
                  size="sm"
                  radius="sm"
                  style={{ backgroundColor: CREAM, color: PRIMARY, fontWeight: 700, flexShrink: 0 }}
                >
                  {entry.total_xp.toLocaleString()} XP
                </Badge>
              </Group>

              {/* Location + school */}
              <Stack gap={4} mb="md">
                {entry.province && <InfoRow icon={IconMapPin} text={entry.province} />}
                {entry.current_school && <InfoRow icon={IconSchool} text={entry.current_school} />}
                {entry.dream_university && <InfoRow icon={IconTarget} text={entry.dream_university} />}
              </Stack>

              {/* XP Stats */}
              <Box
                style={{ height: 1, backgroundColor: "#E2E8F0" }}
                mb="md"
              />
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.07em" }} mb={10}>
                XP Stats · 2026
              </Text>
              <XpStats yearlyXp={entry.yearly_xp} monthlyXp={entry.monthly_xp} />

              {/* Bio */}
              {entry.bio && (
                <>
                  <Box
                    style={{ height: 1, backgroundColor: "#E2E8F0" }}
                    mb="md"
                  />
                  <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.07em" }} mb={6}>
                    Bio
                  </Text>
                  <Box
                    px="sm"
                    py="xs"
                    mb="md"
                    style={{ backgroundColor: SURFACE, borderRadius: rem(8) }}
                  >
                    <Text size="sm" c={INK} lh={1.6}>
                      {entry.bio}
                    </Text>
                  </Box>
                </>
              )}

              {/* Social links */}
              {hasSocial && (
                <>
                  <Box
                    style={{ height: 1, backgroundColor: "#E2E8F0" }}
                    mb="md"
                  />
                  <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.07em" }} mb={10}>
                    Social
                  </Text>
                  <Stack gap={10}>
                    <SocialRow
                      icon={IconBrandInstagram}
                      iconColor="#E1306C"
                      iconBg="#FFF0F5"
                      label="Instagram"
                      handle={entry.instagram}
                      baseUrl="https://instagram.com/"
                    />
                    <SocialRow
                      icon={IconBrandTiktok}
                      iconColor="#010101"
                      iconBg="#F1F5F9"
                      label="TikTok"
                      handle={entry.tiktok}
                      baseUrl="https://tiktok.com/@"
                    />
                    <SocialRow
                      icon={IconBrandLinkedin}
                      iconColor="#0A66C2"
                      iconBg="#EFF6FF"
                      label="LinkedIn"
                      handle={entry.linkedin}
                      baseUrl="https://linkedin.com/in/"
                    />
                  </Stack>
                </>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
