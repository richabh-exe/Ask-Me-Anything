import type { Metadata } from "next";
import { ClaimLink } from "@/components/landing/ClaimLink";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PledgeSection } from "@/components/landing/PledgeSection";
import { StoryShowcase } from "@/components/landing/StoryShowcase";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { pageMetadata } from "@/lib/metadata";
import { BRAND } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  absoluteTitle: `${BRAND.name}: ${BRAND.tagline.toLowerCase()}`,
  description: BRAND.description,
  path: "/",
  languages: { en: "/", hi: "/hi" },
});

export default function Home() {
  return (
    <>
      <main id="main" className="flex-1">
        <Hero />
        <HowItWorks />
        <StoryShowcase />
        <PledgeSection />
        <ClaimLink />
      </main>
      <SiteFooter />
    </>
  );
}
