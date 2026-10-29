import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, languagesFor, type Locale, pagePath, PAGES, type Section } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { contentImage } from "@/lib/og/render";
import { displayHost, serverOrigin } from "@/lib/site";
import { GuidePage } from "./GuidePage";

type Params = { params: Promise<{ slug: string }> };

/*
 * Each content section (/alternatives, /guides, /use-cases, /ideas and their
 * /hi twins) is a [slug] route built from this one factory, so every page
 * gets the same prerendering, metadata and share image.
 */
export function contentRoute(section: Section, locale: Locale = "en") {
  const find = async (params: Params["params"]) => getPage(section, (await params).slug, locale);

  return {
    generateStaticParams() {
      return PAGES.filter((p) => p.section === section && p.locale === locale).map((p) => ({ slug: p.slug }));
    },

    async generateMetadata({ params }: Params): Promise<Metadata> {
      const page = await find(params);
      if (!page) return {};
      return pageMetadata({
        title: page.seoTitle,
        description: page.description,
        path: pagePath(page),
        locale,
        languages: languagesFor(page),
        type: "article",
        published: page.published,
        modified: page.updated,
        // Hindi share images are prerendered in Chromium; see lib/og/render.tsx.
        ...(locale === "hi" ? { image: { url: `/og/hi/${section}-${page.slug}.png`, alt: page.title } } : {}),
      });
    },

    async Page({ params }: Params) {
      const page = await find(params);
      if (!page) notFound();
      return <GuidePage page={page} />;
    },

    async Image({ params }: Params) {
      const page = await find(params);
      return contentImage({
        eyebrow: page?.eyebrow ?? "Poocho",
        title: page?.title ?? "Get asked anything. Only by real people.",
        host: displayHost(serverOrigin()),
      });
    },
  };
}
