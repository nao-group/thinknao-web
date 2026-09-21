"use client";

import { ActionIcon, Menu, Tooltip } from "@mantine/core";
import { useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { IconMoon, IconSun } from "@tabler/icons-react";

function useThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme("light");
  const mounted = useMounted();
  // Keep the server and first client render identical. The persisted color
  // scheme is reflected after mount, avoiding a hydration mismatch.
  const isDark = mounted && colorScheme === "dark";

  return {
    isDark,
    label: isDark ? "Switch to light mode" : "Switch to dark mode",
    toggle: () => setColorScheme(isDark ? "light" : "dark"),
  };
}

export function ColorSchemeToggle({ className }: { className?: string }) {
  const { isDark, label, toggle } = useThemeToggle();
  const Icon = isDark ? IconSun : IconMoon;

  return (
    <Tooltip label={label} withArrow>
      <ActionIcon
        className={className}
        variant="subtle"
        size="lg"
        radius="xl"
        aria-label={label}
        onClick={toggle}
      >
        <Icon size={19} stroke={1.8} />
      </ActionIcon>
    </Tooltip>
  );
}

export function ColorSchemeMenuItem() {
  const { isDark, label, toggle } = useThemeToggle();
  const Icon = isDark ? IconSun : IconMoon;

  return (
    <Menu.Item leftSection={<Icon size={15} stroke={1.5} />} onClick={toggle}>
      {label}
    </Menu.Item>
  );
}
