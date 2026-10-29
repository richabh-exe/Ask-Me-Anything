# Poocho

Get asked anything, only by real people. Poocho is an anonymous Q&A site for creators, built from [`Poocho_PRD.md`](./Poocho_PRD.md). Hosts share one link, followers ask without giving their name, a filter catches cruel questions before the host sees them, and answers become 1080 × 1920 story cards.

This repository holds the **MVP front end**. The core loop (claim a link, ask, filter, answer, share) works end to end in the browser, with data saved in `localStorage` until the Supabase backend is connected. Sign-in, push notifications and cross-device delivery wait on that backend (see [What's next](#whats-next)).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # moderation + Real Questions guarantee
npm run lint
npm run build
```

Try the full loop: **Get your link** → open your page at `/@yourname` in a second tab → send a question → watch it drop into `/inbox` live → answer it and share the card.

## What's built

| Route | Purpose (PRD reference) |
| --- | --- |
| `/` | Landing page with a working demo: type a question and it's filtered, folded and passed to the Inbox or Filtered tray. Hindi/English toggle (§13). |
| `/start` | Onboarding: 18+ check that keeps no birth date, handle with live checks, prompt, link mode, filter strictness, then the "Ask me" story card (US-1). |
| `/@handle` | Public ask page with the anonymity notice, Named and Asker's-choice modes, personal-details hint, 5 per hour rate limit, Tele-MANAS support card, published answers and a report link (US-2, US-5, §8). |
| `/inbox` | New, Answered and Filtered tabs. New questions arrive live from other tabs. Opening one unfolds it into the answer composer, with 5 card templates and Web Share or save + copy link fallback (US-3, US-4). |
| `/settings` | Link mode, filter level, blocked words, pause inbox, JSON/CSV export, delete everything (US-7). |
| `/pledge` | The Real Questions Pledge, how anonymity works, retention table and community guidelines (§8, §9). |
| `/@demo` | A sample page, clearly labelled as written by the Poocho team. |

## Design

The idea comes from the Indian classroom chit (पर्ची): tear a strip from a ruled notebook, write a question, fold it, pass it on. The whole interface uses that vocabulary of ballpoint blue, ruled lines, the red margin and a haldi highlighter. Motion follows the same paper physics: chits are tossed, folded, stamped and unfolded. The full reasoning, tokens and layout sketches are in [`docs/creative/design-plan.md`](./docs/creative/design-plan.md).

- **Type:** Anek Devanagari (variable weight and width, from Indian foundry Ek Type) for UI and Hindi, and Kalam for anything handwritten. Both are self-hosted through Fontsource.
- **Motion:** [Motion](https://motion.dev) for the fold, fly, stamp and shared-layout unfold, plus one CSS scroll-timeline line. Every animation respects `prefers-reduced-motion` (`MotionConfig reducedMotion="user"`) and falls back to crossfades.
- **Cards:** drawn on a canvas by `lib/story-card.ts`, so the preview is pixel-for-pixel the PNG that gets shared. Text stays out of the zones Instagram covers.

## Architecture

```
app/                 Next.js 16 App Router routes (Cache Components on)
components/
  landing/           Hero + demo, How it works, card fan, pledge, claim link
  ask/ inbox/ start/ settings/   One folder per screen
  paper/             Chit visuals and the shared fold/fly animation helpers
  story/             Canvas preview + share hook
  ui/                Buttons, nav, toasts, segmented control, icons
lib/
  poocho.ts          Every state change (ask, answer, move, delete…)
  store.ts           localStorage persistence + cross-tab sync (swap for Supabase)
  moderation.ts      Pre-delivery filter: English, Hinglish, Devanagari, PII
  story-card.ts      1080×1920 card renderer
  i18n.tsx           English/Hindi copy for public pages
tests/               node:test suites run with tsx
```

**The Real Questions guarantee (US-6)** is enforced in code and in tests. `askQuestion` is the only function that adds to the inbox, and it stores only text a person typed. Prompt ideas live in a separate "Ideas from Poocho" panel. `tests/real-questions.test.ts` checks every host action and scans the source for any other insert.

**Moderation** (`lib/moderation.ts`) is a local stand-in for the PRD's hosted classifier, and it returns the same result shape. It normalises leetspeak and stretched spellings, scores matches with a noisy-OR, and always filters threats, self-harm, personal details and the host's blocked words. As the pledge says, it catches a lot, not everything.

## What's next

1. **Supabase:** auth (magic link + Google), Postgres tables per PRD §14 with RLS, realtime for the inbox. Replace `lib/store.ts`, then move `askQuestion` into a server action behind Turnstile and Redis rate limiting.
2. **Server moderation:** a hosted moderation API plus an LLM Hinglish classifier, run before delivery.
3. **Server-rendered public pages** and the SEO indexing gate (§12), plus OG images from the same card renderer.
4. **PWA push** and Hindi for the host screens.

Set `NEXT_PUBLIC_SITE_URL` in production so story cards and links show the real domain.
