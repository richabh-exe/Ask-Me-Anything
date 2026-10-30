import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { ReactNode } from "react";

/*
 * Share images (1200 × 630) for WhatsApp, Instagram DMs, X and LinkedIn. They
 * use the same vocabulary as the site: the blue desk with its faint grid, a
 * torn notebook chit with the red margin, Anek for type and Kalam for anything
 * handwritten. Satori can't read variable or woff2 fonts, so static woff cuts
 * of both families live in assets/og (SIL Open Font License).
 */

export const OG_SIZE = { width: 1200, height: 630 };

const C = {
  ink: "#2940D9",
  navy: "#13195A",
  paper: "#FFFFFF",
  rule: "#C3CEF3",
  margin: "#E8445F",
  haldi: "#FFD43B",
};

/* Cached so the build can prerender every image that doesn't read the database. */
async function font(file: string): Promise<ArrayBuffer> {
  "use cache";
  const data = await readFile(join(process.cwd(), "assets/og", file));
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

async function readFonts() {
  const [bold, medium, hand] = await Promise.all([font("anek-latin-800.woff"), font("anek-latin-500.woff"), font("kalam-latin-700.woff")]);
  return [
    { name: "Anek", data: bold, weight: 800, style: "normal" },
    { name: "Anek", data: medium, weight: 500, style: "normal" },
    { name: "Kalam", data: hand, weight: 700, style: "normal" },
  ] as const;
}

/*
 * Satori draws glyphs without complex-script shaping, so Devanagari comes out
 * with matras in the wrong place. Hindi share images are therefore rendered
 * in Chromium ahead of time (scripts/render-creatives.mjs), and dynamic images
 * leave out any user text written in Devanagari rather than garble it.
 */
export const hasDevanagari = (text: string) => /[\u0900-\u097F]/.test(text);

const SANS = "Anek";
const HAND = "Kalam";

async function render(children: ReactNode): Promise<ImageResponse> {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: C.ink, fontFamily: SANS, color: C.paper }}>
        <Grid />
        {children}
      </div>
    ),
    { ...OG_SIZE, fonts: [...(await readFonts())] },
  );
}

/* The desk's graph-paper grid, drawn as lines because Satori has no background-size. */
function Grid() {
  const lines: ReactNode[] = [];
  for (let x = 44; x < OG_SIZE.width; x += 44)
    lines.push(<div key={`x${x}`} style={{ position: "absolute", left: x, top: 0, width: 1, height: OG_SIZE.height, background: "rgba(255,255,255,0.07)" }} />);
  for (let y = 44; y < OG_SIZE.height; y += 44)
    lines.push(<div key={`y${y}`} style={{ position: "absolute", top: y, left: 0, height: 1, width: OG_SIZE.width, background: "rgba(255,255,255,0.07)" }} />);
  return <>{lines}</>;
}

function Mark({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ transform: "rotate(-6deg)" }}>
      <path d="M6 9.5 31.5 6l2.5 24.5L8.5 34z" fill="#FFFFFF" stroke="#13195A" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M24 6.9 31.5 6l.9 8.4z" fill="#FFD43B" stroke="#13195A" strokeWidth="2.4" strokeLinejoin="round" />
      <path
        d="M15.6 16.4c.4-2.9 2.6-4.4 5.2-4.1 2.6.3 4.2 2.3 3.9 4.6-.3 2.4-2.6 3.2-4 4.3-.9.7-1.1 1.5-1.1 2.6"
        fill="none"
        stroke="#13195A"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="19.5" cy="27.4" r="1.7" fill="#13195A" />
    </svg>
  );
}

function Wordmark({ host }: { host?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <Mark />
      <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>poocho</div>
      {host && <div style={{ marginLeft: 10, fontSize: 24, fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>{host}</div>}
    </div>
  );
}

/** A ruled notebook chit with the red margin, tilted on the desk. */
function Chit({ width, rotate, children }: { width: number; rotate: number; children: ReactNode }) {
  const rules: ReactNode[] = [];
  for (let y = 64; y < 560; y += 46) rules.push(<div key={y} style={{ position: "absolute", left: 0, right: 0, top: y, height: 2, background: C.rule }} />);
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width,
        background: C.paper,
        borderRadius: 6,
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 18px 40px rgba(19,25,90,0.35)",
        overflow: "hidden",
      }}
    >
      {rules}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 54, width: 3, background: C.margin, opacity: 0.8 }} />
      <div style={{ display: "flex", flexDirection: "column", padding: "34px 36px 34px 84px", width: "100%", color: C.navy }}>{children}</div>
    </div>
  );
}

