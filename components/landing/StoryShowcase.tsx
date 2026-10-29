"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { StoryCanvas } from "@/components/story/StoryCanvas";
import { useI18n } from "@/lib/i18n";
import { TEMPLATES } from "@/lib/story-card";

/*
 * A hand of story cards, fanned like playing cards. Picking a style brings
 * that card to the front. Every card is drawn by the real export renderer.
 */
export function StoryShowcase() {
  const { t, locale } = useI18n();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const radios = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number, focus = false) => {
    const next = (index + TEMPLATES.length) % TEMPLATES.length;
    setActive(next);
    if (focus) radios.current[next]?.focus();
  };

  return (
    <section aria-labelledby="cards-title" className="on-paper overflow-hidden bg-paper-dim py-20 md:py-28">
      <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-4 sm:px-8 md:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 id="cards-title" className="max-w-[14ch] text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold tracking-[-0.03em] stretch-wide">
            {t("cards.title")}
          </h2>
          <p className="mt-5 max-w-[38ch] text-[1.15rem] text-navy-soft">{t("cards.body")}</p>

          <p id="cards-pick" className="mt-9 font-semibold">
            {t("cards.pick")}
          </p>
          <div
            role="radiogroup"
            aria-labelledby="cards-pick"
            className="mt-3 flex flex-wrap gap-2.5"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                select(active + 1, true);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                select(active - 1, true);
              }
            }}
          >
            {TEMPLATES.map((tpl, i) => {
              const checked = i === active;
              return (
                <button
                  key={tpl.id}
                  ref={(el) => {
                    radios.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  tabIndex={checked ? 0 : -1}
                  onClick={() => select(i)}
                  className={`inline-flex h-11 items-center gap-2 rounded-full border-2 border-navy pr-4 pl-1.5 font-semibold transition-[background-color,box-shadow,transform] ${
                    checked ? "bg-white shadow-[0_3px_0_var(--color-navy)]" : "bg-transparent hover:bg-white/60"
                  }`}
                >
                  <span className="h-7 w-7 rounded-full border-2 border-navy" style={{ background: tpl.swatch }} />
                  {locale === "hi" ? tpl.hi : tpl.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative mx-auto h-[min(118vw,600px)] w-full max-w-[560px]">
          {TEMPLATES.map((tpl, i) => {
            let offset = i - active;
            if (offset > 2) offset -= TEMPLATES.length;
            if (offset < -2) offset += TEMPLATES.length;
            const depth = Math.abs(offset);
            const front = offset === 0;
            return (
              <motion.button
                key={tpl.id}
                type="button"
                tabIndex={-1}
                aria-hidden={!front}
                onClick={() => select(i)}
                className="absolute top-1/2 left-1/2 w-[min(58vw,300px)] -translate-x-1/2 -translate-y-1/2 origin-bottom cursor-pointer"
                initial={false}
                animate={{
                  x: offset * (reduce ? 0 : 74),
                  y: depth * 14,
                  rotate: reduce ? 0 : offset * 7,
                  scale: 1 - depth * 0.07,
                  opacity: reduce && !front ? 0 : 1,
                  zIndex: 10 - depth,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                style={{ filter: front ? "drop-shadow(0 24px 34px rgb(19 25 90 / .32))" : "drop-shadow(0 10px 16px rgb(19 25 90 / .2))" }}
              >
                <div className="overflow-hidden rounded-[14px] border-2 border-navy bg-white">
                  <StoryCanvas
                    kind="answer"
                    resolution={0.42}
                    label={`${t("cards.example")}: ${locale === "hi" ? tpl.hi : tpl.name}. ${t("cards.q")} ${t("cards.a")}`}
                    content={{
                      question: t("cards.q"),
                      answer: t("cards.a"),
                      handle: "you",
                      host: "poocho.app",
                      template: tpl.id,
                      labels: { anonymous: t("ask.anonQuestion"), askedBy: t("ask.askedBy"), askMe: locale === "hi" ? "मुझसे पूछो" : "Ask me on" },
                    }}
                  />
                </div>
              </motion.button>
            );
          })}
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 font-hand text-[1.05rem] text-navy-soft">{t("cards.example")}</span>
        </div>
      </div>
    </section>
  );
}
