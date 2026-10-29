"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { useI18n } from "@/lib/i18n";

const ITEMS = ["pledge.1", "pledge.2", "pledge.3", "pledge.4", "pledge.5"] as const;

/*
 * The pledge is a notebook page that gets signed: when it scrolls into view,
 * a tick is drawn beside each promise and the signature writes itself.
 */
export function PledgeSection() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const show = inView || reduce;

  return (
    <section aria-labelledby="pledge-title" className="desk relative overflow-hidden px-4 py-20 sm:px-8 md:py-28">
      <div ref={ref} className="mx-auto max-w-[820px]">
        <div className="paper-shadow md:-rotate-1">
          <div className="torn ruled margin-line on-paper rounded-[4px] bg-white px-6 pt-[4.5rem] pb-12 text-navy [--line:2.25rem] [--margin-x:2.75rem] sm:px-10 md:px-16 md:[--margin-x:4rem]">
            <div className="pl-8 md:pl-10">
              <h2 id="pledge-title" className="text-[1.9rem] leading-[2.25rem] font-extrabold tracking-[-0.03em] stretch-wide md:text-[3.1rem] md:leading-[4.5rem]">
                {t("pledge.title")}
              </h2>
              <p className="mt-[2.25rem] max-w-[52ch] text-[1.1rem] leading-[2.25rem] text-navy-soft">{t("pledge.intro")}</p>

              <ul className="mt-[2.25rem] grid">
                {ITEMS.map((key, i) => (
                  <li key={key} className="relative flex gap-4 text-[1.12rem] leading-[2.25rem]">
                    <svg viewBox="0 0 32 32" className="h-[2.25rem] w-7 shrink-0" aria-hidden="true">
                      <motion.path
                        d="M5 17.5c3 2.4 5.2 5 6.6 8 3.4-8.6 8.6-15 15.4-20"
                        fill="none"
                        stroke="var(--color-ink)"
                        strokeWidth="3.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 1 : 0 }}
                        animate={{ pathLength: show ? 1 : 0, opacity: show ? 1 : 0 }}
                        transition={{ duration: reduce ? 0 : 0.42, delay: reduce ? 0 : 0.2 + i * 0.28, ease: "easeOut" }}
                      />
                    </svg>
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-[2.25rem] flex flex-wrap items-end justify-between gap-6">
                <div className="relative">
                  <motion.p
                    className="font-hand text-[2.4rem] leading-none font-bold text-ink"
                    initial={{ clipPath: reduce ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
                    animate={{ clipPath: show ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
                    transition={{ duration: reduce ? 0 : 0.9, delay: reduce ? 0 : 0.2 + ITEMS.length * 0.28, ease: [0.45, 0, 0.3, 1] }}
                  >
                    {t("pledge.sign")}
                  </motion.p>
                  <svg viewBox="0 0 220 24" className="mt-1 h-6 w-[220px]" aria-hidden="true">
                    <motion.path
                      d="M4 14c34-10 70-10 104-2 30 7 70 6 108-6"
                      fill="none"
                      stroke="var(--color-margin)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 1 : 0 }}
                      animate={{ pathLength: show ? 1 : 0, opacity: show ? 1 : 0 }}
                      transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 1.2 + ITEMS.length * 0.28 }}
                    />
                  </svg>
                </div>
                <Link
                  href="/pledge"
                  className="rounded-md font-semibold text-ink underline decoration-2 underline-offset-[6px] hover:decoration-margin"
                >
                  {t("pledge.more")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