function Sticker({ children, rotate = -2 }: { children: ReactNode; rotate?: number }) {
  return (
    <div
      style={{
        display: "flex",
        background: C.haldi,
        color: C.navy,
        fontFamily: HAND,
        fontWeight: 700,
        fontSize: 30,
        padding: "6px 18px 2px",
        borderRadius: 4,
        transform: `rotate(${rotate}deg)`,
        boxShadow: `0 4px 0 ${C.navy}`,
      }}
    >
      {children}
    </div>
  );
}

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

/* ── the three images ───────────────────────────────────────────────── */

export function homeImage(host: string) {
  return render(
    <div style={{ display: "flex", width: "100%", padding: "56px 64px" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640 }}>
        <Wordmark />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 0.95, letterSpacing: -3 }}>Get asked anything.</div>
          <div style={{ fontSize: 64, fontWeight: 500, lineHeight: 1.1, marginTop: 12, color: "rgba(255,255,255,0.9)" }}>Only by real people.</div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Sticker>No fake questions, ever</Sticker>
          <div style={{ fontSize: 26, color: "rgba(255,255,255,0.8)" }}>{host}</div>
        </div>
      </div>
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Chit width={420} rotate={4}>
          <div style={{ fontSize: 22, fontWeight: 500, color: "#4A5089" }}>Anonymous</div>
          <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 40, lineHeight: 1.15, color: C.ink, marginTop: 14 }}>
            What&apos;s one thing you&apos;d tell your first-year self?
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 26 }}>
            <div
              style={{
                display: "flex",
                background: C.ink,
                color: C.paper,
                borderRadius: 999,
                padding: "10px 26px 6px",
                fontSize: 26,
                fontWeight: 800,
                border: `3px solid ${C.navy}`,
              }}
            >
              Send
            </div>
          </div>
        </Chit>
      </div>
    </div>,
  );
}

export function profileImage({
  handle,
  prompt,
  host,
  latest,
}: {
  handle: string;
  prompt: string;
  host: string;
  latest?: { question: string; answer: string };
}) {
  const quote = hasDevanagari(prompt) ? null : prompt;
  const card = latest && !hasDevanagari(latest.question + latest.answer) ? latest : undefined;
  return render(
    <div style={{ display: "flex", width: "100%", padding: "52px 64px" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: card ? 560 : 1072 }}>
        <Wordmark />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>Ask</div>
          <div style={{ fontSize: handle.length > 12 ? 70 : 88, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>{`@${handle}`}</div>
          <div style={{ fontSize: 30, fontWeight: 500, color: "rgba(255,255,255,0.8)", marginTop: 6 }}>anything, anonymously</div>
          {quote && (
            <div style={{ display: "flex", fontFamily: HAND, fontWeight: 700, fontSize: 36, lineHeight: 1.2, marginTop: 26, color: C.haldi }}>
              {`“${clip(quote, 70)}”`}
            </div>
          )}
        </div>
        <div style={{ display: "flex" }}>
          <Sticker rotate={-1}>{`${host}/@${handle}`}</Sticker>
        </div>
      </div>
      {card && (
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Chit width={460} rotate={3}>
            <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 30, lineHeight: 1.2, color: C.ink }}>{clip(card.question, 110)}</div>
            <div style={{ height: 3, background: C.navy, opacity: 0.15, margin: "20px 0 18px" }} />
            <div style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.3, color: C.navy }}>{clip(card.answer, 150)}</div>
          </Chit>
        </div>
      )}
    </div>,
  );
}

export function contentImage({ eyebrow, title, host }: { eyebrow: string; title: string; host: string }) {
  const size = title.length > 56 ? 62 : title.length > 36 ? 74 : 86;
  return render(
    <div style={{ display: "flex", width: "100%", position: "relative" }}>
      <div style={{ display: "flex", position: "absolute", right: -70, top: 150 }}>
        <Chit width={330} rotate={9}>
          <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 150, lineHeight: 1, color: C.ink, marginTop: 6 }}>?</div>
          <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 28, color: C.margin, marginTop: 8 }}>real people only</div>
        </Chit>
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", padding: "56px 64px" }}>
        <div style={{ display: "flex" }}>
          <Sticker>{eyebrow}</Sticker>
        </div>
        <div style={{ display: "flex", fontSize: size, fontWeight: 800, lineHeight: 1.06, letterSpacing: -2, maxWidth: 860 }}>{title}</div>
        <Wordmark host={host} />
      </div>
    </div>,
  );
}
