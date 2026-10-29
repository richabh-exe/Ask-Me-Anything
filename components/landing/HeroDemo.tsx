"use client";

import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { useId, useRef, useState, type RefObject } from "react";
import { PILE_CHITS, ScatterChits } from "@/components/landing/HeroScatter";
import { FoldedChit } from "@/components/paper/Chit";
import { bump, flyBetween, foldAway, stamp, unfoldIn } from "@/components/paper/fold";
import { IconLock } from "@/components/ui/Icons";
import { useI18n } from "@/lib/i18n";
import { moderate } from "@/lib/moderation";

type Outcome = "delivered" | "filtered";

interface Landed {
  id: number;
  rotate: number;
}

const MAX = 300;

/*
 * The hero is a working miniature of the product: type a question and it is
 * moderated with the real filter, folded and passed to the Inbox tray, or
 * stamped and dropped into Filtered. It runs entirely in the browser.
 */
export function HeroDemo({ deskRef }: { deskRef: RefObject<HTMLElement | null> }) {
  const { t } = useI18n();
  const reduce = Boolean(useReducedMotion());
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const chitRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const flyerRef = useRef<HTMLDivElement>(null);
  const inboxRef = useRef<HTMLDivElement>(null);
  const filteredRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const counter = useRef(0);

  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<{ id: number; kind: Outcome; support: boolean } | null>(null);
  const [trays, setTrays] = useState<Record<Outcome, Landed[]>>({ delivered: [], filtered: [] });
  const [totals, setTotals] = useState<Record<Outcome, number>>({ delivered: 0, filtered: 0 });
  const inputId = useId();

  async function send() {
    const body = text.trim();
    if (!body || busy || !chitRef.current || !flyerRef.current || !scope.current) return;
    const result = moderate(body, { level: "standard" });
    const kind: Outcome = result.flagged ? "filtered" : "delivered";
    const target = kind === "filtered" ? filteredRef.current : inboxRef.current;
    if (!target) return;

    setBusy(true);
    setOutcome(null);

    if (kind === "filtered" && stampRef.current) await stamp(animate, stampRef.current, reduce);
    await foldAway(animate, chitRef.current, reduce);
    await flyBetween(animate, flyerRef.current, scope.current, chitRef.current, target, reduce);

    counter.current += 1;
    const id = counter.current;
    const landed = { id, rotate: ((id * 37) % 24) - 12 };
    setTrays((current) => ({ ...current, [kind]: [...current[kind], landed].slice(-5) }));
    setTotals((current) => ({ ...current, [kind]: current[kind] + 1 }));
    void bump(animate, target, reduce);

    setText("");
    setOutcome({ id, kind, support: result.supportCard });
    if (stampRef.current) await animate(stampRef.current, { opacity: 0 }, { duration: 0 });
    await unfoldIn(animate, chitRef.current, reduce);
    setBusy(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={scope} className="relative mx-auto w-full max-w-[460px] md:ml-auto">
      <p className="relative z-10 mb-3 pr-40 font-hand text-[1.25rem] leading-snug text-white/90">{t("demo.caption")}</p>

      <div className="relative" style={{ perspective: 1000 }}>
        <ScatterChits items={PILE_CHITS} deskRef={deskRef} />
        <div ref={chitRef} style={{ transformOrigin: "50% 35%" }} className="relative z-10">
          <div className="paper-shadow">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
              className="torn margin-line on-paper relative rounded-[4px] bg-white px-5 pt-7 pb-4 text-navy [--margin-x:2.4rem] sm:px-6"
            >
              <div className="flex items-center gap-2.5 pl-8">
                <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full border-2 border-navy bg-haldi text-[1rem] font-bold">
                  Y
                </span>
                <span className="stretch-semi font-semibold">@you</span>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-paper-dim px-2.5 py-1 text-[0.85rem] font-medium">
                  <IconLock className="h-3.5 w-3.5" />
                  {t("demo.anon")}
                </span>
              </div>
              <label htmlFor={inputId} className="mt-3 block pl-8 font-hand text-[1.75rem] leading-tight font-bold text-ink">
                {t("demo.prompt")}
              </label>
              <textarea
                ref={inputRef}
                id={inputId}
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    void send();
                  }
                }}
                rows={3}
                maxLength={MAX}
                placeholder={t("demo.placeholder")}
                disabled={busy}
                className="ruled mt-2 block w-full resize-none bg-transparent pl-8 font-hand text-[1.3rem] leading-[2.25rem] text-navy placeholder:text-navy/40 focus:outline-none focus-visible:outline-none [--line:2.25rem]"
              />
              <div className="mt-3 flex items-center justify-between gap-3 pl-8">
                <span className="text-[0.85rem] text-navy-soft tabular-nums" aria-hidden="true">
                  {text.length}/{MAX}
                </span>
                <button
                  type="submit"
                  disabled={busy || !text.trim()}
                  className="sticker inline-flex h-11 items-center rounded-full bg-ink px-6 font-semibold text-white stretch-semi hover:bg-ink-deep"
                >
                  {t("demo.send")}
                </button>
              </div>

              <div
                ref={stampRef}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0"
              >
                <span className="block rounded-[10px] border-[5px] border-margin px-5 py-1.5 text-[2.6rem] leading-none font-extrabold text-margin stretch-wide [mix-blend-mode:multiply]">
                  filtered
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div ref={flyerRef} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 z-30 w-16 opacity-0">
        <FoldedChit className="w-16" />
      </div>

      <div className="relative z-10 mt-6 grid grid-cols-2 gap-4">
        <Tray refEl={inboxRef} label={t("demo.inbox")} items={trays.delivered} tone="inbox" count={totals.delivered} />
        <Tray refEl={filteredRef} label={t("demo.filtered")} items={trays.filtered} tone="filtered" count={totals.filtered} />
      </div>

      <div aria-live="polite" className="relative z-10 mt-4 min-h-[3.2rem] text-[1rem] leading-snug text-white">
        <AnimatePresence mode="wait">
          <motion.p
            key={outcome ? outcome.id : "idle"}
            initial={{ opacity: 0, y: reduce ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {outcome ? (outcome.kind === "delivered" ? t("demo.delivered") : t("demo.filteredMsg")) : t("demo.idle")}
          </motion.p>
        </AnimatePresence>
        {outcome?.support && (
          <p className="mt-3 rounded-[6px] border-2 border-navy bg-haldi-soft px-3 py-2 text-navy">{t("ask.support")}</p>
        )}
        <p className="mt-2 text-[0.88rem] text-white/70">{t("demo.note")}</p>
      </div>
    </div>
  );
}

function Tray({
  refEl,
  label,
  items,
  tone,
  count,
}: {
  refEl: React.RefObject<HTMLDivElement | null>;
  label: string;
  items: Landed[];
  tone: "inbox" | "filtered";
  count: number;
}) {
  const reduce = useReducedMotion();
  return (
    <div
      ref={refEl}
      className={`relative h-[104px] overflow-hidden rounded-[14px] border-2 border-dashed ${
        tone === "inbox" ? "border-white/60 bg-white/10" : "border-white/60 bg-margin"
      }`}
    >
      <div className="absolute inset-x-0 bottom-0 flex h-16 items-end justify-center">
        <AnimatePresence>
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -30, rotate: item.rotate * 2 }}
              animate={{ opacity: 1, y: 0, rotate: item.rotate }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
              className="-mx-3 mb-1"
              style={{ zIndex: i }}
            >
              <FoldedChit className="w-14" tone={tone === "filtered" ? "pink" : "white"} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="relative flex items-center justify-between px-3 pt-2 text-white">
        <span className="font-semibold stretch-semi">{label}</span>
        <span className="min-w-7 rounded-full bg-white px-2 text-center text-[0.9rem] font-bold text-navy tabular-nums">{count}</span>
      </div>
    </div>
  );
}
