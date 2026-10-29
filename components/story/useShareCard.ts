"use client";

import { useCallback } from "react";
import { useToast } from "@/components/ui/Toast";
import { shareImage, type ShareOutcome } from "@/lib/share";
import { renderToBlob } from "@/lib/story-card";

/** Renders a card to PNG and shares it, falling back to save + copy link (PRD US-4). */
export function useShareCard() {
  const toast = useToast();
  return useCallback(
    async (draw: (ctx: CanvasRenderingContext2D) => void, filename: string, link: string): Promise<ShareOutcome | "failed"> => {
      try {
        const blob = await renderToBlob(draw);
        const outcome = await shareImage(blob, filename, link);
        if (outcome === "saved") {
          toast("Image saved and your link is copied. In Instagram, tap the sticker icon, choose Link and paste.", "success");
        } else if (outcome === "shared") {
          toast("Shared.", "success");
        }
        return outcome;
      } catch {
        toast("The image couldn't be created. Try again, or screenshot the preview instead.", "warn");
        return "failed";
      }
    },
    [toast],
  );
}
