"use client";

import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="on-paper border-t-2 border-navy bg-paper text-navy">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr]">
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
      </div>
    </footer>
  );
}
