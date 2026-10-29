"use client";

import { useEffect, useRef } from "react";
import {
  CARD_H,
  CARD_W,
  drawAnswerCard,
  drawInviteCard,
  ensureCardFonts,
  type CardContent,
  type InviteContent,
} from "@/lib/story-card";

type Props =
  | { kind: "answer"; content: CardContent; resolution?: number; className?: string; label: string }
  | { kind: "invite"; content: InviteContent; resolution?: number; className?: string; label: string };

/** Live preview drawn by the same code that renders the exported PNG. */
export function StoryCanvas({ kind, content, resolution = 0.5, className = "", label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const signature = JSON.stringify(content);

  useEffect(() => {
    let cancelled = false;
    const data = JSON.parse(signature);
    void ensureCardFonts().then(() => {
      const ctx = ref.current?.getContext("2d");
      if (cancelled || !ctx) return;
      if (kind === "answer") drawAnswerCard(ctx, data as CardContent, resolution);
      else drawInviteCard(ctx, data as InviteContent, resolution);
    });
    return () => {
      cancelled = true;
    };
  }, [kind, signature, resolution]);

  return (
    <canvas
      ref={ref}
      width={Math.round(CARD_W * resolution)}
      height={Math.round(CARD_H * resolution)}
      role="img"
      aria-label={label}
      className={`block aspect-[9/16] h-auto w-full ${className}`}
    />
  );
}
