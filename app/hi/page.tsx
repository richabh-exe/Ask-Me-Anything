import type { Metadata } from "next";
import { ClaimLink } from "@/components/landing/ClaimLink";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PledgeSection } from "@/components/landing/PledgeSection";
import { StoryShowcase } from "@/components/landing/StoryShowcase";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { LocaleScope } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";

/*
 * The landing page in Hindi at its own URL, so Google can index it for Hindi
 * searches ("gumnaam sawal app") and pair it with / through hreflang. The
 * EN / हिं toggle here opens the English page.
 */
export const metadata: Metadata = pageMetadata({
  absoluteTitle: "Poocho: गुमनाम सवाल, सिर्फ़ असली लोगों से",
  description:
    "अपनी इंस्टाग्राम स्टोरी पर एक लिंक डालिए। लोग बिना नाम बताए सवाल पूछें, Poocho बुरे सवाल पहले ही छाँट दे, और जवाब स्टोरी कार्ड बन जाएँ। कभी कोई नकली सवाल नहीं।",
  path: "/hi",
  locale: "hi",
  languages: { en: "/", hi: "/hi" },
  image: { url: "/og/hi/home.png", alt: "Poocho: लोग कुछ भी पूछें, बस असली लोग" },
});

export default function HindiHome() {
  return (
    <LocaleScope locale="hi" alternate="/">
      <main id="main" className="flex-1">
        <Hero />
        <HowItWorks />
        <StoryShowcase />
        <PledgeSection />
        <ClaimLink />
      </main>
      <SiteFooter />
    </LocaleScope>
  );
}
