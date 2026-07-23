"use client";

import { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  PasswordInput,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  rem,
} from "@mantine/core";
import {
  IconBolt,
  IconCalendarEvent,
  IconLock,
  IconMapPin,
  IconPencil,
  IconSchool,
  IconTarget,
  IconTrophy,
} from "@tabler/icons-react";
import api from "@/lib/api";

import { INK, SURFACE, PRIMARY, CREAM, INDIGO } from "@/constants/colors";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  grade: string | null;
  province: string | null;
  current_school: string | null;
  dream_university: string | null;
  target_major: string | null;
  created_at: string;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatJoinDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <Box
      p="md"
      style={{
        backgroundColor: "white",
        borderRadius: rem(14),
        display: "flex",
        alignItems: "center",
        gap: rem(14),
      }}
    >
      <Box
        style={{
          width: rem(44),
          height: rem(44),
          borderRadius: rem(10),
          backgroundColor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={20} stroke={1.5} color={iconColor} />
      </Box>
      <Box>
        <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.06em" }} mb={2}>
          {label}
        </Text>
        <Text fw={700} size="lg" c={INK}>
          {value}
        </Text>
      </Box>
    </Box>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.06em" }} mb={6}>
        {label}
      </Text>
      <Box
        px="sm"
        py="xs"
        style={{
          backgroundColor: SURFACE,
          borderRadius: rem(8),
          minHeight: rem(38),
          display: "flex",
          alignItems: "center",
        }}
      >
        <Text size="sm" c={value ? INK : "dimmed"}>
          {value || "—"}
        </Text>
      </Box>
    </Box>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Box p="xl" style={{ backgroundColor: "white", borderRadius: rem(14) }}>
      {children}
    </Box>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<UserProfile>("/api/user/profile")
      .then((res) => setProfile(res.data))
      .finally(() => setLoading(false));
  }, []);

  const initials = profile ? getInitials(profile.full_name) : "";
  const joinDate = profile ? formatJoinDate(profile.created_at) : "—";

  return (
    <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      {/* Banner */}
      <Box
        style={{
          position: "relative",
          height: rem(180),
          background: `linear-gradient(135deg, ${INK} 0%, #1E2A4A 60%, #252060 100%)`,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {[
          { size: 280, top: -80, right: 320, opacity: 0.07 },
          { size: 200, top: -40, right: 160, opacity: 0.06 },
          { size: 380, top: -140, right: 80, opacity: 0.05 },
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
        <Box
          style={{
            position: "absolute",
            top: rem(16),
            right: rem(24),
            width: rem(32),
            height: rem(32),
            borderRadius: rem(8),
            backgroundColor: "rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <IconPencil size={14} stroke={1.5} color="rgba(255,255,255,0.7)" />
        </Box>
      </Box>

      {/* Padded content */}
      <Box px={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
        {/* Avatar + Name row */}
        <Group
          justify="space-between"
          align="flex-end"
          style={{ marginTop: rem(-52) }}
          wrap="nowrap"
        >
          <Avatar
            size={130}
            radius="xl"
            style={{
              backgroundColor: PRIMARY,
              border: `4px solid white`,
              fontSize: rem(26),
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
            }}
          >
            {loading ? "" : initials}
          </Avatar>

          <Box pb={4} style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <Skeleton height={20} width={160} mb={8} />
            ) : (
              <Group gap={8} mb={4} align="center">
                <Text fw={700} size="xl" c={INK}>{profile?.full_name}</Text>
                <Badge size="sm" color="dark" variant="filled" radius="sm">PRO</Badge>
              </Group>
            )}
            <Group gap="lg">
              {loading ? (
                <Skeleton height={14} width={220} />
              ) : (
                <>
                  {profile?.current_school && (
                    <Group gap={5}>
                      <IconSchool size={14} stroke={1.5} color="#667080" />
                      <Text size="xs" c="dimmed">{profile.current_school}</Text>
                    </Group>
                  )}
                  {profile?.province && (
                    <Group gap={5}>
                      <IconMapPin size={14} stroke={1.5} color="#667080" />
                      <Text size="xs" c="dimmed">{profile.province}</Text>
                    </Group>
                  )}
                </>
              )}
            </Group>
          </Box>
        </Group>

        {/* Stats Row */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} mt="xl" mb="md">
          <StatCard icon={IconBolt} iconBg={CREAM} iconColor={PRIMARY} label="Longest Streak" value="21 days" />
          <StatCard icon={IconTrophy} iconBg="#EEF0FF" iconColor={INDIGO} label="Current Rank" value="#14 Global" />
          <StatCard
            icon={IconCalendarEvent}
            iconBg="#E6F9F5"
            iconColor="#0D9488"
            label="Joined At"
            value={loading ? "—" : joinDate}
          />
        </SimpleGrid>

        {/* Content Area */}
        <Group align="flex-start" gap="md" wrap="nowrap" mb="xl">
          {/* Left column */}
          <Stack style={{ flex: 1, minWidth: 0 }} gap="md">
            {/* Personal Information */}
            <SectionCard>
              <Group justify="space-between" mb="lg">
                <Text fw={700} size="sm" c={INK}>Personal Information</Text>
                <Button leftSection={<IconPencil size={13} stroke={1.5} />} size="xs" variant="default">
                  Edit
                </Button>
              </Group>
              {loading ? (
                <Stack gap="md">
                  <Skeleton height={56} radius="sm" />
                  <Skeleton height={56} radius="sm" />
                </Stack>
              ) : (
                <SimpleGrid cols={2} spacing="md">
                  <ReadonlyField label="Full Name" value={profile?.full_name ?? ""} />
                  <ReadonlyField label="Email" value={profile?.email ?? ""} />
                  <ReadonlyField label="Current School" value={profile?.current_school ?? ""} />
                  <ReadonlyField label="Province" value={profile?.province ?? ""} />
                </SimpleGrid>
              )}
            </SectionCard>

            {/* Change Password */}
            <SectionCard>
              <Group gap="sm" mb="lg">
                <Box
                  style={{
                    width: rem(32),
                    height: rem(32),
                    borderRadius: rem(8),
                    backgroundColor: SURFACE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconLock size={16} stroke={1.5} color="#667080" />
                </Box>
                <Text fw={700} size="sm" c={INK}>Change Password</Text>
              </Group>

              <Stack gap="md">
                <Box>
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.06em" }} mb={6}>
                    Current Password
                  </Text>
                  <PasswordInput placeholder="Enter current password" />
                </Box>
                <SimpleGrid cols={2} spacing="md">
                  <Box>
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.06em" }} mb={6}>
                      New Password
                    </Text>
                    <PasswordInput placeholder="Enter new password" />
                  </Box>
                  <Box>
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.06em" }} mb={6}>
                      Confirm Password
                    </Text>
                    <PasswordInput placeholder="Confirm new password" />
                  </Box>
                </SimpleGrid>
                <Group justify="flex-end">
                  <Button size="sm" style={{ backgroundColor: INK, color: "white", fontWeight: 600 }}>
                    Update Password
                  </Button>
                </Group>
              </Stack>
            </SectionCard>
          </Stack>

          {/* Right panel */}
          <Box visibleFrom="lg" style={{ width: rem(280), flexShrink: 0 }}>
            <Stack gap="md">
              {/* Dream University */}
              <SectionCard>
                <Group justify="space-between" mb="md">
                  <Group gap={8}>
                    <IconSchool size={16} stroke={1.5} color={PRIMARY} />
                    <Text fw={700} size="sm" c={INK}>Dream University</Text>
                  </Group>
                  <Box style={{ cursor: "pointer" }}>
                    <IconPencil size={14} stroke={1.5} color="#667080" />
                  </Box>
                </Group>
                {loading ? (
                  <Skeleton height={36} radius="sm" mb="sm" />
                ) : (
                  <Box px="sm" py="xs" mb="sm" style={{ backgroundColor: SURFACE, borderRadius: rem(8) }}>
                    <Text size="sm" c={profile?.dream_university ? INK : "dimmed"} fw={profile?.dream_university ? 500 : 400}>
                      {profile?.dream_university ?? "Not set"}
                    </Text>
                  </Box>
                )}
                <Text size="xs" c="dimmed" lh={1.5}>
                  Your target institution guides your preparation path.
                </Text>
              </SectionCard>

              {/* Target Major */}
              <SectionCard>
                <Group justify="space-between" mb="md">
                  <Group gap={8}>
                    <IconTarget size={16} stroke={1.5} color={INDIGO} />
                    <Text fw={700} size="sm" c={INK}>Target Major</Text>
                  </Group>
                  <Box style={{ cursor: "pointer" }}>
                    <IconPencil size={14} stroke={1.5} color="#667080" />
                  </Box>
                </Group>
                {loading ? (
                  <Skeleton height={36} radius="sm" />
                ) : (
                  <Box px="sm" py="xs" style={{ backgroundColor: SURFACE, borderRadius: rem(8) }}>
                    <Text size="sm" c={profile?.target_major ? INK : "dimmed"} fw={profile?.target_major ? 500 : 400}>
                      {profile?.target_major ?? "Not set"}
                    </Text>
                  </Box>
                )}
              </SectionCard>

              {/* Subscription */}
              <Box p="lg" style={{ backgroundColor: INK, borderRadius: rem(14) }}>
                <Group justify="space-between" mb="md">
                  <Text fw={700} size="sm" c="white">Subscription</Text>
                  <Badge size="sm" style={{ backgroundColor: PRIMARY, color: "white" }} radius="sm">PRO</Badge>
                </Group>
                <Stack gap={8} mb="md">
                  <Group justify="space-between">
                    <Text size="xs" c="rgba(255,255,255,0.5)">Status</Text>
                    <Group gap={5}>
                      <Box style={{ width: rem(7), height: rem(7), borderRadius: "50%", backgroundColor: "#22C55E" }} />
                      <Text size="xs" fw={600} c="#22C55E">Active</Text>
                    </Group>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="rgba(255,255,255,0.5)">Expires</Text>
                    <Text size="xs" fw={600} c="white">Aug 13, 2026</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="rgba(255,255,255,0.5)">Days remaining</Text>
                    <Text size="xs" fw={700} c={PRIMARY}>23 days</Text>
                  </Group>
                </Stack>
                <Button
                  fullWidth
                  size="sm"
                  style={{ backgroundColor: PRIMARY, color: "white", fontWeight: 600, borderRadius: rem(8) }}
                >
                  Manage Subscription
                </Button>
              </Box>
            </Stack>
          </Box>
        </Group>
      </Box>
    </Box>
  );
}
