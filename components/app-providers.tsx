"use client";

import { MantineProvider, localStorageColorSchemeManager } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { COLOR_SCHEME_STORAGE_KEY } from "@/lib/color-scheme";
import { theme } from "@/lib/theme";

const colorSchemeManager = localStorageColorSchemeManager({
  key: COLOR_SCHEME_STORAGE_KEY,
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="light"
      colorSchemeManager={colorSchemeManager}
    >
      <Notifications position="top-right" zIndex={1000} />
      {children}
    </MantineProvider>
  );
}

