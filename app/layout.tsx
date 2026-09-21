import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { mantineHtmlProps } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "katex/dist/katex.min.css";
import "./globals.css";
import { COLOR_SCHEME_STORAGE_KEY } from "@/lib/color-scheme";
import { AppProviders } from "@/components/app-providers";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ThinkNao",
  description: "Study smarter for your CSCA exam.",
};

const colorSchemeScript = `(function(){try{var value=window.localStorage.getItem(${JSON.stringify(COLOR_SCHEME_STORAGE_KEY)});var scheme=value==="dark"?"dark":"light";document.documentElement.setAttribute("data-mantine-color-scheme",scheme)}catch(error){document.documentElement.setAttribute("data-mantine-color-scheme","light")}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps} className={poppins.variable}>
      <head>
        <script
          data-mantine-script
          dangerouslySetInnerHTML={{ __html: colorSchemeScript }}
        />
      </head>
      <body suppressHydrationWarning>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
