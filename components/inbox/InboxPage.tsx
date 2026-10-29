"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCallback, useId, useRef, useState } from "react";
import { Composer } from "@/components/inbox/Composer";
import { InboxOpsProvider, useCreateInboxOps, useInboxOps } from "@/components/inbox/ops";
import { QuestionChit } from "@/components/inbox/QuestionChit";
import { StoryCanvas } from "@/components/story/StoryCanvas";
import { useShareCard } from "@/components/story/useShareCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { IconCopy, IconEye, IconSettings, IconShare, IconTrash } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { IDEAS } from "@/lib/ideas";
import { CATEGORY_LABEL } from "@/lib/moderation";
import { shareChannel, track } from "@/lib/analytics";
import { copyText } from "@/lib/share";
import { askPath, askUrl, displayHost } from "@/lib/site";
import { useInbox } from "@/lib/client/useInbox";
import { drawAnswerCard, drawInviteCard } from "@/lib/story-card";
import { timeAgo } from "@/lib/time";
import { useNow } from "@/lib/useNow";
import type { Profile, Question, QuestionStatus } from "@/lib/types";

const TABS: { id: QuestionStatus; label: string }[] = [
  { id: "new", label: "New" },
  { id: "answered", label: "Answered" },
  { id: "filtered", label: "Filtered" },
];

