import { createTheme, rem } from "@mantine/core";

export const theme = createTheme({
  fontFamily: "var(--font-poppins), sans-serif",
  headings: {
    fontFamily: "var(--font-poppins), sans-serif",
    fontWeight: "700",
  },
  primaryColor: "gold",
  colors: {
    gold: [
      "#FFFDF0",
      "#FFF8D9",
      "#FDEDB8",
      "#FAE090",
      "#F4C858",
      "#D4A017",
      "#A87F12",
      "#7E5E0D",
      "#543E08",
      "#2A1E03",
    ],
  },
  defaultRadius: "sm",
  radius: {
    xs: rem(6),
    sm: rem(10),
    md: rem(14),
    lg: rem(24),
    xl: rem(32),
  },
  components: {
    Input: {
      styles: {
        input: {
          fontFamily: "var(--font-poppins), sans-serif",
        },
      },
    },
    Button: {
      styles: {
        root: {
          fontFamily: "var(--font-poppins), sans-serif",
        },
      },
    },
  },
});
