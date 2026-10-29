"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRef } from "react";
import { HeroDemo } from "@/components/landing/HeroDemo";
import { EDGE_CHITS, ScatterChits } from "@/components/landing/HeroScatter";
import { ButtonLink } from "@/components/ui/Button";
import { IconCheck } from "@/components/ui/Icons";
import { SiteNav } from "@/components/ui/SiteNav";
import { useI18n } from "@/lib/i18n";

export function Hero() {
  const { t, locale } = useI18n();
  const deskRef = useRef<HTMLElement>(null);
  const { isSignedIn } = useAuth();
  const hasProfile = Boolean(isSignedIn);

  return (
    <section ref={deskRef} className="desk relative overflow-hidden text-white">
      <SiteNav tone="ink" />
      <ScatterChits items={EDGE_CHITS} deskRef={deskRef} delay={0.55} />

      <div className="relative z-10 mx-auto grid max-w-[1200px] items-center gap-12 px-4 pt-6 pb-20 sm:px-8 md:grid-cols-[1.08fr_1fr] md:gap-10 md:pt-14 md:pb-32">
        <div>
          <h1
            className={`font-extrabold tracking-[-0.035em] ${
              locale === "hi" ? "text-[clamp(2.6rem,6.4vw,5.2rem)] leading-[1.12]" : "text-[clamp(2.9rem,7.6vw,6.4rem)] leading-[0.92]"
            }`}
          >
            <span className="block stretch-wide">{t("hero.line1")}</span>
            <span className="mt-2 block font-medium stretch-narrow text-white/90">{t("hero.line2")}</span>
          </h1>
          <p className="mt-7 max-w-[36ch] text-[1.2rem] leading-relaxed text-white/88 md:text-[1.28rem]">{t("hero.body")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <ButtonLink href={hasProfile ? "/inbox" : "/start"} variant="haldi" size="lg">
              {hasProfile ? t("nav.inbox") : t("hero.cta")}
            </ButtonLink>
            <Link href="/@demo" className="rounded-md font-semibold underline decoration-2 underline-offset-[6px] hover:decoration-haldi">
              {t("hero.secondary")}
            </Link>
          </div>
          <ul className="mt-10 grid gap-2 text-[1.02rem] text-white/90 sm:flex sm:flex-wrap sm:gap-x-6">
            {(["hero.trust1", "hero.trust2", "hero.trust3"] as const).map((key) => (
              <li key={key} className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-haldi text-navy">
                  <IconCheck className="h-3.5 w-3.5" />
                </span>
                {t(key)}
              </li>
            ))}
          </ul>
        </div>

        <HeroDemo deskRef={deskRef} />
      </div>
    </section>
  );
}
