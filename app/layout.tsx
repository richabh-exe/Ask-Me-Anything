import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import "@fontsource-variable/anek-devanagari/standard.css";
import "@fontsource/kalam/400.css";
import "@fontsource/kalam/700.css";
import "./globals.css";
import { ProductAnalytics } from "@/components/analytics/ProductAnalytics";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { BRAND, jsonLd, siteGraph } from "@/lib/seo";
import { serverOrigin } from "@/lib/site";
import { Providers } from "./providers";

/*
 * Site-wide defaults. Canonicals and hreflang are set page by page (see
 * lib/metadata.ts): a canonical here would be inherited by every page that
 * forgot its own and point them all at the homepage.
 */
export const metadata: Metadata = {
  metadataBase: new URL(serverOrigin()),
  title: {
    default: `${BRAND.name}: ${BRAND.tagline.toLowerCase()}`,
    template: "%s | Poocho",
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  openGraph: {
    title: `${BRAND.name}: ${BRAND.tagline.toLowerCase()}`,
    description: "Anonymous questions from real people, filtered before you see them, answered as story cards.",
    siteName: BRAND.name,
    type: "website",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
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
        <ClerkProvider appearance={clerkAppearance}>
          <Providers>{children}</Providers>
          <ProductAnalytics />
        </ClerkProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(siteGraph()) }} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
