"use client";

import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { FoldedChit } from "@/components/paper/Chit";
import { flyBetween, foldAway, unfoldIn } from "@/components/paper/fold";
import { ButtonLink } from "@/components/ui/Button";
import { IconLock, IconUser } from "@/components/ui/Icons";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteNav } from "@/components/ui/SiteNav";
import { track } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";
import { hasPersonalInfo, moderate } from "@/lib/moderation";
import { askQuestionAction } from "@/app/actions";
import { MAX_QUESTION } from "@/lib/limits";
import { timeAgo } from "@/lib/time";
import { useNow } from "@/lib/useNow";
import type { PublicProfile, Question } from "@/lib/types";

type AskResult = Awaited<ReturnType<typeof askQuestionAction>>;

export type AskView =
  | { kind: "sample"; profile: PublicProfile; answers: Question[] }
  | { kind: "live"; profile: PublicProfile; answers: Question[]; own: boolean }
  | { kind: "unclaimed"; handle: string };

/** The ask page. The server loads the host and their public answers; this renders and sends. */
export function AskPage({ view }: { view: AskView }) {
  const { t } = useI18n();

  if (view.kind === "unclaimed") return <Unclaimed handle={view.handle} />;

  const { profile, answers } = view;
  const isSample = view.kind === "sample";
  const own = view.kind === "live" && view.own;
  const handle = profile.handle;

  return (
    <AskShell below={<AnswerFeed handle={handle} answers={answers} />}>
      {(isSample || own) && (
        <p className="mb-6 rounded-[10px] border-2 border-white/40 bg-white/10 px-4 py-3 text-[0.98rem] leading-snug text-white">
          {isSample ? t("ask.samplePage") : t("ask.ownPage")}{" "}
          {own && (
            <Link href="/inbox" className="font-semibold underline underline-offset-4">
              {t("ask.openInbox")}
            </Link>
          )}
        </p>
      )}
      <AskForm profile={profile} isSample={isSample} own={own} />
    </AskShell>
  );
}

export function AskShell({ children, below }: { children: React.ReactNode; below?: React.ReactNode }) {
  return (
    <>
      <main id="main" className="flex-1">
        <section className="desk relative overflow-hidden pb-16">
          <SiteNav tone="ink" />
          <div className="mx-auto max-w-[560px] px-4 pt-4 sm:pt-8">{children}</div>
        </section>
        {below}
      </main>
      <SiteFooter />
    </>
  );
}

type Status =
  | { kind: "editing" }
  | { kind: "sent"; support: boolean }
  | { kind: "error"; message: string };

