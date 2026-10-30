import type { Metadata } from "next";
import { BRAND } from "./seo";

interface PageMeta {
  /** Shown as "<title> | Poocho". Pass `absoluteTitle` to skip the suffix. */
  title?: string;
  absoluteTitle?: string;
  description: string;
  /** The page's own path, used as its canonical. */
  path: string;
  locale?: "en" | "hi";
  /** hreflang alternates, e.g. { en: "/", hi: "/hi" }. */
  languages?: Record<string, string>;
  type?: "website" | "article";
  published?: string;
  modified?: string;
  noindex?: boolean;
  /** A prebuilt share image, for pages without an opengraph-image route (the Hindi ones). */
  image?: { url: string; alt: string };
}

/*
 * Every indexable page gets a self-canonical, matching Open Graph and a large
 * Twitter card. Next merges `openGraph` shallowly, so each page passes the
 * whole object here rather than relying on the layout's defaults.
 */
export function pageMetadata(meta: PageMeta): Metadata {
  const full = meta.absoluteTitle ?? `${meta.title} | ${BRAND.name}`;
  return {
    ...(meta.absoluteTitle ? { title: { absolute: meta.absoluteTitle } } : { title: meta.title }),
    description: meta.description,
    alternates: {
      canonical: meta.path,
      ...(meta.languages ? { languages: { ...meta.languages, "x-default": meta.languages.en ?? meta.path } } : {}),
    },
    openGraph: {
      title: full,
      description: meta.description,
      url: meta.path,
      siteName: BRAND.name,
      locale: meta.locale === "hi" ? "hi_IN" : "en_IN",
      type: meta.type ?? "website",
      ...(meta.type === "article" ? { publishedTime: meta.published, modifiedTime: meta.modified, authors: ["Team Poocho"] } : {}),
      ...(meta.image ? { images: [{ ...meta.image, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: full,
      description: meta.description,
      ...(meta.image ? { images: [meta.image] } : {}),
    },
    ...(meta.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
