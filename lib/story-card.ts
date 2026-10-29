import type { TemplateId } from "./types";

/*
 * Story cards (PRD US-4): a 1080 × 1920 PNG drawn on a canvas, so the preview
 * a host sees is the exact image they share. Instagram covers roughly the top
 * 250px and bottom 340px with its own UI, so all text stays between them.
 */

export const CARD_W = 1080;
export const CARD_H = 1920;
const SAFE_TOP = 260;
const SAFE_BOTTOM = CARD_H - 340;

const SANS = '"Anek Devanagari Variable", "Anek Devanagari", system-ui, sans-serif';
const HAND = '"Kalam", "Comic Sans MS", cursive';

const C = {
  ink: "#2940D9",
  navy: "#13195A",
  paper: "#F5F7FD",
  rule: "#C3CEF3",
  margin: "#E8445F",
  haldi: "#FFD43B",
  chalk: "#23423A",
  white: "#FFFFFF",
};

interface Theme {
  background: string;
  answer: string;
  answerFont: "sans" | "hand";
  chit: { fill: string; rule: string; text: string; label: string } | null;
  pill: { fill: string; text: string; shadow: string };
}

export const TEMPLATES: { id: TemplateId; name: string; hi: string; swatch: string }[] = [
  { id: "ink", name: "Ink", hi: "स्याही", swatch: C.ink },
  { id: "notebook", name: "Notebook", hi: "नोटबुक", swatch: C.paper },
  { id: "haldi", name: "Haldi", hi: "हल्दी", swatch: C.haldi },
  { id: "margin", name: "Margin", hi: "हाशिया", swatch: C.margin },
  { id: "chalk", name: "Chalkboard", hi: "ब्लैकबोर्ड", swatch: C.chalk },
];

const THEMES: Record<TemplateId, Theme> = {
  ink: {
    background: C.ink,
    answer: C.white,
    answerFont: "sans",
    chit: { fill: C.white, rule: C.rule, text: C.navy, label: "rgba(19,25,90,.6)" },
    pill: { fill: C.haldi, text: C.navy, shadow: C.navy },
  },
  notebook: {
    background: C.paper,
    answer: C.navy,
    answerFont: "sans",
    chit: null,
    pill: { fill: C.ink, text: C.white, shadow: C.navy },
  },
  haldi: {
    background: C.haldi,
    answer: C.navy,
    answerFont: "sans",
    chit: { fill: C.white, rule: C.rule, text: C.navy, label: "rgba(19,25,90,.6)" },
    pill: { fill: C.navy, text: C.white, shadow: "rgba(19,25,90,.35)" },
  },
  margin: {
    background: C.margin,
    answer: C.white,
    answerFont: "sans",
    chit: { fill: C.white, rule: "#F6C9D1", text: C.navy, label: "rgba(19,25,90,.6)" },
    pill: { fill: C.white, text: C.navy, shadow: C.navy },
  },
  chalk: {
    background: C.chalk,
    answer: C.white,
    answerFont: "hand",
    chit: null,
    pill: { fill: "transparent", text: C.white, shadow: "transparent" },
  },
};

export interface CardContent {
  question: string;
  answer: string;
  handle: string;
  host: string;
  askerName?: string;
  template: TemplateId;
  labels?: { anonymous: string; askedBy: string; askMe: string };
}

export interface InviteContent {
  prompt: string;
  handle: string;
  host: string;
  labels?: { subline: string; sticker: string };
}

const DEFAULT_LABELS = {
  anonymous: "Anonymous question",
  askedBy: "Asked by {n}",
  askMe: "Ask me on",
};

/* ── helpers ─────────────────────────────────────────────────────────── */

function seeded(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function setFont(
  ctx: CanvasRenderingContext2D,
  family: "sans" | "hand",
  weight: number,
  size: number,
  stretch: CanvasFontStretch = "normal",
) {
  ctx.font = `${weight} ${size}px ${family === "sans" ? SANS : HAND}`;
  if ("fontStretch" in ctx) ctx.fontStretch = stretch;
}

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\n+/)) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const attempt = line ? `${line} ${word}` : word;
      if (ctx.measureText(attempt).width <= maxWidth || !line) {
        line = attempt;
      } else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

