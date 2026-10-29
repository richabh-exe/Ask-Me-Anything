import { serverOrigin } from "./site";

/*
 * Search and sharing rules in one place: the brand facts Google reads, the
 * indexing gate from PRD §12, and a safe JSON-LD serialiser.
 */

export const BRAND = {
  name: "Poocho",
  tagline: "Get asked anything, only by real people",
  description:
    "Share one link on your story. People ask anonymously, Poocho filters cruel questions before you see them, and your answers become story cards. No fake questions, ever.",
  /** Ballpoint blue, the theme colour and the share-image field. */
  color: "#2940D9",
} as const;

/*
 * The brand's own profiles, listed as `sameAs` so Google can tie them to the
 * site and show a brand panel. Add each one once it exists, with the same
 * name, logo and link everywhere (playbook: Getting listed, step 5).
 */
export const SOCIAL_PROFILES: string[] = [];

/** An absolute URL on the canonical origin, for sitemaps, JSON-LD and pings. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, `${serverOrigin()}/`).toString();
}

/*
 * PRD §12.4, the indexing gate. An answer counts towards indexing only when the
 * host made it public, its question passed moderation, and it says something
 * (about two sentences). A profile is indexed once it has three such answers,
 * the account is a week old and the inbox isn't paused. Everything else is
 * noindex,follow and stays out of the sitemap.
 */
export const INDEXING = {
  minAnswerChars: 120,
  minAnswers: 3,
  minAccountAgeMs: 7 * 24 * 60 * 60 * 1000,
} as const;

export interface IndexingFacts {
  createdAt: number;
  paused: boolean;
  /** Public, moderation-clean answers of at least INDEXING.minAnswerChars. */
  substantiveAnswers: number;
}

export function isProfileIndexable(facts: IndexingFacts, now = Date.now()): boolean {
  return !facts.paused && facts.substantiveAnswers >= INDEXING.minAnswers && now - facts.createdAt >= INDEXING.minAccountAgeMs;
}

/** JSON-LD for a <script> tag. Escaping `<` keeps user text from closing the tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Organization + WebSite, rendered once in the root layout. */
export function siteGraph() {
  const url = absoluteUrl("/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}#organization`,
        name: BRAND.name,
        url,
        logo: absoluteUrl("/brand/logo.png"),
        ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${url}#website`,
        name: BRAND.name,
        url,
        inLanguage: ["en", "hi"],
        publisher: { "@id": `${url}#organization` },
      },
    ],
  };
}