export function InboxPage() {
  const { state, refresh, update } = useInbox();
  const ops = useCreateInboxOps(update, refresh);
  const [tab, setTab] = useState<QuestionStatus>("new");
  const [openId, setOpenId] = useState<string | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  const close = useCallback(() => setOpenId(null), []);

  if (state.status === "loading") return <div className="h-[60vh] animate-pulse rounded-[12px] bg-white/60" />;
  if (state.status === "error" || state.status === "signed-out") {
    return (
      <div className="rounded-[16px] border-2 border-navy bg-white p-6">
        <h1 className="text-[1.6rem] font-bold stretch-semi">
          {state.status === "signed-out" ? "Sign in to see your inbox" : "Your inbox didn't load"}
        </h1>
        <p className="mt-2 text-navy-soft">{state.status === "error" ? state.message : "Your questions are waiting."}</p>
        {state.status === "signed-out" ? (
          <ButtonLink href="/sign-in" className="mt-5">
            Sign in
          </ButtonLink>
        ) : (
          <Button className="mt-5" onClick={() => void refresh()}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  const { profile, questions } = state.data;
  if (!profile) {
    return (
      <div className="paper-shadow">
        <div className="torn rounded-[6px] bg-white px-6 pt-10 pb-8">
          <h1 className="text-[2rem] font-extrabold stretch-wide">You don&apos;t have a link yet</h1>
          <p className="mt-3 text-navy-soft">Get your link in about 30 seconds, then questions will land here.</p>
          <ButtonLink href="/start" className="mt-6">
            Get your link
          </ButtonLink>
        </div>
      </div>
    );
  }

  const byStatus = (s: QuestionStatus) => questions.filter((q) => q.status === s);
  const lists = { new: byStatus("new"), answered: byStatus("answered"), filtered: byStatus("filtered") };
  const open = openId ? questions.find((q) => q.id === openId && q.status !== "filtered") : undefined;

  const focusTab = (i: number) => {
    const next = (i + TABS.length) % TABS.length;
    setTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <InboxOpsProvider ops={ops}>
    <LayoutGroup>
      <Header profile={profile} />

      {profile.paused && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border-2 border-navy bg-haldi-soft px-4 py-3">
          <p className="font-medium">Your inbox is paused. Nobody can send you questions right now.</p>
          <Button size="sm" variant="paper" onClick={() => void ops.patchProfile({ paused: false })}>
            Resume inbox
          </Button>
        </div>
      )}

      <div role="tablist" aria-label="Questions" className="mt-10 flex gap-1 border-b-2 border-navy">
        {TABS.map((t, i) => {
          const selected = tab === t.id;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`${baseId}-tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") focusTab(i + 1);
                if (e.key === "ArrowLeft") focusTab(i - 1);
              }}
              className={`relative px-4 pt-2 pb-3 text-[1.08rem] font-semibold sm:px-5 ${selected ? "text-navy" : "text-navy-soft hover:text-navy"}`}
            >
              {selected && (
                <motion.span
                  layoutId="tab-highlighter"
                  aria-hidden="true"
                  className="absolute inset-x-1.5 bottom-2.5 h-[0.9em] -rotate-1 rounded-[3px] bg-haldi"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">
                {t.label}{" "}
                <span className={`ml-1 rounded-full px-1.5 text-[0.85rem] tabular-nums ${t.id === "filtered" ? "bg-margin text-white" : "bg-navy text-white"}`}>
                  {lists[t.id].length}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${tab}`} className="pt-8">
        {tab === "new" &&
          (lists.new.length ? (
            <ul className="columns-1 gap-6 sm:columns-2 lg:columns-3">
              <AnimatePresence initial={false}>
                {lists.new.map((q, i) => (
                  <QuestionChit key={q.id} question={q} index={i} onOpen={() => setOpenId(q.id)} />
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <EmptyNew profile={profile} />
          ))}
        {tab === "answered" && <AnsweredList questions={lists.answered} profile={profile} onEdit={setOpenId} />}
        {tab === "filtered" && <FilteredList questions={lists.filtered} />}
      </div>

      <AnimatePresence>{open && <Composer key={open.id} question={open} profile={profile} onClose={close} />}</AnimatePresence>
    </LayoutGroup>
    </InboxOpsProvider>
  );
}

function Header({ profile }: { profile: Profile }) {
  const toast = useToast();
  const shareCard = useShareCard();
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="min-w-0">
        <h1 className="text-[clamp(2rem,5vw,3rem)] leading-none font-extrabold tracking-[-0.03em] stretch-wide">
          Hi, {profile.displayName.split(" ")[0]}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href={askPath(profile.handle)}
            className="rounded-full border-2 border-navy bg-white px-4 py-1.5 font-semibold break-all text-ink hover:bg-paper"
          >
            {displayHost()}/@{profile.handle}
          </Link>
          <button
            type="button"
            aria-label="Copy link"
            onClick={async () => {
              const copied = await copyText(askUrl(profile.handle));
              if (copied) track("link_shared", { channel: "copy" });
              toast(copied ? "Link copied." : "Copy failed. Select the link and copy it.");
            }}
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-navy bg-white hover:bg-paper"
          >
            <IconCopy className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="ink"
          onClick={async () => {
            const channel = shareChannel(
              await shareCard(
                (ctx) => drawInviteCard(ctx, { prompt: profile.prompt, handle: profile.handle, host: displayHost() }),
                `poocho-${profile.handle}.png`,
                askUrl(profile.handle),
              ),
            );
            if (channel) track("link_shared", { channel });
          }}
        >
          <IconShare /> Share your link
        </Button>
        <ButtonLink href="/settings" variant="paper" aria-label="Settings">
          <IconSettings /> <span className="hidden sm:inline">Settings</span>
        </ButtonLink>
      </div>
    </div>
  );
}

function EmptyNew({ profile }: { profile: Profile }) {
  const toast = useToast();
  const ops = useInboxOps();
  return (
    <div className="grid gap-8 md:grid-cols-[1fr_240px] md:items-start">
      <div>
        <h2 className="text-[1.6rem] font-bold stretch-semi">No questions yet</h2>
        <p className="mt-2 max-w-[48ch] text-navy-soft">
          Post your link on your story and questions will drop in here. Want to see how it works? Open your ask page in
          another tab and send yourself one.
        </p>
        <Link href={askPath(profile.handle)} target="_blank" className="mt-4 inline-block font-semibold text-ink underline underline-offset-4">
          Open my ask page in a new tab
        </Link>

        <section aria-labelledby="ideas-title" className="mt-10 rounded-[16px] border-2 border-dashed border-navy/30 p-5">
          <h3 id="ideas-title" className="flex items-center gap-2 font-semibold">
            Ideas from Poocho
            <span className="rounded-full bg-paper-dim px-2 py-0.5 text-[0.8rem] font-medium text-navy-soft">Suggestions, not questions</span>
          </h3>
          <p className="mt-1 text-[0.95rem] text-navy-soft">Pick a prompt for your ask page. These never go into your inbox.</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {IDEAS.map((idea) => {
              const current = idea.en === profile.prompt;
              return (
                <li key={idea.en}>
                  <button
                    type="button"
                    aria-pressed={current}
                    onClick={() => {
                      void ops.patchProfile({ prompt: idea.en });
                      toast(`Your prompt is now “${idea.en}”.`, "success");
                    }}
                    className={`rounded-full border-2 px-3 py-1.5 text-[0.95rem] ${
                      current ? "border-navy bg-haldi font-semibold" : "border-navy/20 bg-white hover:border-navy"
                    }`}
                  >
                    {idea.en}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
      <div className="mx-auto w-[200px] rotate-2 overflow-hidden rounded-[12px] border-2 border-navy md:w-full">
        <StoryCanvas
          kind="invite"
          resolution={0.4}
          label={`Your story card: ${profile.prompt}`}
          content={{ prompt: profile.prompt, handle: profile.handle, host: displayHost() }}
        />
      </div>
    </div>
  );
}

function AnsweredList({ questions, profile, onEdit }: { questions: Question[]; profile: Profile; onEdit: (id: string) => void }) {
  const shareCard = useShareCard();
  const reduce = useReducedMotion();
  const now = useNow();
  const ops = useInboxOps();
  if (!questions.length) {
    return <p className="max-w-[48ch] text-navy-soft">Answers you write show up here, with a switch for whether each one appears on your page.</p>;
  }
  const sorted = [...questions].sort((a, b) => (b.answer?.answeredAt ?? 0) - (a.answer?.answeredAt ?? 0));
  return (
    <ul className="grid gap-5">
      <AnimatePresence initial={false}>
        {sorted.map((q) => (
          <motion.li
            key={q.id}
            layout={!reduce}
            exit={{ opacity: 0 }}
            className="grid gap-4 rounded-[16px] border-2 border-navy bg-white p-5 sm:grid-cols-[1fr_auto]"
          >
            <div className="min-w-0">
              <p className="font-hand text-[1.2rem] leading-snug text-ink">{q.body}</p>
              <p className="mt-2 leading-relaxed">{q.answer?.body}</p>
              <p className="mt-2 text-[0.88rem] text-navy-soft">Answered {q.answer ? timeAgo(q.answer.answeredAt, now) : ""}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
              <label className="inline-flex cursor-pointer items-center gap-2 text-[0.95rem] font-medium">
                <input
                  type="checkbox"
                  checked={Boolean(q.answer?.isPublic)}
                  onChange={(e) => void ops.setPublic(q.id, e.target.checked)}
                  className="h-5 w-5 accent-[#2940D9]"
                />
                On my page
              </label>
              <div className="flex gap-2">
                <Button size="sm" variant="paper" onClick={() => onEdit(q.id)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ink"
                  aria-label="Share answer to story"
                  onClick={async () => {
                    const answer = q.answer;
                    if (!answer) return;
                    const channel = shareChannel(
                      await shareCard(
                        (ctx) =>
                          drawAnswerCard(ctx, {
                            question: q.body,
                            answer: answer.body,
                            handle: profile.handle,
                            host: displayHost(),
                            askerName: q.askerName,
                            template: answer.template,
                          }),
                        `poocho-${profile.handle}-answer.png`,
                        askUrl(profile.handle),
                      ),
                    );
                    if (channel) track("card_shared", { channel, template: answer.template });
                  }}
                >
                  <IconShare className="h-4 w-4" /> Share
                </Button>
              </div>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

function FilteredList({ questions }: { questions: Question[] }) {
  const toast = useToast();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const reduce = useReducedMotion();
  const now = useNow();
  const ops = useInboxOps();

  if (!questions.length) {
    return (
      <p className="max-w-[52ch] text-navy-soft">
        Nothing filtered. Questions your filter catches wait here for 30 days, hidden until you choose to read them, then they&apos;re deleted.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-6 max-w-[60ch] text-navy-soft">
        These were caught by your filter, so they&apos;re hidden. Filtered questions are deleted after 30 days.
      </p>
      <ul className="grid gap-4">
        <AnimatePresence initial={false}>
          {questions.map((q) => {
            const shown = revealed.has(q.id);
            return (
              <motion.li key={q.id} layout={!reduce} exit={{ opacity: 0, x: reduce ? 0 : 40 }} className="rounded-[16px] border-2 border-margin bg-white p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {q.moderation.categories.map((c) => (
                    <span key={c} className="rounded-full bg-[#fde3e8] px-2.5 py-0.5 text-[0.85rem] font-semibold text-margin-deep">
                      {CATEGORY_LABEL[c]}
                    </span>
                  ))}
                  <span className="ml-auto text-[0.88rem] text-navy-soft">{timeAgo(q.createdAt, now)}</span>
                </div>
                {q.moderation.supportCard && (
                  <p className="mt-3 rounded-[10px] bg-haldi-soft px-3 py-2 text-[0.95rem]">
                    This question mentions self-harm. If someone you know may be at risk, Tele-MANAS offers free, confidential support day and
                    night on 14416.
                  </p>
                )}
                <p
                  className={`mt-3 font-hand text-[1.2rem] leading-snug transition-[filter] duration-300 ${shown ? "" : "blur-[7px] select-none"}`}
                  aria-hidden={!shown}
                >
                  {q.body}
                </p>
                {!shown && <p className="sr-only">Hidden question.</p>}
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.95rem] font-semibold">
                  {!shown && (
                    <button type="button" onClick={() => setRevealed((s) => new Set(s).add(q.id))} className="inline-flex items-center gap-1.5 underline underline-offset-4">
                      <IconEye className="h-4 w-4" /> Show question
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      void ops.move(q.id, "new");
                      toast("Moved to your inbox.", "success");
                    }}
                    className="underline underline-offset-4"
                  >
                    Move to inbox
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void ops.remove(q.id);
                      toast("Question deleted.");
                    }}
                    className="inline-flex items-center gap-1.5 text-margin-deep underline underline-offset-4"
                  >
                    <IconTrash className="h-4 w-4" /> Delete
                  </button>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
