import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { connection } from "next/server";
import { languagesFor, pagePath, PAGES } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";
import { getDb } from "@/lib/server/db";
import { indexableProfiles } from "@/lib/server/repo";
import { askPath } from "@/lib/site";

/*
 * Only pages worth ranking (playbook: Technical SEO, step 2): the homepage in
 * both languages, the pledge, the guides, and ask pages that pass the PRD §12
 * indexing gate. Built per request (cached for an hour) so new profiles appear
 * without a deploy, and so the build never needs the database.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const home = { en: absoluteUrl("/"), hi: absoluteUrl("/hi") };
  const latestGuide = PAGES.map((p) => p.updated).sort().at(-1);

  const fixed: MetadataRoute.Sitemap = [
    { url: home.en, changeFrequency: "weekly", priority: 1, alternates: { languages: home } },
    { url: home.hi, changeFrequency: "weekly", priority: 0.9, alternates: { languages: home } },
    { url: absoluteUrl("/pledge"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/guides"), lastModified: latestGuide, changeFrequency: "weekly", priority: 0.7 },
  ];

  const guides: MetadataRoute.Sitemap = PAGES.map((page) => {
    const languages = languagesFor(page);
    return {
      url: absoluteUrl(pagePath(page)),
      lastModified: page.updated,
      changeFrequency: "monthly",
      priority: 0.7,
      ...(languages ? { alternates: { languages: Object.fromEntries(Object.entries(languages).map(([k, v]) => [k, absoluteUrl(v)])) } } : {}),
    };
  });

  return [...fixed, ...guides, ...(await profiles())];
}

async function profiles(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("hours");
  try {
    const rows = await indexableProfiles(getDb());
    return rows.map((p) => ({ url: absoluteUrl(askPath(p.handle)), lastModified: p.lastModified, changeFrequency: "weekly", priority: 0.5 }));
  } catch {
    // A database hiccup shouldn't take the whole sitemap down.
    return [];
  }
}
