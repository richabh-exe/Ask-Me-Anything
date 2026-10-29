/*
 * Renders Poocho's static marketing images in Chromium, with the site's own
 * fonts and tokens:
 *
 *   public/og/hi/*.png              Hindi share images (Satori can't shape Devanagari)
 *   public/brand/logo.png           The logo Google reads from the Organization JSON-LD
 *   docs/marketing/creatives/*.png  Ads, social profile art, carousel and launch images
 *
 * Run with `npm run creatives` after changing copy. Needs Playwright with
 * Chromium (`npx playwright install chromium` once). No image prints the
 * domain, so nothing needs re-rendering when the site moves to poocho.app.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { PAGES } from "../lib/content";

const ROOT = process.cwd();
const OUT_PUBLIC = join(ROOT, "public");
const OUT_DOCS = join(ROOT, "docs/marketing/creatives");

/* ── fonts and shared styles ────────────────────────────────────────── */

function fontCss(cssPath: string): string {
  const abs = join(ROOT, "node_modules", cssPath);
  const files = pathToFileURL(join(dirname(abs), "files")).href;
  return readFileSync(abs, "utf8").replace(/url\(\.\/files\//g, `url(${files}/`);
}

const STYLE = `
${fontCss("@fontsource-variable/anek-devanagari/standard.css")}
${fontCss("@fontsource/kalam/400.css")}
${fontCss("@fontsource/kalam/700.css")}
:root { --ink:#2940D9; --navy:#13195A; --navy-soft:#4A5089; --paper:#F5F7FD; --rule:#C3CEF3; --margin:#E8445F; --haldi:#FFD43B; --grid: 60px; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 100%; height: 100%; }
body { font-family: "Anek Devanagari Variable", sans-serif; color: #fff; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
.frame { position: relative; width: 100%; height: 100%; overflow: hidden; }
.desk { background-color: var(--ink);
  background-image: linear-gradient(rgb(255 255 255 / .07) 1.5px, transparent 1.5px), linear-gradient(90deg, rgb(255 255 255 / .07) 1.5px, transparent 1.5px);
  background-size: var(--grid) var(--grid); }
.paper-bg { background: var(--paper); color: var(--navy); }
.wide { font-stretch: 125%; }
.semi { font-stretch: 112%; }
.narrow { font-stretch: 78%; }
.hand { font-family: "Kalam", cursive; font-weight: 700; }
.x { font-weight: 800; letter-spacing: -0.03em; }
:lang(hi) .x { letter-spacing: 0; }
.shadow { filter: drop-shadow(0 2px 2px rgb(19 25 90 / .12)) drop-shadow(0 22px 36px rgb(19 25 90 / .32)); }
.chit { position: relative; background: #fff; color: var(--navy); border-radius: 6px;
  background-image: repeating-linear-gradient(to bottom, transparent 0, transparent calc(var(--line, 56px) - 3px), var(--rule) calc(var(--line, 56px) - 3px), var(--rule) var(--line, 56px));
  clip-path: polygon(0% 10px, 3% 3px, 7% 9px, 11% 2px, 15% 8px, 19% 3px, 24% 10px, 28% 4px, 33% 9px, 37% 2px, 42% 8px, 46% 3px, 51% 10px, 55% 4px, 60% 9px, 64% 3px, 69% 8px, 73% 2px, 78% 9px, 82% 4px, 87% 10px, 91% 3px, 95% 8px, 100% 2px, 100% 100%, 0% 100%); }
.chit::before { content: ""; position: absolute; top: 0; bottom: 0; left: var(--margin-x, 64px); width: 3px; background: var(--margin); opacity: .8; }
.chit > .in { position: relative; padding: var(--pad, 52px 44px 40px calc(var(--margin-x, 64px) + 30px)); }
.sticker { display: inline-block; background: var(--haldi); color: var(--navy); border-radius: 6px; box-shadow: 0 6px 0 var(--navy); transform: rotate(-2deg); }
.pill { display: inline-flex; align-items: center; gap: .4em; border: 4px solid var(--navy); border-radius: 999px; box-shadow: 0 7px 0 var(--navy); font-weight: 700; font-stretch: 112%; }
.stamp { display: inline-block; border: 6px solid var(--margin); color: var(--margin); border-radius: 10px; font-weight: 800; font-stretch: 125%; letter-spacing: .06em; padding: .1em .4em 0; }
.redact { background: var(--navy); color: transparent; border-radius: 4px; }
`;

const MARK = (size: number, tone: "paper" | "haldi" = "paper") => `
<svg width="${size}" height="${size}" viewBox="0 0 40 40" style="transform:rotate(-6deg)">
  <path d="M6 9.5 31.5 6l2.5 24.5L8.5 34z" fill="${tone === "paper" ? "#fff" : "#FFD43B"}" stroke="#13195A" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M24 6.9 31.5 6l.9 8.4z" fill="${tone === "paper" ? "#FFD43B" : "#fff"}" stroke="#13195A" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M15.6 16.4c.4-2.9 2.6-4.4 5.2-4.1 2.6.3 4.2 2.3 3.9 4.6-.3 2.4-2.6 3.2-4 4.3-.9.7-1.1 1.5-1.1 2.6" fill="none" stroke="#13195A" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="19.5" cy="27.4" r="1.7" fill="#13195A"/>
</svg>`;

const WORDMARK = (size: number) => `
<div style="display:flex;align-items:center;gap:${size * 0.28}px">
  ${MARK(size * 1.25)}
  <span class="wide" style="font-size:${size}px;font-weight:800;letter-spacing:-0.02em;line-height:1">poocho</span>
</div>`;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ── designs ────────────────────────────────────────────────────────── */

interface Design {
  file: string;
  width: number;
  height: number;
  lang?: "en" | "hi";
  body: string;
}

function ogHindiHome(): Design {
  return {
    file: join(OUT_PUBLIC, "og/hi/home.png"),
    width: 1200,
    height: 630,
    lang: "hi",
    body: `
<div class="frame desk" style="--grid:44px;display:flex;padding:56px 64px">
  <div style="display:flex;flex-direction:column;justify-content:space-between;width:660px">
    ${WORDMARK(44)}
    <div>
      <div class="x" style="font-size:80px;line-height:1.2;font-stretch:112%">लोग कुछ भी पूछें।</div>
      <div class="narrow" style="font-size:64px;font-weight:500;line-height:1.3;margin-top:4px;opacity:.9">बस असली लोग।</div>
    </div>
    <div><span class="sticker hand" style="font-size:30px;padding:8px 20px 2px">कभी कोई नकली सवाल नहीं</span></div>
  </div>
  <div style="flex:1;display:flex;align-items:center;justify-content:center">
    <div class="shadow" style="transform:rotate(4deg)">
      <div class="chit" style="width:420px;--line:50px;--margin-x:54px">
        <div class="in" style="--pad:40px 36px 34px 84px">
          <div style="font-size:22px;color:var(--navy-soft)">गुमनाम</div>
          <div class="hand" style="font-size:38px;line-height:1.5;color:var(--ink);margin-top:8px">कॉलेज के पहले साल वाले खुद को क्या बताओगे?</div>
          <div style="display:flex;justify-content:flex-end;margin-top:20px"><span class="pill" style="background:var(--ink);color:#fff;font-size:26px;padding:10px 28px 6px">भेजिए</span></div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  };
}

function ogHindiPage(eyebrow: string, title: string, file: string): Design {
  const size = title.length > 40 ? 66 : 78;
  return {
    file,
    width: 1200,
    height: 630,
    lang: "hi",
    body: `
<div class="frame desk" style="--grid:44px">
  <div class="shadow" style="position:absolute;right:-60px;top:150px;transform:rotate(9deg)">
    <div class="chit" style="width:330px;--line:50px;--margin-x:54px">
      <div class="in" style="--pad:30px 70px 30px 84px">
        <div class="hand" style="font-size:150px;line-height:1;color:var(--ink)">?</div>
        <div class="hand" style="font-size:26px;color:var(--margin);margin-top:6px">सिर्फ़ असली लोग</div>
      </div>
    </div>
  </div>
  <div style="position:relative;height:100%;display:flex;flex-direction:column;justify-content:space-between;padding:56px 64px">
    <div><span class="sticker hand" style="font-size:30px;padding:8px 20px 2px">${esc(eyebrow)}</span></div>
    <div class="x wide" style="font-size:${size}px;line-height:1.25;max-width:860px">${esc(title)}</div>
    ${WORDMARK(44)}
  </div>
</div>`,
  };
}

function logo(file: string, size: number): Design {
  return {
    file,
    width: size,
    height: size,
    body: `<div class="frame desk" style="--grid:${size / 8}px;display:grid;place-items:center">${MARK(size * 0.72)}</div>`,
  };
}

const QUESTION_CHIT = (q: string, opts: { width: number; rotate: number; size: number; label?: string; send?: string }) => `
<div class="shadow" style="transform:rotate(${opts.rotate}deg)">
  <div class="chit" style="width:${opts.width}px;--line:${Math.round(opts.size * 1.32)}px;--margin-x:${Math.round(opts.size * 1.2)}px;--pad:${opts.size}px ${Math.round(opts.size * 0.85)}px ${Math.round(opts.size * 0.75)}px ${Math.round(opts.size * 1.8)}px">
    <div class="in">
      ${opts.label ? `<div style="font-size:${opts.size * 0.5}px;color:var(--navy-soft)">${esc(opts.label)}</div>` : ""}
      <div class="hand" style="font-size:${opts.size}px;line-height:1.32;color:var(--ink);margin-top:${opts.size * 0.2}px">${esc(q)}</div>
      ${
        opts.send
          ? `<div style="display:flex;justify-content:flex-end;margin-top:${opts.size * 0.6}px"><span class="pill" style="background:var(--ink);color:#fff;font-size:${opts.size * 0.62}px;padding:.42em 1.1em .26em">${esc(opts.send)}</span></div>`
          : ""
      }
    </div>
  </div>
</div>`;

/* Instagram covers roughly the top 250px and bottom 340px of a 1080 × 1920 story; copy stays clear of both. */
function storyRealQuestions(): Design {
  return {
    file: join(OUT_DOCS, "ad-story-real-questions.png"),
    width: 1080,
    height: 1920,
    body: `
<div class="frame desk" style="padding:270px 84px 360px;display:flex;flex-direction:column;justify-content:space-between">
  <div>
    <div class="x wide" style="font-size:132px;line-height:.92">Get asked<br>anything.</div>
    <div class="narrow" style="font-size:96px;font-weight:500;line-height:1.05;margin-top:18px;opacity:.92">Only by real people.</div>
  </div>
  <div style="display:flex;justify-content:center">${QUESTION_CHIT("What's the best advice you ignored?", { width: 800, rotate: -3, size: 64, label: "Anonymous", send: "Send" })}</div>
  <div style="display:flex;align-items:center;justify-content:space-between">
    <span class="sticker hand" style="font-size:44px;padding:12px 26px 4px">No fake questions, ever</span>
    ${WORDMARK(52)}
  </div>
</div>`,
  };
}

function storyNeverFake(): Design {
  return {
    file: join(OUT_DOCS, "ad-story-never-fake.png"),
    width: 1080,
    height: 1920,
    body: `
<div class="frame desk" style="padding:270px 84px 360px;display:flex;flex-direction:column;justify-content:space-between">
  <div class="x wide" style="font-size:112px;line-height:.98">Some ask apps faked your questions.</div>
  <div style="position:relative;height:520px">
    <div style="position:absolute;left:0;top:30px">${QUESTION_CHIT("someone has a crush on you…", { width: 760, rotate: -5, size: 58, label: "“Anonymous”" })}</div>
    <div style="position:absolute;right:40px;top:215px;transform:rotate(-12deg)"><span class="stamp" style="font-size:76px;background:rgb(255 255 255 / .94)">FAKE</span></div>
  </div>
  <div>
    <div class="x wide" style="font-size:96px;line-height:1;color:var(--haldi)">Poocho never will.</div>
    <div style="font-size:42px;line-height:1.35;margin-top:26px;opacity:.92;max-width:20ch">Every question is from a real person. It's in our pledge, and tested in our code.</div>
    <div style="margin-top:40px">${WORDMARK(52)}</div>
  </div>
</div>`,
  };
}

function storyFilter(): Design {
  return {
    file: join(OUT_DOCS, "ad-story-filter.png"),
    width: 1080,
    height: 1920,
    body: `
<div class="frame desk" style="padding:270px 84px 360px;display:flex;flex-direction:column;justify-content:space-between">
  <div>
    <div class="x wide" style="font-size:120px;line-height:.95">Mean questions?</div>
    <div class="narrow" style="font-size:92px;font-weight:500;line-height:1.05;margin-top:16px;opacity:.92">Filtered before you see them.</div>
  </div>
  <div style="display:grid;gap:56px">
    <div style="display:flex;align-items:center;gap:28px">
      ${QUESTION_CHIT("Which city should I visit first?", { width: 640, rotate: -2, size: 50 })}
      <span class="pill" style="background:#0E8A5C;color:#fff;font-size:40px;padding:.4em .9em .25em;transform:rotate(3deg)">Inbox</span>
    </div>
    <div style="display:flex;align-items:center;gap:28px;position:relative">
      <div style="opacity:.96">
        <div class="shadow" style="transform:rotate(2deg)">
          <div class="chit" style="width:640px;--line:66px"><div class="in">
            <div class="hand" style="font-size:50px;line-height:1.32;color:var(--ink)">ur so <span class="redact">xxxxx</span> lol</div>
          </div></div>
        </div>
      </div>
      <span class="pill" style="background:var(--margin);color:#fff;font-size:40px;padding:.4em .9em .25em;transform:rotate(-3deg)">Filtered</span>
      <div style="position:absolute;left:300px;top:150px;transform:rotate(-8deg)"><span class="stamp" style="font-size:52px;background:rgb(255 255 255 / .94)">FILTERED</span></div>
    </div>
  </div>
  <div style="display:flex;align-items:flex-end;justify-content:space-between">
    <div style="font-size:40px;line-height:1.35;max-width:17ch;opacity:.92">You set how strict. Open the Filtered folder only if you want to.</div>
    ${WORDMARK(52)}
  </div>
</div>`,
  };
}

function storyHinglish(): Design {
  return {
    file: join(OUT_DOCS, "ad-story-hinglish.png"),
    width: 1080,
    height: 1920,
    body: `
<div class="frame desk" style="padding:270px 84px 360px;display:flex;flex-direction:column;justify-content:space-between">
  <div>
    <div class="x wide" style="font-size:124px;line-height:.95">Mujhse kuch bhi poocho.</div>
    <div class="narrow" style="font-size:84px;font-weight:500;line-height:1.08;margin-top:22px;opacity:.92">Sirf asli log. Koi fake sawaal nahi.</div>
  </div>
  <div style="display:flex;justify-content:center">${QUESTION_CHIT("Hostel ka sabse funny kissa kya hai?", { width: 820, rotate: 3, size: 62, label: "Gumnaam", send: "Bhejo" })}</div>
  <div style="display:flex;align-items:center;justify-content:space-between">
    <span class="sticker hand" style="font-size:44px;padding:12px 26px 4px">18+ · free</span>
    ${WORDMARK(52)}
  </div>
</div>`,
  };
}

function feed(file: string, headline: string, sub: string, chit: string, label: string): Design {
  return {
    file,
    width: 1080,
    height: 1350,
    body: `
<div class="frame desk" style="padding:84px;display:flex;flex-direction:column;justify-content:space-between">
  ${WORDMARK(48)}
  <div>
    <div class="x wide" style="font-size:108px;line-height:.95">${headline}</div>
    <div class="narrow" style="font-size:70px;font-weight:500;line-height:1.1;margin-top:16px;opacity:.92">${sub}</div>
  </div>
  <div style="display:flex;justify-content:flex-end">${QUESTION_CHIT(chit, { width: 700, rotate: -3, size: 52, label, send: "Send" })}</div>
</div>`,
  };
}

/* X and LinkedIn put the profile photo over the bottom-left, so copy starts a quarter of the way in. */
function banner(file: string, width: number, height: number): Design {
  const k = height / 500;
  return {
    file,
    width,
    height,
    body: `
<div class="frame desk" style="--grid:${44 * k}px">
  <div style="position:absolute;right:${-50 * k}px;top:${300 * k}px">${QUESTION_CHIT("Best chai in your city?", { width: 330 * k, rotate: -8, size: 28 * k })}</div>
  <div style="position:absolute;right:${80 * k}px;top:${60 * k}px">${QUESTION_CHIT("What should I learn next?", { width: 400 * k, rotate: 5, size: 32 * k })}</div>
  <div style="position:absolute;left:${width * 0.25}px;top:50%;transform:translateY(-50%)">
    <div class="x wide" style="font-size:${58 * k}px;line-height:1">Get asked anything.</div>
    <div class="narrow" style="font-size:${44 * k}px;font-weight:500;opacity:.9;margin-top:${8 * k}px">Only by real people.</div>
  </div>
</div>`,
  };
}

function carousel(): Design[] {
  const ideas = PAGES.find((p) => p.section === "ideas" && p.locale === "en");
  const groups = (ideas?.body ?? []).reduce<{ title: string; items: string[] }[]>((acc, block) => {
    if (block.kind === "h2") acc.push({ title: block.text, items: [] });
    if (block.kind === "chits" && acc.length) acc[acc.length - 1].items = block.items;
    return acc;
  }, []);
  const slide = (n: number, inner: string): Design => ({
    file: join(OUT_DOCS, `carousel-story-prompts-${n}.png`),
    width: 1080,
    height: 1350,
    body: inner,
  });
  const tilt = [-2, 1.5, -1, 2, -1.5];
  return [
    slide(
      1,
      `<div class="frame desk" style="padding:96px 84px;display:flex;flex-direction:column;justify-content:space-between">
        <span class="sticker hand" style="font-size:44px;padding:12px 26px 4px;align-self:flex-start">Save this</span>
        <div class="x wide" style="font-size:150px;line-height:.9"><span style="color:var(--haldi)">100</span> questions to put on your story</div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end">
          <div style="font-size:40px;opacity:.9">Swipe for the best 20 →</div>${WORDMARK(48)}
        </div>
      </div>`,
    ),
    ...groups.slice(0, 4).map((g, i) =>
      slide(
        i + 2,
        `<div class="frame paper-bg" style="padding:80px 72px;display:flex;flex-direction:column;gap:26px">
          <div class="x wide" style="font-size:80px;line-height:1;margin-bottom:18px">${esc(g.title)}</div>
          ${g.items
            .slice(0, 5)
            .map((q, j) => `<div style="align-self:${j % 2 ? "flex-end" : "flex-start"}">${QUESTION_CHIT(q, { width: 880, rotate: tilt[j], size: 40 })}</div>`)
            .join("")}
        </div>`,
      ),
    ),
    slide(
      6,
      `<div class="frame desk" style="padding:96px 84px;display:flex;flex-direction:column;justify-content:center;gap:48px">
        <div class="x wide" style="font-size:112px;line-height:.95">Put one on your link.</div>
        <div style="font-size:48px;line-height:1.3;opacity:.92;max-width:20ch">80 more prompts, and a free anonymous link that only real people can fill. Link in bio.</div>
        ${WORDMARK(60)}
      </div>`,
    ),
  ];
}

function pin(): Design {
  return {
    file: join(OUT_DOCS, "pinterest-story-prompts.png"),
    width: 1000,
    height: 1500,
    body: `
<div class="frame desk" style="padding:80px 72px;display:flex;flex-direction:column;justify-content:space-between">
  <div class="x wide" style="font-size:118px;line-height:.92"><span style="color:var(--haldi)">100</span> Instagram story questions</div>
  <div style="display:grid;gap:34px">
    ${["Ask me my unpopular opinions", "Ask me what I'd tell my first-year self", "Ask me how I plan my reels"]
      .map((q, i) => `<div style="align-self:${i % 2 ? "end" : "start"};justify-self:${i % 2 ? "end" : "start"}">${QUESTION_CHIT(q, { width: 680, rotate: [-2, 2, -1][i], size: 44 })}</div>`)
      .join("")}
  </div>
  ${WORDMARK(52)}
</div>`,
  };
}

function productHunt(): Design[] {
  const W = 1270;
  const H = 760;
  return [
    {
      file: join(OUT_DOCS, "producthunt-1-hero.png"),
      width: W,
      height: H,
      body: `
<div class="frame desk" style="--grid:48px;display:flex;align-items:center;padding:0 80px;gap:40px">
  <div style="flex:1">
    ${WORDMARK(46)}
    <div class="x wide" style="font-size:96px;line-height:.94;margin-top:56px">Get asked anything.</div>
    <div class="narrow" style="font-size:66px;font-weight:500;line-height:1.1;margin-top:10px;opacity:.92">Only by real people.</div>
    <div style="margin-top:48px"><span class="sticker hand" style="font-size:30px;padding:10px 22px 3px;white-space:nowrap">Anonymous Q&amp;A, no fake questions</span></div>
  </div>
  ${QUESTION_CHIT("What's one thing you'd tell your first-year self?", { width: 470, rotate: 4, size: 44, label: "Anonymous", send: "Send" })}
</div>`,
    },
    {
      file: join(OUT_DOCS, "producthunt-2-filter.png"),
      width: W,
      height: H,
      body: `
<div class="frame paper-bg" style="display:flex;align-items:center;padding:0 80px;gap:60px">
  <div style="flex:1">
    <div class="x wide" style="font-size:78px;line-height:.98">Cruel questions never reach you.</div>
    <div style="font-size:34px;line-height:1.45;margin-top:28px;color:var(--navy-soft);max-width:24ch">Every question is checked before delivery. You choose Relaxed, Standard or Strict, and block your own words.</div>
  </div>
  <div style="display:grid;gap:40px">
    <div style="display:flex;align-items:center;gap:22px">${QUESTION_CHIT("Which book changed your mind?", { width: 440, rotate: -2, size: 38 })}<span class="pill" style="background:#0E8A5C;color:#fff;font-size:30px;padding:.4em .9em .25em">Inbox</span></div>
    <div style="display:flex;align-items:center;gap:22px;position:relative">
      <div class="shadow" style="transform:rotate(2deg)"><div class="chit" style="width:440px;--line:50px"><div class="in"><div class="hand" style="font-size:38px;line-height:1.32;color:var(--ink)">nobody <span class="redact">xxxxx</span> ur <span class="redact">xxxxxx</span></div></div></div></div>
      <span class="pill" style="background:var(--margin);color:#fff;font-size:30px;padding:.4em .9em .25em">Filtered</span>
    </div>
  </div>
</div>`,
    },
    {
      file: join(OUT_DOCS, "producthunt-3-pledge.png"),
      width: W,
      height: H,
      body: `
<div class="frame desk" style="--grid:48px;display:flex;align-items:center;justify-content:center">
  <div class="shadow" style="transform:rotate(-1.5deg)">
    <div class="chit" style="width:1000px;--line:58px;--margin-x:80px">
      <div class="in" style="--pad:56px 60px 46px 120px">
        <div class="x wide" style="font-size:58px;line-height:1">The Real Questions Pledge</div>
        <ol style="margin-top:26px;padding:0;list-style:none;display:grid;gap:14px;font-size:32px;line-height:1.3">
          ${[
            "Every question is from a real person.",
            "We never sell hints about who asked.",
            "Cruel questions are filtered first.",
            "Adults only: 18+.",
            "Your answers are yours. Export or delete anytime.",
          ]
            .map((p, i) => `<li style="display:flex;gap:18px"><span class="hand" style="color:var(--ink);font-size:40px;width:28px">${i + 1}</span>${esc(p)}</li>`)
            .join("")}
        </ol>
        <div class="hand" style="font-size:44px;color:var(--ink);margin-top:20px">Team Poocho</div>
      </div>
    </div>
  </div>
</div>`,
    },
  ];
}

/* ── render ─────────────────────────────────────────────────────────── */

function designs(): Design[] {
  const hindi = PAGES.filter((p) => p.locale === "hi").map((p) =>
    ogHindiPage(p.eyebrow, p.title, join(OUT_PUBLIC, `og/hi/${p.section}-${p.slug}.png`)),
  );
  return [
    ogHindiHome(),
    ...hindi,
    logo(join(OUT_PUBLIC, "brand/logo.png"), 512),
    logo(join(OUT_DOCS, "profile-avatar.png"), 1080),
    storyRealQuestions(),
    storyNeverFake(),
    storyFilter(),
    storyHinglish(),
    feed(join(OUT_DOCS, "ad-feed-real-questions.png"), "Get asked anything.", "Only by real people.", "What's the best advice you ignored?", "Anonymous"),
    feed(join(OUT_DOCS, "ad-feed-hinglish.png"), "Kuch bhi poocho.", "Sirf asli log.", "Hostel ka sabse funny kissa kya hai?", "Gumnaam"),
    banner(join(OUT_DOCS, "banner-x-1500x500.png"), 1500, 500),
    banner(join(OUT_DOCS, "banner-linkedin-1584x396.png"), 1584, 396),
    ...carousel(),
    pin(),
    ...productHunt(),
  ];
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const scratch = join(tmpdir(), "poocho-creatives");
  mkdirSync(scratch, { recursive: true });

  for (const d of designs()) {
    const html = `<!doctype html><html lang="${d.lang ?? "en"}"><head><meta charset="utf-8"><style>${STYLE}</style></head><body>${d.body}</body></html>`;
    const tmp = join(scratch, "design.html");
    writeFileSync(tmp, html);
    await page.setViewportSize({ width: d.width, height: d.height });
    await page.goto(pathToFileURL(tmp).href);
    await page.evaluate(() => document.fonts.ready);
    mkdirSync(dirname(d.file), { recursive: true });
    await page.screenshot({ path: d.file, clip: { x: 0, y: 0, width: d.width, height: d.height } });
    console.log(`✓ ${d.file.replace(`${ROOT}/`, "")}`);
  }
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
