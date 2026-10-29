"use client";

import { useI18n, type MessageKey } from "@/lib/i18n";

const STEPS = [1, 2, 3, 4] as const;

export function HowItWorks() {
  const { t } = useI18n();

  return (
    <section aria-labelledby="how-title" className="on-paper relative overflow-hidden bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
        <h2 id="how-title" className="max-w-[16ch] text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold tracking-[-0.03em] stretch-wide">
          {t("how.title")}
        </h2>

        <div className="relative mt-14">
          {/* The path a chit travels, drawn as you scroll. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 1200 140"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 top-[72px] hidden h-[140px] w-full md:block"
          >
            <path
              className="scroll-draw"
              pathLength={1200}
              style={{ "--path-length": 1200 } as React.CSSProperties}
              d="M30 70 C 170 -10, 260 150, 420 70 S 690 -10, 790 70 S 1040 150, 1180 60"
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <svg aria-hidden="true" viewBox="0 0 40 1000" preserveAspectRatio="none" className="pointer-events-none absolute top-0 bottom-0 left-[22px] w-10 md:hidden">
            <path
              className="scroll-draw"
              pathLength={1200}
              style={{ "--path-length": 1200 } as React.CSSProperties}
              d="M20 10 C 40 150, 0 250, 20 400 S 40 700, 20 990"
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
            {STEPS.map((n) => (
              <li key={n} className="relative pl-16 md:pl-0">
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-0 grid h-12 w-12 place-items-center rounded-full border-2 border-navy bg-haldi font-hand text-[1.6rem] leading-none font-bold md:static md:mb-4"
                >
                  {n}
                </span>
                <div className="paper-shadow mb-5 md:mx-0">
                  <div className="torn grid aspect-[4/3] place-items-center rounded-[4px] bg-white p-4">
                    <Illustration step={n} />
                  </div>
                </div>
                <h3 className="text-[1.35rem] font-bold leading-tight stretch-semi">
                  <span className="sr-only">{n}. </span>
                  {t(`how.${n}.title` as MessageKey)}
                </h3>
                <p className="mt-2 max-w-[32ch] text-navy-soft">{t(`how.${n}.body` as MessageKey)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

const stroke = { stroke: "#13195A", strokeWidth: 2.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function Illustration({ step }: { step: 1 | 2 | 3 | 4 }) {
  if (step === 1)
    return (
      <svg viewBox="0 0 160 120" className="h-full max-h-[150px] w-full" aria-hidden="true">
        <rect x="52" y="6" width="58" height="108" rx="10" fill="#2940D9" {...stroke} />
        <rect x="60" y="62" width="42" height="14" rx="7" fill="#FFD43B" {...stroke} strokeWidth={2} />
        <path d="M66 69h30" {...stroke} strokeWidth={2} />
        <path d="M62 24h26M62 34h36M62 44h20" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity=".8" />
        <path d="M124 40c10 8 12 22 2 34" {...stroke} fill="none" />
        <path d="M120 70l6 5 6-7" {...stroke} fill="none" />
        <path d="M20 84c8-12 20-16 30-12" {...stroke} fill="none" />
        <path d="M44 66l7 6-8 6" {...stroke} fill="none" />
      </svg>
    );
  if (step === 2)
    return (
      <svg viewBox="0 0 160 120" className="h-full max-h-[150px] w-full" aria-hidden="true">
        <path d="M22 22 132 14l6 86-110 8z" fill="#fff" {...stroke} />
        <path d="M30 46l100-6M31 64l100-6M32 82l100-6" stroke="#C3CEF3" strokeWidth={2} />
        <path d="M44 22l2 84" stroke="#E8445F" strokeWidth={2} />
        <path d="M54 40c8-4 14 3 22-1s14 2 22-2M55 58c10-3 18 3 30-1M56 76c6-3 12 2 18 0" stroke="#2940D9" strokeWidth={3} strokeLinecap="round" fill="none" />
        <rect x="108" y="66" width="30" height="24" rx="5" fill="#FFD43B" {...stroke} />
        <path d="M114 66v-6a9 9 0 0 1 18 0v6" {...stroke} fill="none" />
      </svg>
    );
  if (step === 3)
    return (
      <svg viewBox="0 0 160 120" className="h-full max-h-[150px] w-full" aria-hidden="true">
        <rect x="10" y="70" width="62" height="40" rx="8" fill="#E3E9FF" {...stroke} strokeDasharray="5 5" />
        <rect x="88" y="70" width="62" height="40" rx="8" fill="#FDE3E8" stroke="#E8445F" strokeWidth={2.5} strokeDasharray="5 5" />
        <path d="M30 86 58 83l1 14-28 3z" fill="#fff" {...stroke} strokeWidth={2} />
        <path d="M60 10 102 6l3 34-42 4z" fill="#fff" {...stroke} />
        <rect x="64" y="16" width="38" height="18" rx="4" fill="none" stroke="#E8445F" strokeWidth={3} transform="rotate(-10 83 25)" />
        <path d="M104 40c10 6 14 14 14 24" {...stroke} fill="none" />
        <path d="M112 60l6 6 5-7" {...stroke} fill="none" />
      </svg>
    );
  return (
    <svg viewBox="0 0 160 120" className="h-full max-h-[150px] w-full" aria-hidden="true">
      <rect x="50" y="4" width="62" height="112" rx="6" fill="#FFD43B" {...stroke} />
      <path d="M58 18 104 15l2 30-46 3z" fill="#fff" {...stroke} strokeWidth={2} />
      <path d="M64 28c8-2 14 1 22-1M64 37c10-2 18 1 28-1" stroke="#2940D9" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <path d="M60 62h42M60 72h36M60 82h40" {...stroke} strokeWidth={4} />
      <rect x="60" y="96" width="42" height="11" rx="5.5" fill="#13195A" />
      <path d="M128 30l5-10M136 40l10-4M126 48l12 4" {...stroke} />
    </svg>
  );
}
