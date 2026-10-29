"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { StoryCanvas } from "@/components/story/StoryCanvas";
import { useShareCard } from "@/components/story/useShareCard";
import { Button } from "@/components/ui/Button";
import { IconDownload, IconShare, IconTrash, IconX } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { useInboxOps } from "@/components/inbox/ops";
import { MAX_ANSWER } from "@/lib/limits";
import { downloadBlob } from "@/lib/share";
import { askUrl, displayHost } from "@/lib/site";
import { drawAnswerCard, renderToBlob, TEMPLATES, type CardContent } from "@/lib/story-card";
import { timeAgo } from "@/lib/time";
import { useNow } from "@/lib/useNow";
import type { Profile, Question, TemplateId } from "@/lib/types";

/*
 * The answer composer. The question chit unfolds out of the inbox list
 * (shared layoutId), the answer is written underneath, and the story card
 * preview on the right is the exact image that gets shared.
 */
export function Composer({ question, profile, onClose }: { question: Question; profile: Profile; onClose: () => void }) {
  const reduce = useReducedMotion();
  const toast = useToast();
  const shareCard = useShareCard();
  const now = useNow();
  const ops = useInboxOps();
  const panelRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLTextAreaElement>(null);
  const [answer, setAnswer] = useState(question.answer?.body ?? "");
  const [template, setTemplate] = useState<TemplateId>(question.answer?.template ?? "ink");
  const [isPublic, setIsPublic] = useState(question.answer?.isPublic ?? true);
  const [working, setWorking] = useState(false);
  const ids = { title: useId(), answer: useId(), tpl: useId() };

  const content: CardContent = {
    question: question.body,
    answer: answer.trim() || "Your answer will appear here.",
    handle: profile.handle,
    host: displayHost(),
    askerName: question.askerName,
    template,
  };

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const timer = setTimeout(() => answerRef.current?.focus(), reduce ? 0 : 320);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea, input, [href], [tabindex]:not([tabindex="-1"])',
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [onClose, reduce]);

  const save = () => ops.answer(question.id, { body: answer, template, isPublic });

  const requireAnswer = () => {
    if (answer.trim()) return true;
    toast("Write an answer first.", "warn");
    answerRef.current?.focus();
    return false;
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto bg-navy/55 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ids.title}
        className="on-paper relative mx-auto my-0 min-h-full max-w-[1040px] bg-paper px-4 pt-5 pb-10 sm:my-8 sm:min-h-0 sm:rounded-[20px] sm:border-2 sm:border-navy sm:px-8 sm:pt-7"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id={ids.title} className="text-[1.5rem] font-extrabold stretch-wide">
            {question.status === "answered" ? "Edit your answer" : "Answer this question"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-11 w-11 place-items-center rounded-full border-2 border-navy bg-white hover:bg-paper-dim"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-8 md:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            <motion.div layoutId={reduce ? undefined : `chit-${question.id}`} className="paper-shadow" transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <div className="torn ruled margin-line rounded-[4px] bg-white px-5 pt-[2.25rem] pb-4 [--line:2.25rem] [--margin-x:1.6rem]">
                <p className="flex justify-between gap-3 pl-5 text-[0.85rem] leading-[2.25rem] font-semibold text-navy-soft">
                  <span>{question.askerName ? `Asked by ${question.askerName}` : "Anonymous"}</span>
                  <span className="font-normal">{timeAgo(question.createdAt, now)}</span>
                </p>
                <p className="pl-5 font-hand text-[1.45rem] leading-[2.25rem] break-words text-navy">{question.body}</p>
              </div>
            </motion.div>

            <label htmlFor={ids.answer} className="mt-7 block font-semibold">
              Your answer
            </label>
            <textarea
              ref={answerRef}
              id={ids.answer}
              value={answer}
              onChange={(e) => setAnswer(e.target.value.slice(0, MAX_ANSWER))}
              rows={5}
              placeholder="Write it the way you'd say it."
              className="mt-2 block w-full resize-y rounded-[12px] border-2 border-navy bg-white p-4 text-[1.1rem] leading-relaxed focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
            />
            <p className="mt-1 text-right text-[0.85rem] text-navy-soft tabular-nums">
              {answer.length}/{MAX_ANSWER}
            </p>

            <p id={ids.tpl} className="mt-4 font-semibold">
              Card style
            </p>
            <div role="radiogroup" aria-labelledby={ids.tpl} className="mt-2 flex flex-wrap gap-2">
              {TEMPLATES.map((tpl) => {
                const checked = tpl.id === template;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => setTemplate(tpl.id)}
                    className={`inline-flex h-10 items-center gap-2 rounded-full border-2 border-navy pr-3.5 pl-1 text-[0.95rem] font-semibold ${
                      checked ? "bg-white shadow-[0_3px_0_var(--color-navy)]" : "hover:bg-white/70"
                    }`}
                  >
                    <span className="h-6 w-6 rounded-full border-2 border-navy" style={{ background: tpl.swatch }} />
                    {tpl.name}
                  </button>
                );
              })}
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-[#2940D9]"
              />
              <span>
                <span className="block font-semibold">Show on my page</span>
                <span className="block text-[0.95rem] text-navy-soft">Visitors to @{profile.handle} can read this answer.</span>
              </span>
            </label>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t-2 border-dashed border-navy/20 pt-5 text-[0.95rem]">
              {question.status !== "answered" && (
                <button
                  type="button"
                  className="font-semibold underline underline-offset-4"
                  onClick={() => {
                    onClose();
                    void ops.move(question.id, "filtered").then(() => toast("Moved to Filtered."));
                  }}
                >
                  Move to Filtered
                </button>
              )}
              <button
                type="button"
                className="inline-flex items-center gap-1.5 font-semibold text-margin-deep underline underline-offset-4"
                onClick={() => {
                  onClose();
                  void ops.remove(question.id).then(() => toast("Question deleted."));
                }}
              >
                <IconTrash className="h-4 w-4" /> Delete question
              </button>
            </div>
          </div>

          <div className="md:sticky md:top-6 md:self-start">
            <div className="mx-auto w-[min(70vw,260px)] overflow-hidden rounded-[14px] border-2 border-navy bg-white md:w-full">
              <StoryCanvas kind="answer" resolution={0.5} content={content} label={`Story card preview. ${question.body} ${answer}`} />
            </div>
            <div className="mt-5 grid gap-3">
              <Button
                variant="ink"
                disabled={working}
                onClick={async () => {
                  if (!requireAnswer()) return;
                  setWorking(true);
                  void save();
                  await shareCard((ctx) => drawAnswerCard(ctx, content), `poocho-${profile.handle}-answer.png`, askUrl(profile.handle));
                  setWorking(false);
                }}
              >
                <IconShare /> Share to story
              </Button>
              <Button
                variant="paper"
                disabled={working}
                onClick={async () => {
                  if (!requireAnswer()) return;
                  setWorking(true);
                  void save();
                  try {
                    downloadBlob(await renderToBlob((ctx) => drawAnswerCard(ctx, content)), `poocho-${profile.handle}-answer.png`);
                    toast("Image saved.", "success");
                  } catch {
                    toast("The image couldn't be created. Try again.", "warn");
                  }
                  setWorking(false);
                }}
              >
                <IconDownload /> Save image
              </Button>
              <Button
                variant="haldi"
                onClick={async () => {
                  if (!requireAnswer()) return;
                  setWorking(true);
                  const saved = await save();
                  setWorking(false);
                  if (!saved) return toast("Your answer didn't save. Try again.", "warn");
                  toast(isPublic ? `Answer saved and shown on @${profile.handle}.` : "Answer saved. Only you can see it.", "success");
                  onClose();
                }}
              >
                Save answer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
