"use client";

import Image from "next/image";
import { Box, Stack, Text, type BoxProps } from "@mantine/core";

export interface EmptyStateProps extends BoxProps {
  title: string;
  description?: string;
  compact?: boolean;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, compact = false, action, className, ...props }: EmptyStateProps) {
  return (
    <Box
      {...props}
      className={["global-empty-state", compact ? "global-empty-state--compact" : "", className]
        .filter(Boolean)
        .join(" ")}
      role="status"
    >
      <Image
        src="/images/empty-state/empty-list-transparent.png"
        alt=""
        aria-hidden="true"
        width={1536}
        height={1024}
        className="global-empty-state__illustration"
      />
      <Stack gap={4} align="center">
        <Text className="global-empty-state__title">{title}</Text>
        {description && <Text className="global-empty-state__description">{description}</Text>}
        {action && <Box mt={10}>{action}</Box>}
      </Stack>
    </Box>
  );
}
