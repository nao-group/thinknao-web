"use client";

import { Anchor, Box, Group, Text, rem } from "@mantine/core";
import { INK } from "@/constants/colors";

/**
 * Extract the display handle from a social URL.
 * Accepts full URLs or bare handles and returns `@username`.
 *
 *   "https://instagram.com/johndoe"  → "johndoe"
 *   "https://www.tiktok.com/@jane"   → "jane"
 *   "https://linkedin.com/in/alex"   → "alex"
 *   "johndoe"                        → "johndoe"
 */
export function extractSocialHandle(url: string): string {
  let cleaned = url.trim();
  // Strip protocol
  cleaned = cleaned.replace(/^https?:\/\//, "");
  // Strip www.
  cleaned = cleaned.replace(/^www\./, "");
  // Strip known domain prefixes
  cleaned = cleaned.replace(/^(?:instagram\.com|tiktok\.com|linkedin\.com)\/(?:in\/|@)?/i, "");
  // Strip leading @ if present
  cleaned = cleaned.replace(/^@/, "");
  // Strip trailing slash
  cleaned = cleaned.replace(/\/+$/, "");
  return cleaned;
}

/** Build a full profile URL from a stored value (which may be a full URL or bare handle). */
export function buildSocialUrl(value: string, baseUrl: string): string {
  const trimmed = value.trim();
  // Already a full URL — use as-is
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Bare handle — prepend base
  const handle = trimmed.replace(/^@/, "");
  return `${baseUrl}${handle}`;
}

interface SocialLinkProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  url: string | null;
  /** Base URL for building the link when value is a bare handle */
  baseUrl: string;
}

export function SocialLink({ icon: Icon, iconColor, iconBg, label, url, baseUrl }: SocialLinkProps) {
  const handle = url ? extractSocialHandle(url) : null;
  const href = url ? buildSocialUrl(url, baseUrl) : null;
  const isLinkedIn = label.toLowerCase() === "linkedin";

  return (
    <Group gap={12} align="center" wrap="nowrap">
      <Box
        style={{
          width: rem(36),
          height: rem(36),
          borderRadius: rem(9),
          backgroundColor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} stroke={1.5} color={iconColor} />
      </Box>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text size="xs" fw={600} c="dimmed">{label}</Text>
        {handle ? (
          <Anchor href={href!} target="_blank" size="sm" fw={600} c={INK} underline="hover" style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {isLinkedIn ? handle : `@${handle}`}
          </Anchor>
        ) : (
          <Text size="sm" c="dimmed">Not set</Text>
        )}
      </Box>
    </Group>
  );
}
