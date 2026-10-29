"use client";

import Link from "next/link";
import { Wordmark } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { LocaleToggle } from "@/components/ui/LocaleToggle";
import { useI18n } from "@/lib/i18n";
import { useDB } from "@/lib/store";

export function SiteNav({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  const { t } = useI18n();
  const db = useDB();
  const hasProfile = Boolean(db?.profile);
  const text = tone === "ink" ? "text-white" : "text-navy";

  return (
    <header className={`relative z-20 ${text}`}>
      <nav aria-label="Main" className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-4 sm:px-8 sm:py-5">
        <Link href="/" aria-label={t("nav.home")} className="mr-auto rounded-lg">
          <Wordmark />
        </Link>
        <Link
          href="/@demo"
          className="hidden rounded-md px-2 py-1 font-medium underline-offset-4 hover:underline sm:inline"
        >
          {t("nav.sample")}
        </Link>
        <LocaleToggle tone={tone} />
        <span className="hidden min-[440px]:block">
          <ButtonLink href={hasProfile ? "/inbox" : "/start"} variant={tone === "ink" ? "haldi" : "ink"} size="sm">
            {hasProfile ? t("nav.inbox") : t("nav.getLink")}
          </ButtonLink>
        </span>
      </nav>
    </header>
  );
}
