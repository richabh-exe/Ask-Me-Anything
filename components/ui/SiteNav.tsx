"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { LocaleToggle } from "@/components/ui/LocaleToggle";
import { useI18n } from "@/lib/i18n";

export function SiteNav({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  const { t } = useI18n();
  const { isLoaded, isSignedIn } = useAuth();
  const text = tone === "ink" ? "text-white" : "text-navy";

  return (
    <header className={`relative z-20 ${text}`}>
      <nav aria-label="Main" className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-4 sm:px-8 sm:py-5">
        <Link href="/" aria-label={t("nav.home")} className="mr-auto rounded-lg">
          <Wordmark />
        </Link>
        <Link href="/@demo" className="hidden rounded-md px-2 py-1 font-medium underline-offset-4 hover:underline md:inline">
          {t("nav.sample")}
        </Link>
        {isLoaded && !isSignedIn && (
          <Link href="/sign-in" className="hidden rounded-md px-2 py-1 font-medium underline-offset-4 hover:underline sm:inline">
            {t("nav.signIn")}
          </Link>
        )}
        <LocaleToggle tone={tone} />
        <span className="hidden min-[440px]:block">
          <ButtonLink href={isSignedIn ? "/inbox" : "/start"} variant={tone === "ink" ? "haldi" : "ink"} size="sm">
            {isSignedIn ? t("nav.inbox") : t("nav.getLink")}
          </ButtonLink>
        </span>
        {isSignedIn && (
          <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-current">
            <UserButton />
          </span>
        )}
      </nav>
    </header>
  );
}
