import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteNav } from "@/components/ui/SiteNav";
import { type Block, type ContentPage, pageByPath, pagePath, readingMinutes } from "@/lib/content";
import { LocaleScope } from "@/lib/i18n";
import { absoluteUrl, BRAND, jsonLd } from "@/lib/seo";
import { plainText, RichText } from "./RichText";

const CHROME = {
  en: {
    home: "Poocho",
    hub: "Guides",
    by: "Team Poocho",
    updated: "Updated",
    minutes: "min read",
    faq: "Questions people ask",
    more: "Keep reading",
    sources: "Sources",
    read: "Read",
    other: "हिंदी में पढ़िए",
    usePrompt: "Use this prompt",
    poocho: "Poocho",
  },
  hi: {
    home: "Poocho",
    hub: "गाइड",
    by: "टीम Poocho",
    updated: "अपडेट",
    minutes: "मिनट",
    faq: "अक्सर पूछे जाने वाले सवाल",
    more: "आगे पढ़िए",
    sources: "स्रोत",
    read: "पढ़िए",
    other: "Read in English",
    usePrompt: "यह प्रॉम्प्ट लगाइए",
    poocho: "Poocho",
  },
} as const;

type Chrome = (typeof CHROME)[keyof typeof CHROME];

/*
 * One template for every guide, comparison and use case. The page sits on the
 * blue desk like the pledge: a headline on the desk, then a torn notebook page
 * with the red margin. Everything is server-rendered, so search engines and
 * link previews read the full text without running JavaScript.
 */
