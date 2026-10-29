/*
 * Guides, comparisons and use cases (playbook: Content SEO). Each page is
 * plain data so the sitemap, share images, JSON-LD and internal links all read
 * from one source. Inline text supports **bold** and [label](/path) links.
 */

export type Locale = "en" | "hi";
export type Section = "alternatives" | "guides" | "use-cases" | "ideas";

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string; id: string }
  | { kind: "h3"; text: string }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "steps"; items: { title: string; body: string }[] }
  /** A comparison table. `ours` is the column index to highlight as Poocho. */
  | { kind: "table"; caption: string; head: string[]; rows: string[][]; ours?: number }
  | { kind: "note"; tone: "haldi" | "margin" | "leaf"; title: string; text: string }
  /** Prompt chits. Each links to onboarding with the prompt filled in. */
  | { kind: "chits"; items: string[] }
  | { kind: "cta"; title: string; text: string; button: string };

export interface ContentPage {
  section: Section;
  slug: string;
  locale: Locale;
  /** Small label above the title, e.g. "NGL alternative". */
  eyebrow: string;
  /** The H1. */
  title: string;
  /** The <title>, before " | Poocho". Keep it under ~55 characters. */
  seoTitle: string;
  /** Meta description, 140–160 characters. */
  description: string;
  published: string;
  updated: string;
  lede: string;
  body: Block[];
  faq?: { q: string; a: string }[];
  /** Paths of related pages, shown at the end. */
  related: string[];
  /** Path of the same page in the other language, for hreflang and the toggle. */
  translation?: string;
  sources?: { label: string; href: string }[];
}
