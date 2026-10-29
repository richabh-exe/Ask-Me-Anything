import { EN_PAGES } from "./en";
import { HI_PAGES } from "./hi";
import type { ContentPage, Locale, Section } from "./types";

export type { Block, ContentPage, Locale, Section } from "./types";

export const PAGES: ContentPage[] = [...EN_PAGES, ...HI_PAGES];

export const SECTION_LABELS: Record<Section, { en: string; hi: string }> = {
  alternatives: { en: "Alternatives", hi: "विकल्प" },
  guides: { en: "Guides", hi: "गाइड" },
  "use-cases": { en: "Use cases", hi: "इस्तेमाल" },
  ideas: { en: "Ideas", hi: "आइडिया" },
};

export function pagePath(page: Pick<ContentPage, "section" | "slug" | "locale">): string {
  return `${page.locale === "hi" ? "/hi" : ""}/${page.section}/${page.slug}`;
}

export function getPage(section: Section, slug: string, locale: Locale = "en"): ContentPage | undefined {
  return PAGES.find((p) => p.section === section && p.slug === slug && p.locale === locale);
}

export function pageByPath(path: string): ContentPage | undefined {
  return PAGES.find((p) => pagePath(p) === path);
}

export function pagesIn(section: Section, locale: Locale = "en"): ContentPage[] {
  return PAGES.filter((p) => p.section === section && p.locale === locale);
}

/** hreflang map for a page that has a translation, keyed by language. */
export function languagesFor(page: ContentPage): Record<string, string> | undefined {
  if (!page.translation) return undefined;
  const self = pagePath(page);
  return page.locale === "en" ? { en: self, hi: page.translation } : { en: page.translation, hi: self };
}

/** Rough reading time for the byline. */
export function readingMinutes(page: ContentPage): number {
  const text = [page.lede, ...page.body.map((b) => JSON.stringify(b)), ...(page.faq ?? []).map((f) => f.q + f.a)].join(" ");
  return Math.max(2, Math.round(text.split(/\s+/).length / 220));
}
