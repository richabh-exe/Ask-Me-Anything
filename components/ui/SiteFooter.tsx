"use client";

import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t, locale } = useI18n();
  const hi = locale === "hi" ? "/hi" : "";
  // Hindi readers get the Hindi version where one exists.
  const guides = [
    { href: `${hi}/guides/anonymous-questions-instagram-story`, label: t("footer.instagram") },
    { href: `${hi}/alternatives/ngl`, label: t("footer.ngl") },
    { href: `${hi}/guides/are-anonymous-question-apps-safe`, label: t("footer.safety") },
    { href: "/ideas/story-questions", label: t("footer.ideas") },
    { href: "/guides", label: t("footer.allGuides") },
  ];
  return (
    <footer className="on-paper border-t-2 border-navy bg-paper text-navy">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="flex items-center gap-3">
            <LogoMark className="h-12 w-12 -rotate-6" />
            <span className="stretch-wide text-[2.6rem] leading-none font-extrabold tracking-[-0.03em]">poocho</span>
          </p>
          <p className="mt-4 max-w-[34ch] font-hand text-[1.35rem] leading-snug text-ink">{t("footer.tag")}</p>
        </div>
        <div className="grid content-start gap-2 text-[1.02rem]">
          <Link className="w-fit underline-offset-4 hover:underline" href="/pledge">
            {t("footer.pledge")}
          </Link>
          <Link className="w-fit underline-offset-4 hover:underline" href="/pledge#guidelines">
            {t("footer.guidelines")}
          </Link>
          <Link className="w-fit underline-offset-4 hover:underline" href="/pledge#anonymity">
            {t("footer.privacy")}
          </Link>
          <Link className="w-fit underline-offset-4 hover:underline" href="/@demo">
            {t("nav.sample")}
          </Link>
          <p className="mt-4 text-[0.95rem] text-navy-soft">{t("footer.adult")}</p>
        </div>
        <nav aria-label={t("footer.guides")} className="grid content-start gap-2 text-[1.02rem]">
          <p className="mb-1 font-hand text-[1.2rem] font-bold text-ink">{t("footer.guides")}</p>
          {guides.map((g) => (
            <Link key={g.href} className="w-fit underline-offset-4 hover:underline" href={g.href}>
              {g.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
