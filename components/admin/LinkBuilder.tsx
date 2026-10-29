"use client";

import { useId, useMemo, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { copyText } from "@/lib/share";
import { serverOrigin, siteOrigin } from "@/lib/site";

const subscribe = () => () => {};

/* The channels from the marketing plan, so every shared link is tagged the same way. */
const PRESETS = [
  { label: "Seeded creator story", source: "instagram", medium: "story", campaign: "seed" },
  { label: "Poocho's own Instagram", source: "instagram", medium: "social", campaign: "reels" },
  { label: "Instagram ads (paid test)", source: "instagram", medium: "paid_social", campaign: "paid_test" },
  { label: "WhatsApp groups", source: "whatsapp", medium: "social", campaign: "groups" },
  { label: "Campus ambassador", source: "campus", medium: "ambassador", campaign: "campus" },
  { label: "Reddit", source: "reddit", medium: "community", campaign: "build_story" },
  { label: "Product Hunt", source: "producthunt", medium: "launch", campaign: "launch" },
  { label: "Indie Hackers", source: "indiehackers", medium: "launch", campaign: "launch" },
  { label: "X build in public", source: "x", medium: "social", campaign: "build_in_public" },
  { label: "LinkedIn build in public", source: "linkedin", medium: "social", campaign: "build_in_public" },
  { label: "Press", source: "press", medium: "pr", campaign: "launch" },
] as const;

const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

/** Builds UTM-tagged links so Vercel Analytics and PostHog can tell which channel worked. */
export function LinkBuilder() {
  const toast = useToast();
  const ids = { preset: useId(), path: useId(), content: useId() };
  const [preset, setPreset] = useState(0);
  const [path, setPath] = useState("/");
  const [content, setContent] = useState("");
  const origin = useSyncExternalStore(subscribe, siteOrigin, serverOrigin);

  const url = useMemo(() => {
    const p = PRESETS[preset];
    const target = new URL(path.startsWith("/") ? path : `/${path}`, `${origin}/`);
    target.searchParams.set("utm_source", p.source);
    target.searchParams.set("utm_medium", p.medium);
    target.searchParams.set("utm_campaign", p.campaign);
    if (slug(content)) target.searchParams.set("utm_content", slug(content));
    return target.toString();
  }, [origin, preset, path, content]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <label htmlFor={ids.preset} className="grid gap-1.5 font-semibold">
          Channel
          <select id={ids.preset} className="field" value={preset} onChange={(e) => setPreset(Number(e.target.value))}>
            {PRESETS.map((p, i) => (
              <option key={p.label} value={i}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={ids.path} className="grid gap-1.5 font-semibold">
          Page
          <input id={ids.path} className="field" value={path} onChange={(e) => setPath(e.target.value)} placeholder="/ or /guides/…" />
        </label>
        <label htmlFor={ids.content} className="grid gap-1.5 font-semibold">
          Who or what (optional)
          <input id={ids.content} className="field" value={content} onChange={(e) => setContent(e.target.value)} placeholder="creator handle, reel name…" />
        </label>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 rounded-[10px] bg-paper-dim px-3 py-2.5 text-[0.92rem] break-all text-ink">{url}</code>
        <Button variant="ink" onClick={async () => toast((await copyText(url)) ? "Link copied." : "Copy failed. Select the link and copy it.")}>
          Copy link
        </Button>
      </div>
    </div>
  );
}
