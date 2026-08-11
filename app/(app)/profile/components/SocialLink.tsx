"use client";

import { Anchor, Box, Group, Text, rem } from "@mantine/core";
import { INK } from "@/constants/colors";

interface SocialLinkProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  url: string | null;
}

export function SocialLink({ icon: Icon, iconColor, iconBg, label, url }: SocialLinkProps) {
  return (
    <Group gap={12} align="center">
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
      <Box style={{ minWidth: 0 }}>
        <Text size="xs" fw={600} c="dimmed">{label}</Text>
        {url ? (
          <Anchor href={url} target="_blank" size="sm" fw={600} c={INK} underline="hover" truncate style={{ display: "block", maxWidth: rem(180) }}>
            {url.replace(/^https?:\/\//, "")}
          </Anchor>
        ) : (
          <Text size="sm" c="dimmed">Not set</Text>
        )}
      </Box>
    </Group>
  );
}
