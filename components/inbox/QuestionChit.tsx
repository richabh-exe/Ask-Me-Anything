"use client";

import { motion, useReducedMotion } from "motion/react";
import { timeAgo } from "@/lib/time";
import { useNow } from "@/lib/useNow";
import type { Question } from "@/lib/types";

/** A question in the inbox. Opening it unfolds this chit into the composer (shared layoutId). */
export function QuestionChit({ question, index, onOpen }: { question: Question; index: number; onOpen: (el: HTMLElement) => void }) {
  const reduce = useReducedMotion();
  const now = useNow();
  const tilt = index % 3 === 0 ? -1.2 : index % 3 === 1 ? 0.8 : -0.4;

  return (
    <motion.li
      layout={!reduce}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -70, rotate: tilt * 6, scale: 1.05 }}
      animate={{ opacity: 1, y: 0, rotate: tilt, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, rotate: tilt * 3, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="mb-6 break-inside-avoid"
    >
      <motion.button
        layoutId={reduce ? undefined : `chit-${question.id}`}
        type="button"
        onClick={(e) => onOpen(e.currentTarget)}
        whileHover={reduce ? undefined : { y: -4, rotate: 0 }}
        whileTap={reduce ? undefined : { scale: 0.98 }}
        className="paper-shadow block w-full text-left"
      >
        <span className="torn ruled margin-line block rounded-[4px] bg-white px-5 pt-[2.25rem] pb-3 [--line:2.25rem] [--margin-x:1.6rem]">
          <span className="flex items-center justify-between gap-3 pl-5 text-[0.85rem] leading-[2.25rem] font-semibold text-navy-soft">
            <span>{question.askerName ? `Asked by ${question.askerName}` : "Anonymous"}</span>
            <span className="font-normal">{timeAgo(question.createdAt, now)}</span>
          </span>
          <span className="block pl-5 font-hand text-[1.28rem] leading-[2.25rem] break-words text-navy">{question.body}</span>
          <span className="mt-1 block pl-5 text-[0.9rem] leading-[2.25rem] font-semibold text-ink">Answer</span>
        </span>
      </motion.button>
    </motion.li>
  );
}