export function GuidePage({ page }: { page: ContentPage }) {
  const c = CHROME[page.locale];
  const path = pagePath(page);
  const date = new Date(page.updated);
  const dateLabel = date.toLocaleDateString(page.locale === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" });
  const related = page.related.map(pageByPath).filter((p): p is ContentPage => Boolean(p));

  const content = (
    <>
      <main id="main" className="flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleGraph(page, path, c)) }} />
        <section className="desk pb-24 text-white">
          <SiteNav tone="ink" />
          <header className="mx-auto max-w-[860px] px-4 pt-6 sm:px-8 md:pt-12">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-x-2 text-[0.95rem] text-white/75">
                <li>
                  <Link href={page.locale === "hi" ? "/hi" : "/"} className="underline-offset-4 hover:underline">
                    {c.home}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/guides" className="underline-offset-4 hover:underline">
                    {c.hub}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-white">
                  {page.eyebrow}
                </li>
              </ol>
            </nav>
            <p className="mt-8 inline-block -rotate-2 rounded-[3px] bg-haldi px-3 pt-1 pb-0.5 font-hand text-[1.2rem] font-bold text-navy shadow-[0_3px_0_var(--color-navy)]">
              {page.eyebrow}
            </p>
            <h1
              className={`mt-5 font-extrabold tracking-[-0.03em] stretch-wide ${
                page.locale === "hi" ? "text-[clamp(2.1rem,5.4vw,3.7rem)] leading-[1.15]" : "text-[clamp(2.3rem,6.2vw,4.3rem)] leading-[0.98]"
              }`}
            >
              {page.title}
            </h1>
            <p className="mt-6 max-w-[58ch] text-[1.18rem] leading-relaxed text-white/88 md:text-[1.25rem]">{page.lede}</p>
            <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.95rem] text-white/70">
              <span className="font-hand text-[1.15rem] font-bold text-white">{c.by}</span>
              <span aria-hidden="true">·</span>
              <span>
                {c.updated} <time dateTime={page.updated}>{dateLabel}</time>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {readingMinutes(page)} {c.minutes}
              </span>
              {page.translation && (
                <>
                  <span aria-hidden="true">·</span>
                  <Link
                    href={page.translation}
                    hrefLang={page.locale === "en" ? "hi" : "en"}
                    lang={page.locale === "en" ? "hi" : "en"}
                    className="font-semibold text-white underline decoration-haldi decoration-2 underline-offset-4"
                  >
                    {c.other}
                  </Link>
                </>
              )}
            </p>
          </header>

          <div className="mx-auto mt-12 max-w-[860px] px-4 sm:px-8">
            <div className="paper-shadow">
              <article className="torn margin-line on-paper rounded-[4px] bg-white px-6 pt-12 pb-12 text-navy [--margin-x:1.8rem] sm:px-12 sm:[--margin-x:3rem]">
                <div className="pl-6 sm:pl-8">
                  {page.body.map((block, i) => (
                    <BlockView key={i} block={block} chrome={c} first={i === 0} />
                  ))}

                  {page.faq && page.faq.length > 0 && (
                    <section aria-labelledby="faq" className="mt-16">
                      <h2 id="faq" className="scroll-mt-8 text-[1.75rem] font-extrabold tracking-[-0.02em] stretch-wide">
                        {c.faq}
                      </h2>
                      <div className="mt-4 border-t-2 border-navy">
                        {page.faq.map((item) => (
                          <details key={item.q} className="group border-b border-rule">
                            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 text-[1.12rem] font-bold [&::-webkit-details-marker]:hidden">
                              {item.q}
                              <span
                                aria-hidden="true"
                                className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-navy text-[1.1rem] leading-none transition-transform duration-200 group-open:rotate-45"
                              >
                                +
                              </span>
                            </summary>
                            <p className="max-w-[62ch] pb-5 leading-relaxed text-navy-soft">
                              <RichText text={item.a} />
                            </p>
                          </details>
                        ))}
                      </div>
                    </section>
                  )}

                  {page.sources && page.sources.length > 0 && (
                    <section aria-labelledby="sources" className="mt-14">
                      <h2 id="sources" className="text-[1rem] font-bold tracking-wide text-navy-soft uppercase">
                        {c.sources}
                      </h2>
                      <ol className="mt-3 grid list-decimal gap-2 pl-5 text-[0.95rem] text-navy-soft marker:text-navy-soft">
                        {page.sources.map((s) => (
                          <li key={s.href}>
                            <a href={s.href} rel="noopener" className="underline underline-offset-4 hover:text-ink">
                              {s.label}
                            </a>
                          </li>
                        ))}
                      </ol>
                    </section>
                  )}
                </div>
              </article>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section aria-labelledby="more" className="on-paper bg-paper py-16 md:py-20">
            <div className="mx-auto max-w-[1100px] px-4 sm:px-8">
              <h2 id="more" className="text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-[-0.03em] stretch-wide">
                {c.more}
              </h2>
              <ul className="mt-8 grid gap-5 md:grid-cols-3">
                {related.map((r, i) => (
                  <li key={pagePath(r)} className={i % 2 ? "md:translate-y-3" : ""}>
                    <Link
                      href={pagePath(r)}
                      className="group block h-full rounded-[4px] border-2 border-navy bg-white p-6 shadow-[0_4px_0_var(--color-navy)] transition-transform duration-150 hover:-translate-y-1"
                    >
                      <span className="font-hand text-[1.05rem] font-bold text-margin-deep">{r.eyebrow}</span>
                      <span className="mt-2 block text-[1.3rem] leading-tight font-bold stretch-semi">{r.title}</span>
                      <span className="mt-4 inline-flex items-center gap-1 font-semibold text-ink">
                        {c.read}
                        <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );

  return page.translation ? (
    <LocaleScope locale={page.locale} alternate={page.translation}>
      {content}
    </LocaleScope>
  ) : page.locale === "hi" ? (
    <LocaleScope locale="hi" alternate="/">
      {content}
    </LocaleScope>
  ) : (
    content
  );
}

/* ── blocks ─────────────────────────────────────────────────────────── */

const CHIT_TILT = ["-rotate-[1.4deg]", "rotate-[1deg]", "-rotate-[0.5deg]", "rotate-[1.6deg]", "-rotate-[1deg]", "rotate-[0.6deg]"];

const NOTE_TONES = {
  haldi: "border-haldi bg-haldi-soft",
  margin: "border-margin bg-[#fdebee]",
  leaf: "border-leaf bg-[#e4f4ec]",
} as const;

function BlockView({ block, chrome, first }: { block: Block; chrome: Chrome; first: boolean }) {
  switch (block.kind) {
    case "p":
      return (
        <p className="mt-5 max-w-[64ch] leading-relaxed">
          <RichText text={block.text} />
        </p>
      );
    case "h2":
      return (
        <h2
          id={block.id}
          className={`${first ? "" : "mt-14"} scroll-mt-8 text-[clamp(1.55rem,3.4vw,1.95rem)] font-extrabold tracking-[-0.02em] stretch-wide`}
        >
          {block.text}
        </h2>
      );
    case "h3":
      return <h3 className="mt-8 text-[1.3rem] font-bold stretch-semi">{block.text}</h3>;
    case "list": {
      const items = block.items.map((item, i) => (
        <li key={item} className={block.ordered ? "grid grid-cols-[2.2rem_1fr] gap-2" : ""}>
          {block.ordered && (
            <span aria-hidden="true" className="font-hand text-[1.5rem] leading-[1.1] font-bold text-ink">
              {i + 1}
            </span>
          )}
          <span>
            <RichText text={item} />
          </span>
        </li>
      ));
      return block.ordered ? (
        <ol className="mt-5 grid max-w-[64ch] gap-4 leading-relaxed">{items}</ol>
      ) : (
        <ul className="mt-5 grid max-w-[64ch] list-disc gap-3 pl-5 leading-relaxed marker:text-margin">{items}</ul>
      );
    }
    case "steps":
      return (
        <ol className="mt-7 grid max-w-[64ch] gap-7">
          {block.items.map((step, i) => (
            <li key={step.title} className="grid grid-cols-[2.6rem_1fr] gap-3">
              <span aria-hidden="true" className="font-hand text-[2.1rem] leading-none font-bold text-ink">
                {i + 1}
              </span>
              <div>
                <h3 className="text-[1.22rem] leading-tight font-bold stretch-semi">{step.title}</h3>
                <p className="mt-1.5 leading-relaxed">
                  <RichText text={step.body} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <>
          {/* Phones get one card per row instead of a table that scrolls sideways. */}
          <div className="mt-7 sm:hidden">
            <p className="text-[0.95rem] text-navy-soft">{block.caption}</p>
            <dl className="mt-3 grid gap-4">
              {block.rows.map((row) => (
                <div key={row[0]} className="rounded-[6px] border-2 border-rule p-4">
                  <dt className="font-bold">{row[0]}</dt>
                  {row.slice(1).map((cell, i) => (
                    <dd key={i} className={`mt-2.5 rounded-[4px] ${i + 1 === block.ours ? "bg-haldi-soft px-3 py-2 font-medium" : "text-navy-soft"}`}>
                      <span className="block text-[0.78rem] font-bold tracking-wide text-navy uppercase">{block.head[i + 1]}</span>
                      <RichText text={cell} />
                    </dd>
                  ))}
                </div>
              ))}
            </dl>
          </div>
          <TableView block={block} />
        </>
      );
    case "note":
      return (
        <aside className={`mt-8 max-w-[64ch] rounded-[4px] border-l-[6px] px-5 py-4 ${NOTE_TONES[block.tone]}`}>
          <p className="font-bold">{block.title}</p>
          <p className="mt-1 leading-relaxed">
            <RichText text={block.text} />
          </p>
        </aside>
      );
    case "chits":
      return <ChitList items={block.items} chrome={chrome} />;
    case "cta":
      return (
        <div className="desk mt-14 -ml-6 rounded-[20px] px-6 py-8 text-white sm:-ml-8 sm:px-10 sm:py-10">
          <p className="text-[clamp(1.6rem,4vw,2.3rem)] leading-[1.05] font-extrabold tracking-[-0.02em] stretch-wide">{block.title}</p>
          <p className="mt-3 max-w-[48ch] text-[1.08rem] text-white/88">{block.text}</p>
          <ButtonLink href="/start" variant="haldi" size="lg" className="mt-6">
            {block.button}
          </ButtonLink>
        </div>
      );
  }
}

function TableView({ block }: { block: Extract<Block, { kind: "table" }> }) {
  return (
    <div className="mt-7 hidden sm:block">
      <table className="w-full border-collapse text-left text-[0.98rem]">
        <caption className="pb-3 text-left text-[0.95rem] text-navy-soft">{block.caption}</caption>
        <thead>
          <tr className="border-b-2 border-navy">
            {block.head.map((h, i) => (
              <th
                key={i}
                scope="col"
                className={`px-3 py-2.5 align-bottom font-bold first:pl-0 ${i === block.ours ? "rounded-t-[6px] bg-haldi text-navy" : ""}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row[0]} className="border-b border-rule">
              {row.map((cell, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="py-3 pr-3 align-top font-semibold">
                    {cell}
                  </th>
                ) : (
                  <td key={i} className={`px-3 py-3 align-top ${i === block.ours ? "bg-haldi-soft font-medium" : "text-navy-soft"}`}>
                    <RichText text={cell} />
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Prompt ideas as torn chits. Tapping one opens onboarding with it filled in. */
function ChitList({ items, chrome }: { items: string[]; chrome: Chrome }) {
  return (
    <ul className="mt-6 grid gap-x-4 gap-y-5 sm:grid-cols-2">
      {items.map((prompt, i) => (
        <li key={prompt} className={CHIT_TILT[i % CHIT_TILT.length]}>
          <Link
            href={`/start?prompt=${encodeURIComponent(prompt)}`}
            aria-label={`${chrome.usePrompt}: ${prompt}`}
            className="group ruled relative block rounded-[3px] border border-rule bg-white px-4 pt-3 pb-2 shadow-paper transition-transform duration-150 [--line:1.9rem] hover:-translate-y-0.5 hover:rotate-0 focus-visible:rotate-0"
          >
            <span className="block font-hand text-[1.2rem] leading-[1.9rem] text-ink">{prompt}</span>
            <span className="mt-1 block text-right text-[0.82rem] font-semibold text-navy-soft opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 pointer-coarse:opacity-100">
              {chrome.usePrompt} →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ── structured data ────────────────────────────────────────────────── */

function articleGraph(page: ContentPage, path: string, c: Chrome) {
  const url = absoluteUrl(path);
  const home = absoluteUrl("/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: page.title,
        description: plainText(page.description),
        inLanguage: page.locale,
        datePublished: page.published,
        dateModified: page.updated,
        url,
        mainEntityOfPage: url,
        author: { "@type": "Organization", name: BRAND.name, url: home },
        publisher: { "@id": `${home}#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: c.home, item: page.locale === "hi" ? absoluteUrl("/hi") : home },
          { "@type": "ListItem", position: 2, name: c.hub, item: absoluteUrl("/guides") },
          { "@type": "ListItem", position: 3, name: page.eyebrow, item: url },
        ],
      },
    ],
  };
}
