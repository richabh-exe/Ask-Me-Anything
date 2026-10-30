import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteNav } from "@/components/ui/SiteNav";
import { type ContentPage, pagePath, PAGES, SECTION_LABELS, type Section } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Guides: anonymous questions, done honestly",
  description:
    "How to get anonymous questions on your Instagram story, how Poocho compares with NGL, Tellonym and CuriousCat, safety checks, and 100 story prompts.",
  path: "/guides",
});

const ORDER: Section[] = ["guides", "alternatives", "ideas", "use-cases"];

/** The hub every guide links back to, so each one is two clicks from the homepage. */
export default function GuidesHub() {
  const english = PAGES.filter((p) => p.locale === "en");
  const hindi = PAGES.filter((p) => p.locale === "hi");

  return (
    <>
      <main id="main" className="flex-1">
        <section className="desk pb-20 text-white">
          <SiteNav tone="ink" />
          <header className="mx-auto max-w-[1100px] px-4 pt-6 sm:px-8 md:pt-12">
            <p className="inline-block -rotate-2 rounded-[3px] bg-haldi px-3 pt-1 pb-0.5 font-hand text-[1.2rem] font-bold text-navy shadow-[0_3px_0_var(--color-navy)]">
              Guides
            </p>
            <h1 className="mt-5 max-w-[18ch] text-[clamp(2.4rem,6.4vw,4.6rem)] leading-[0.96] font-extrabold tracking-[-0.03em] stretch-wide">
              Anonymous questions, done honestly
            </h1>
            <p className="mt-6 max-w-[54ch] text-[1.2rem] leading-relaxed text-white/88">
              Setup guides, fair comparisons with the apps you already know, and prompts that get people asking.
            </p>
          </header>
        </section>

        <div className="on-paper bg-paper pb-20">
          <div className="mx-auto -mt-10 grid max-w-[1100px] gap-14 px-4 sm:px-8">
            {ORDER.map((section) => {
              const pages = english.filter((p) => p.section === section);
              if (!pages.length) return null;
              return (
                <section key={section} aria-labelledby={`hub-${section}`}>
                  <h2 id={`hub-${section}`} className="sr-only">
                    {SECTION_LABELS[section].en}
                  </h2>
                  <CardGrid pages={pages} />
                </section>
              );
            })}

            <section aria-labelledby="hub-hindi" lang="hi">
              <h2 id="hub-hindi" className="text-[clamp(1.7rem,4vw,2.4rem)] font-extrabold tracking-[-0.02em] stretch-wide">
                हिंदी में पढ़िए
              </h2>
              <div className="mt-6">
                <CardGrid pages={hindi} />
              </div>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function CardGrid({ pages }: { pages: ContentPage[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {pages.map((page) => (
        <li key={pagePath(page)}>
          <Link
            href={pagePath(page)}
            className="group flex h-full flex-col rounded-[4px] border-2 border-navy bg-white p-6 shadow-[0_4px_0_var(--color-navy)] transition-transform duration-150 hover:-translate-y-1"
          >
            <span className="font-hand text-[1.05rem] font-bold text-margin-deep">{page.eyebrow}</span>
            <span className="mt-2 text-[1.3rem] leading-tight font-bold text-navy stretch-semi">{page.title}</span>
            <span className="mt-3 flex-1 text-[0.98rem] leading-relaxed text-navy-soft">{page.description}</span>
            <span aria-hidden="true" className="mt-4 font-semibold text-ink transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