interface Fit {
  size: number;
  lineHeight: number;
  lines: string[];
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  opts: { family: "sans" | "hand"; weight: number; max: number; min: number; leading: number; width: number; height: number; stretch?: CanvasFontStretch },
): Fit {
  for (let size = opts.max; size >= opts.min; size -= 2) {
    setFont(ctx, opts.family, opts.weight, size, opts.stretch);
    const lines = wrapText(ctx, text, opts.width);
    const lineHeight = Math.round(size * opts.leading);
    if (lines.length * lineHeight <= opts.height) return { size, lineHeight, lines };
  }
  setFont(ctx, opts.family, opts.weight, opts.min, opts.stretch);
  const lineHeight = Math.round(opts.min * opts.leading);
  const max = Math.max(1, Math.floor(opts.height / lineHeight));
  const lines = wrapText(ctx, text, opts.width);
  if (lines.length > max) {
    lines.length = max;
    lines[max - 1] = `${lines[max - 1].replace(/\s+\S*$/, "")}…`;
  }
  return { size: opts.min, lineHeight, lines };
}

function tornRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rand: () => number) {
  ctx.beginPath();
  ctx.moveTo(x, y + 6);
  const steps = 28;
  for (let i = 1; i <= steps; i++) {
    ctx.lineTo(x + (w * i) / steps, y + rand() * 12);
  }
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawRules(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, gap: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (let ly = y + gap; ly < y + h - 4; ly += gap) {
    ctx.beginPath();
    ctx.moveTo(x, ly);
    ctx.lineTo(x + w, ly);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPill(ctx: CanvasRenderingContext2D, theme: Theme, text: string, centerY: number, outline = false) {
  setFont(ctx, "sans", 700, 40, "semi-expanded");
  const tw = ctx.measureText(text).width;
  const w = Math.min(CARD_W - 120, tw + 96);
  const h = 96;
  const x = (CARD_W - w) / 2;
  const y = centerY - h / 2;
  if (theme.pill.shadow !== "transparent") {
    ctx.fillStyle = theme.pill.shadow;
    roundRect(ctx, x, y + 10, w, h, h / 2);
    ctx.fill();
  }
  roundRect(ctx, x, y, w, h, h / 2);
  if (theme.pill.fill !== "transparent") {
    ctx.fillStyle = theme.pill.fill;
    ctx.fill();
  }
  if (outline || theme.pill.fill === "transparent") {
    ctx.strokeStyle = theme.pill.text;
    ctx.lineWidth = 4;
    ctx.setLineDash(outline ? [] : [14, 10]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = theme.pill.text;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, CARD_W / 2, centerY + 3, w - 60);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

/** Faint eraser sweeps, the way a blackboard looks after a lecture. */
function chalkDust(ctx: CanvasRenderingContext2D, rand: () => number) {
  ctx.save();
  ctx.lineCap = "round";
  for (let i = 0; i < 9; i++) {
    const y = 120 + rand() * (CARD_H - 240);
    const x = -80 + rand() * 300;
    const length = 500 + rand() * 600;
    ctx.strokeStyle = `rgba(255,255,255,${0.025 + rand() * 0.025})`;
    ctx.lineWidth = 90 + rand() * 110;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + length * 0.3, y - 40 + rand() * 80, x + length * 0.7, y - 40 + rand() * 80, x + length, y - 30 + rand() * 60);
    ctx.stroke();
  }
  ctx.restore();
}

/* ── answer card ─────────────────────────────────────────────────────── */

export function drawAnswerCard(ctx: CanvasRenderingContext2D, content: CardContent, scale = 1) {
  const theme = THEMES[content.template];
  const labels = content.labels ?? DEFAULT_LABELS;
  const rand = seeded(content.question + content.template);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, CARD_W, CARD_H);

  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const label = content.askerName ? labels.askedBy.replace("{n}", content.askerName) : labels.anonymous;
  let cursor = SAFE_TOP + 40;

  if (content.template === "notebook") {
    drawRules(ctx, 0, 0, CARD_W, CARD_H, 72, C.rule);
    ctx.fillStyle = C.margin;
    ctx.fillRect(132, 0, 3, CARD_H);
  }
  if (content.template === "chalk") chalkDust(ctx, rand);

  const textX = theme.chit ? 210 : 190;
  const textW = CARD_W - textX - 130;

  if (theme.chit) {
    const chit = theme.chit;
    const q = fitText(ctx, content.question, {
      family: "hand", weight: 400, max: 64, min: 40, leading: 1.45, width: textW, height: 460,
    });
    const chitX = 96;
    const chitW = CARD_W - 192;
    const header = 110;
    const chitH = header + q.lines.length * q.lineHeight + 46;
    ctx.save();
    ctx.translate(CARD_W / 2, cursor + chitH / 2);
    ctx.rotate(-0.035);
    ctx.translate(-CARD_W / 2, -(cursor + chitH / 2));
    ctx.shadowColor = "rgba(19,25,90,.28)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;
    ctx.fillStyle = chit.fill;
    tornRect(ctx, chitX, cursor, chitW, chitH, rand);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.save();
    tornRect(ctx, chitX, cursor, chitW, chitH, seeded(content.question + content.template));
    ctx.clip();
    drawRules(ctx, chitX, cursor + header, chitW, chitH - header, q.lineHeight, chit.rule);
    ctx.fillStyle = C.margin;
    ctx.fillRect(chitX + 84, cursor, 3, chitH);
    ctx.restore();

    setFont(ctx, "sans", 600, 30);
    ctx.fillStyle = chit.label;
    ctx.fillText(label, textX, cursor + 76);

    // Handwriting sits just above each rule.
    setFont(ctx, "hand", 400, q.size);
    ctx.fillStyle = chit.text;
    q.lines.forEach((line, i) => ctx.fillText(line, textX, cursor + header + (i + 1) * q.lineHeight - q.size * 0.32));
    ctx.restore();
    cursor += chitH + 110;
  } else {
    const handColor = content.template === "chalk" ? "#FFE58A" : C.ink;
    setFont(ctx, "sans", 600, 30);
    ctx.fillStyle = content.template === "chalk" ? "rgba(255,255,255,.7)" : "rgba(19,25,90,.6)";
    ctx.fillText(label, textX, cursor + 30);
    cursor += 60;
    const lead = content.template === "notebook" ? 72 / 64 : 1.4;
    const q = fitText(ctx, content.question, {
      family: "hand", weight: content.template === "chalk" ? 400 : 700, max: 64, min: 40, leading: lead, width: textW, height: 460,
    });
    const qLine = content.template === "notebook" ? 72 : q.lineHeight;
    // Sit handwriting on the notebook rules.
    let baseline = content.template === "notebook" ? Math.ceil((cursor + q.size) / 72) * 72 - 14 : cursor + q.size;
    ctx.fillStyle = handColor;
    q.lines.forEach((line) => {
      ctx.fillText(line, textX, baseline);
      baseline += qLine;
    });
    cursor = baseline + 40;
    // A hand-drawn underline separates question and answer.
    ctx.strokeStyle = content.template === "chalk" ? "rgba(255,255,255,.75)" : C.margin;
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(textX, cursor);
    ctx.bezierCurveTo(textX + 120, cursor - 14, textX + 220, cursor + 12, textX + 340, cursor - 4);
    ctx.stroke();
    cursor += 90;
  }

  const footerY = SAFE_BOTTOM - 70;
  const a = fitText(ctx, content.answer || " ", {
    family: theme.answerFont,
    weight: 700,
    max: theme.answerFont === "hand" ? 78 : 84,
    min: 40,
    leading: theme.answerFont === "hand" ? 1.4 : 1.2,
    width: theme.chit ? CARD_W - 220 : CARD_W - 300,
    height: footerY - 110 - cursor,
    stretch: theme.answerFont === "sans" ? "semi-expanded" : "normal",
  });
  ctx.fillStyle = theme.answer;
  setFont(ctx, theme.answerFont, 700, a.size, theme.answerFont === "sans" ? "semi-expanded" : "normal");
  a.lines.forEach((line, i) => ctx.fillText(line, 110 + (theme.chit ? 0 : 80), cursor + a.size + i * a.lineHeight));

  drawPill(ctx, theme, `${labels.askMe} ${content.host}/@${content.handle}`, footerY);
}

/* ── invite card ("Ask me anything" story) ──────────────────────────── */

export function drawInviteCard(ctx: CanvasRenderingContext2D, content: InviteContent, scale = 1) {
  const labels = content.labels ?? { subline: "Anonymous. No sign-up needed.", sticker: "Put your link sticker here" };
  const rand = seeded(content.prompt + content.handle);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, CARD_W, CARD_H);
  ctx.fillStyle = C.ink;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // A few faint folded chits in the background, like a desk.
  for (let i = 0; i < 7; i++) {
    ctx.save();
    ctx.translate(rand() * CARD_W, rand() * CARD_H);
    ctx.rotate((rand() - 0.5) * 1.2);
    ctx.fillStyle = "rgba(255,255,255,.08)";
    ctx.fillRect(-70, -45, 140, 90);
    ctx.restore();
  }

  const chitX = 90;
  const chitW = CARD_W - 180;
  const top = SAFE_TOP + 60;
  const p = fitText(ctx, content.prompt, { family: "hand", weight: 700, max: 104, min: 60, leading: 1.25, width: chitW - 200, height: 420 });
  const chitH = 200 + p.lines.length * p.lineHeight + 420;

  ctx.save();
  ctx.translate(CARD_W / 2, top + chitH / 2);
  ctx.rotate(-0.03);
  ctx.translate(-CARD_W / 2, -(top + chitH / 2));
  ctx.shadowColor = "rgba(10,14,60,.35)";
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = C.white;
  tornRect(ctx, chitX, top, chitW, chitH, rand);
  ctx.fill();
  ctx.shadowColor = "transparent";
  drawRules(ctx, chitX, top + 120, chitW, chitH - 120, 80, C.rule);
  ctx.fillStyle = C.margin;
  ctx.fillRect(chitX + 90, top + 8, 3, chitH - 8);

  setFont(ctx, "sans", 700, 40, "semi-expanded");
  ctx.fillStyle = C.ink;
  ctx.fillText(`@${content.handle}`, chitX + 130, top + 110);

  setFont(ctx, "hand", 700, p.size);
  ctx.fillStyle = C.navy;
  p.lines.forEach((line, i) => ctx.fillText(line, chitX + 130, top + 200 + p.size * 0.9 + i * p.lineHeight));

  const stickerY = top + 200 + p.lines.length * p.lineHeight + 110;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.setLineDash([16, 12]);
  roundRect(ctx, chitX + 130, stickerY, chitW - 220, 150, 75);
  ctx.stroke();
  ctx.setLineDash([]);
  setFont(ctx, "sans", 600, 34);
  ctx.fillStyle = "rgba(41,64,217,.8)";
  ctx.textAlign = "center";
  ctx.fillText(labels.sticker, chitX + 130 + (chitW - 220) / 2, stickerY + 88);
  ctx.textAlign = "left";
  ctx.restore();

  setFont(ctx, "sans", 600, 38);
  ctx.fillStyle = "rgba(255,255,255,.9)";
  ctx.textAlign = "center";
  ctx.fillText(labels.subline, CARD_W / 2, SAFE_BOTTOM - 170);
  ctx.textAlign = "left";
  drawPill(ctx, THEMES.ink, `${content.host}/@${content.handle}`, SAFE_BOTTOM - 70);
}

/* ── export ──────────────────────────────────────────────────────────── */

export async function ensureCardFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  const sample = "Aa आ";
  await Promise.allSettled([
    document.fonts.load(`700 64px ${SANS}`, sample),
    document.fonts.load(`600 32px ${SANS}`, sample),
    document.fonts.load(`400 64px ${HAND}`, sample),
    document.fonts.load(`700 64px ${HAND}`, sample),
  ]);
}

export async function renderToBlob(draw: (ctx: CanvasRenderingContext2D) => void): Promise<Blob> {
  await ensureCardFonts();
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  draw(ctx);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create the image."))), "image/png"),
  );
}