function AskForm({ profile, isSample, own }: { profile: PublicProfile; isSample: boolean; own: boolean }) {
  const { t } = useI18n();
  const reduce = Boolean(useReducedMotion());
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const chitRef = useRef<HTMLDivElement>(null);
  const flyerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [showName, setShowName] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "editing" });
  const ids = { text: useId(), name: useId(), mode: useId(), hint: useId() };
  const h = profile.handle;

  const needsName = profile.mode === "named" || (profile.mode === "choice" && showName);
  const pii = hasPersonalInfo(text);

  function errorFor(result: Extract<AskResult, { ok: false }>): string {
    switch (result.reason) {
      case "paused":
        return t("ask.paused", { h });
      case "rate_limited":
        return t("ask.rate", { h, m: Math.max(1, Math.ceil(result.retryInMs / 60000)) });
      case "name_required":
        return t("ask.nameRequired");
      default:
        return "";
    }
  }

  async function submit() {
    if (busy || !text.trim() || !chitRef.current || !flyerRef.current || !scope.current) return;
    if (needsName && !name.trim()) {
      setStatus({ kind: "error", message: t("ask.nameRequired") });
      return;
    }

    setBusy(true);
    let support = false;
    if (isSample) {
      support = moderate(text).supportCard;
    } else {
      let result: AskResult;
      try {
        result = await askQuestionAction(h, text, needsName ? name : undefined);
      } catch {
        setStatus({ kind: "error", message: t("ask.failed") });
        setBusy(false);
        return;
      }
      if (!result.ok) {
        setStatus({ kind: "error", message: errorFor(result) || t("ask.failed") });
        setBusy(false);
        return;
      }
      support = result.supportCard;
    }

    await foldAway(animate, chitRef.current, reduce);
    const box = scope.current.getBoundingClientRect();
    await flyBetween(animate, flyerRef.current, scope.current, chitRef.current, { x: box.width * 0.7, y: -260 }, reduce);
    setStatus({ kind: "sent", support });
    setBusy(false);
  }

  async function another() {
    setText("");
    setStatus({ kind: "editing" });
    requestAnimationFrame(async () => {
      if (chitRef.current) await unfoldIn(animate, chitRef.current, reduce);
      textRef.current?.focus();
    });
  }

  const sent = status.kind === "sent";

  return (
    <div ref={scope} className="relative">
      <div style={{ perspective: 1000 }} className={sent ? "pointer-events-none absolute inset-x-0 top-0" : "relative"} inert={sent}>
        <div ref={chitRef} style={{ transformOrigin: "50% 35%" }}>
          <div className="paper-shadow">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
              className="torn margin-line on-paper relative rounded-[4px] bg-white px-5 pt-8 pb-5 text-navy [--margin-x:2.4rem] sm:px-7"
            >
              <div className="flex items-center gap-3 pl-8">
                <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-navy bg-haldi text-[1.3rem] font-bold uppercase">
                  {profile.displayName.slice(0, 1)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[1.15rem] leading-tight font-bold stretch-semi">{profile.displayName}</p>
                  <p className="text-[0.95rem] text-navy-soft">@{h}</p>
                </div>
              </div>

              <label htmlFor={ids.text} className="mt-5 block pl-8 font-hand text-[clamp(1.6rem,6vw,2.1rem)] leading-tight font-bold text-ink">
                {profile.prompt}
              </label>
              <span className="sr-only">{t("ask.questionLabel", { h })}</span>
              <textarea
                ref={textRef}
                id={ids.text}
                value={text}
                onChange={(e) => {
                  setText(e.target.value.slice(0, MAX_QUESTION));
                  if (status.kind === "error") setStatus({ kind: "editing" });
                }}
                rows={4}
                maxLength={MAX_QUESTION}
                placeholder={t("ask.placeholder")}
                disabled={busy || profile.paused}
                aria-describedby={`${ids.mode} ${pii ? ids.hint : ""}`}
                className="ruled mt-2 block w-full resize-none bg-transparent pl-8 font-hand text-[1.35rem] leading-[2.25rem] text-navy placeholder:text-navy/40 focus:outline-none focus-visible:outline-none [--line:2.25rem]"
              />

              <div className="mt-4 space-y-3 pl-8">
                {profile.mode === "anonymous" && (
                  <p id={ids.mode} className="flex items-start gap-2 text-[0.98rem] font-medium">
                    <IconLock className="mt-0.5 h-4 w-4 shrink-0" /> {t("ask.anon", { h })}
                  </p>
                )}
                {profile.mode === "choice" && (
                  <div id={ids.mode}>
                    <label className="flex cursor-pointer items-center gap-3 text-[0.98rem] font-medium">
                      <input
                        type="checkbox"
                        checked={showName}
                        onChange={(e) => setShowName(e.target.checked)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className="relative h-7 w-12 shrink-0 rounded-full border-2 border-navy bg-paper-dim transition-colors peer-checked:bg-ink peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:border-2 after:border-navy after:bg-white after:transition-transform peer-checked:after:translate-x-5"
                      />
                      {t("ask.choice", { h })}
                    </label>
                    {!showName && <p className="mt-1.5 flex items-center gap-2 text-[0.9rem] text-navy-soft"><IconLock className="h-3.5 w-3.5" />{t("ask.choiceOff")}</p>}
                  </div>
                )}
                {profile.mode === "named" && (
                  <p id={ids.mode} className="flex items-start gap-2 text-[0.98rem] font-medium">
                    <IconUser className="mt-0.5 h-4 w-4 shrink-0" /> {t("ask.named", { h })}
                  </p>
                )}
                {needsName && (
                  <div>
                    <label htmlFor={ids.name} className="block text-[0.9rem] font-semibold">
                      {t("ask.nameLabel")}
                    </label>
                    <input
                      id={ids.name}
                      value={name}
                      onChange={(e) => setName(e.target.value.slice(0, 40))}
                      placeholder={t("ask.namePh")}
                      autoComplete="name"
                      className="mt-1 h-11 w-full rounded-[8px] border-2 border-navy bg-white px-3 text-[1rem] focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    />
                  </div>
                )}
                {pii && (
                  <p id={ids.hint} className="rounded-[8px] bg-haldi-soft px-3 py-2 text-[0.92rem] leading-snug">
                    {t("ask.pii")}
                  </p>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 pl-8">
                <span className="text-[0.85rem] text-navy-soft tabular-nums" aria-hidden="true">
                  {text.length}/{MAX_QUESTION}
                </span>
                <button
                  type="submit"
                  disabled={busy || !text.trim() || profile.paused}
                  className="sticker inline-flex h-12 items-center rounded-full bg-ink px-7 text-[1.05rem] font-semibold text-white stretch-semi hover:bg-ink-deep"
                >
                  {busy ? t("ask.sending") : t("ask.send")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div ref={flyerRef} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 z-30 w-16 opacity-0">
        <FoldedChit className="w-16" />
      </div>

      <div aria-live="polite">
        {status.kind === "error" && (
          <p className="mt-4 rounded-[10px] border-2 border-navy bg-haldi-soft px-4 py-3 font-medium text-navy">{status.message}</p>
        )}
        {profile.paused && <p className="mt-4 rounded-[10px] bg-white/15 px-4 py-3 text-white">{t("ask.paused", { h })}</p>}

        <AnimatePresence>
          {sent && (
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 30, rotate: reduce ? 0 : -2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              className="text-white"
            >
              <p className="font-hand text-[3rem] leading-none font-bold">{t("ask.sentTitle")}</p>
              <p className="mt-3 text-[1.25rem] leading-snug">{isSample ? t("ask.sampleSent") : t("ask.sent", { h })}</p>
              {status.support && (
                <p className="mt-4 rounded-[10px] border-2 border-navy bg-haldi-soft px-4 py-3 text-navy">{t("ask.support")}</p>
              )}
              <button
                type="button"
                onClick={() => void another()}
                className="mt-6 font-semibold underline decoration-2 underline-offset-[6px] hover:decoration-haldi"
              >
                {t("ask.another")}
              </button>

              {own ? (
                <div className="mt-8">
                  <ButtonLink href="/inbox" variant="haldi">
                    {t("ask.openInbox")}
                  </ButtonLink>
                </div>
              ) : (
                <div className="paper-shadow mt-10 -rotate-1">
                  <div className="torn on-paper rounded-[4px] bg-haldi px-6 pt-8 pb-6 text-navy">
                    <p className="text-[1.6rem] leading-tight font-extrabold stretch-wide">{t("ask.ownTitle")}</p>
                    <p className="mt-2 text-[1.02rem]">{t("ask.ownBody", { h })}</p>
                    <ButtonLink
                      href="/start"
                      variant="ink"
                      className="mt-5"
                      onClick={() => track("ask_page_cta_clicked", { placement: isSample ? "sample" : "after_send" })}
                    >
                      {t("ask.own")}
                    </ButtonLink>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!sent && <p className="mt-5 text-[0.9rem] leading-snug text-white/75">{t("ask.policy", { h })}</p>}
    </div>
  );
}

function AnswerFeed({ handle, answers }: { handle: string; answers: Question[] }) {
  const { t, locale } = useI18n();
  const now = useNow();
  return (
    <section aria-labelledby="answers-title" className="on-paper bg-paper py-16">
      <div className="mx-auto max-w-[560px] px-4">
        <h2 id="answers-title" className="text-[1.9rem] font-extrabold tracking-[-0.02em] stretch-wide">
          {t("ask.answers", { h: handle })}
        </h2>
        {answers.length === 0 ? (
          <p className="mt-4 text-navy-soft">{t("ask.noAnswers", { h: handle })}</p>
        ) : (
          <ol className="mt-8 space-y-10">
            {answers.map((q, i) => (
              <li key={q.id}>
                <article>
                  <div className={`paper-shadow ${i % 2 ? "rotate-[0.8deg]" : "-rotate-[0.8deg]"}`}>
                    <div className="torn ruled margin-line rounded-[4px] bg-white px-5 pt-[2.25rem] pb-3 [--line:2.25rem] [--margin-x:1.6rem]">
                      <p className="pl-5 text-[0.85rem] leading-[2.25rem] font-semibold text-navy-soft">
                        {q.askerName ? t("ask.askedBy", { n: q.askerName }) : t("ask.anonQuestion")}
                      </p>
                      <h3 className="pl-5 font-hand text-[1.3rem] leading-[2.25rem] text-ink">{q.body}</h3>
                    </div>
                  </div>
                  <p className="mt-5 text-[1.15rem] leading-relaxed font-medium">{q.answer?.body}</p>
                  <div className="mt-2 flex items-center gap-4 text-[0.88rem] text-navy-soft">
                    {handle !== "demo" && q.answer && <span>{timeAgo(q.answer.answeredAt, now, locale)}</span>}
                    <ReportButton />
                  </div>
                </article>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function ReportButton() {
  const { t } = useI18n();
  const [reported, setReported] = useState(false);
  return reported ? (
    <span role="status">{t("ask.reported")}</span>
  ) : (
    <button type="button" onClick={() => setReported(true)} className="underline underline-offset-4 hover:text-margin-deep">
      {t("ask.report")}
    </button>
  );
}

function Unclaimed({ handle }: { handle: string }) {
  const { t } = useI18n();
  return (
    <AskShell>
      <div className="paper-shadow -rotate-1">
        <div className="torn ruled margin-line on-paper rounded-[4px] bg-white px-6 pt-[4.5rem] pb-8 text-navy [--line:2.25rem] [--margin-x:2rem]">
          <div className="pl-6">
            <h1 className="text-[1.7rem] leading-[2.25rem] font-extrabold stretch-semi">{t("ask.unclaimedTitle", { h: handle })}</h1>
            <p className="mt-[2.25rem] font-hand text-[1.2rem] leading-[2.25rem] text-ink">{t("ask.unclaimedBody")}</p>
            <ButtonLink
              href={`/start?handle=${encodeURIComponent(handle)}`}
              className="mt-6"
              onClick={() => track("ask_page_cta_clicked", { placement: "unclaimed" })}
            >
              {t("ask.claim", { h: handle })}
            </ButtonLink>
          </div>
        </div>
      </div>
    </AskShell>
  );
}
