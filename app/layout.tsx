import type { Metadata, Viewport } from "next";
import "@fontsource-variable/anek-devanagari/standard.css";
import "@fontsource/kalam/400.css";
import "@fontsource/kalam/700.css";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://poocho.app"),
  title: {
    default: "Poocho: get asked anything, only by real people",
    template: "%s | Poocho",
  },
  description:
    "Share one link on your story. People ask anonymously, Poocho filters cruel questions before you see them, and your answers become story cards. No fake questions, ever.",
  applicationName: "Poocho",
  openGraph: {
    title: "Poocho: get asked anything, only by real people",
    description: "Anonymous questions from real people, filtered before you see them, answered as story cards.",
    siteName: "Poocho",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#2940D9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-haldi px-4 py-2 font-semibold text-navy focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
