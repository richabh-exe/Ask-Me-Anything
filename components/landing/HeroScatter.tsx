"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, RefObject } from "react";

/*
 * Example chits tossed onto the desk on page load. They are decoration
 * (hidden from assistive tech) and can be picked up and dragged around.
 * Each one sits behind the demo chit or peeks in from an edge, so none of
 * them ever covers text.
 */

export interface ScatterItem {
  text: string;
  pos: CSSProperties;
  rotate: number;
  width: number;
  /** Smallest breakpoint the chit appears at. */
  from: "base" | "md" | "lg";
}

const VISIBILITY = { base: "block", md: "hidden md:block", lg: "hidden lg:block" } as const;

export function ScatterChits({
  items,
  deskRef,
  delay = 0.25,
}: {
  items: ScatterItem[];
  deskRef: RefObject<HTMLElement | null>;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <>
      {items.map((chit, i) => (
        <motion.div
          key={chit.text}
          aria-hidden="true"
          className={`absolute z-0 cursor-grab touch-none active:cursor-grabbing ${VISIBILITY[chit.from]}`}
          style={{ ...chit.pos, width: chit.width }}
          initial={
            reduce
              ? { opacity: 0, rotate: chit.rotate }
              : { opacity: 0, y: -320, x: (i % 2 ? 1 : -1) * 70, rotate: chit.rotate * 5, scale: 1.15 }
          }
          animate={{ opacity: 1, y: 0, x: 0, rotate: chit.rotate, scale: 1 }}
          transition={
            reduce ? { duration: 0.3, delay: 0.1 } : { type: "spring", stiffness: 110, damping: 13, mass: 0.9, delay: delay + i * 0.1 }
          }
          drag
          dragConstraints={deskRef}
          dragElastic={0.12}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 18 }}
          whileDrag={{ scale: 1.07, rotate: chit.rotate + 5, zIndex: 40 }}
        >
          <div className="paper-shadow">
            <div className="torn ruled margin-line rounded-[3px] bg-white px-4 pt-[1.65rem] pb-2 [--line:1.65rem] [--margin-x:0.9rem]">
              <p className="pl-2 font-hand text-[1.02rem] leading-[1.65rem] text-navy select-none">{chit.text}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}

/** Chits peeking in from the bottom edge of the hero. */
export const EDGE_CHITS: ScatterItem[] = [
  { text: "Honest review of your hostel mess food", pos: { left: "3%", bottom: -30 }, rotate: 6, width: 196, from: "md" },
  { text: "Biggest lesson from your first job?", pos: { left: "38%", bottom: -38 }, rotate: -5, width: 188, from: "lg" },
  { text: "How do you plan your reels?", pos: { right: "3%", bottom: -36 }, rotate: -11, width: 168, from: "md" },
];

/** Chits in the pile underneath the demo chit. */
export const PILE_CHITS: ScatterItem[] = [
  { text: "What's a song you've had on repeat all week?", pos: { top: -30, right: -40 }, rotate: 8, width: 180, from: "base" },
  { text: "Chai or coffee? Defend your answer.", pos: { top: "40%", right: -86 }, rotate: -7, width: 172, from: "lg" },
  { text: "आपकी पसंदीदा किताब कौन-सी है?", pos: { bottom: "6%", left: -78 }, rotate: -9, width: 176, from: "lg" },
];
