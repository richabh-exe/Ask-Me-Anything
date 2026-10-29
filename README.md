# Poocho

Get asked anything, only by real people. Poocho is an anonymous Q&A site for creators, built from [`Poocho_PRD.md`](./Poocho_PRD.md). Hosts share one link, followers ask without giving their name, a filter catches cruel questions before the host sees them, and answers become 1080 × 1920 story cards.

Sign-in runs on **Clerk** (Google or a one-time email link, no passwords) and data lives in **Neon Postgres** (project `poocho`, Singapore), accessed through Drizzle ORM and node-postgres from Next.js server actions.

## Run it

```bash
npm install
npm i -g neon@latest && neon login   # once per machine
neon env pull                        # writes DATABASE_URL and DATABASE_URL_UNPOOLED to .env.local
npm run dev                          # http://localhost:3000
```

`.env.local` also needs the Clerk keys from the Clerk dashboard (API keys). `.env.example` lists every variable. The publishable key is public; `CLERK_SECRET_KEY` and the database URLs are secrets.

```bash
npm test             # moderation + repository tests on an in-process Postgres
npm run lint
npm run build
npm run db:generate  # after editing lib/server/schema.ts
npm run db:migrate   # applies drizzle/ to the database in DATABASE_URL_UNPOOLED
```

On Vercel, add the same variables in Project Settings → Environment Variables, or connect the Neon project through the Vercel integration. `vercel.json` pins functions to Singapore (`sin1`), next to the database.

## What's built

| Route | Purpose (PRD reference) |
| --- | --- |
| `/` | Landing page with a working demo: type a question and it's filtered, folded and passed to the Inbox or Filtered tray. Hindi/English toggle (§13). |
| `/start` | Onboarding: 18+ check that keeps no birth date, Clerk sign-in, handle with live availability, prompt, link mode, filter strictness, then the "Ask me" story card (US-1). |
| `/sign-in` | Clerk sign-in for returning hosts: Google, or a one-time email link or code. |
| `/@handle` | Public ask page with the anonymity notice, Named and Asker's-choice modes, personal-details hint, 5 per hour rate limit, Tele-MANAS support card, published answers and a report link (US-2, US-5, §8). |
| `/inbox` | New, Answered and Filtered tabs, refreshed every 8 seconds while open. Opening a question unfolds it into the answer composer, with 5 card templates and Web Share or save + copy link fallback (US-3, US-4). |
| `/settings` | Link mode, filter level, blocked words, pause inbox, JSON/CSV export, and account deletion that removes the Clerk user and every row they own (US-7). |
| `/pledge` | The Real Questions Pledge, how anonymity works, retention table and community guidelines (§8, §9). |
| `/@demo` | A sample page, clearly labelled as written by the Poocho team. |

## Design

The idea comes from the Indian classroom chit (पर्ची): tear a strip from a ruled notebook, write a question, fold it, pass it on. The whole interface uses that vocabulary of ballpoint blue, ruled lines, the red margin and a haldi highlighter. Motion follows the same paper physics: chits are tossed, folded, stamped and unfolded. The full reasoning, tokens and layout sketches are in [`docs/creative/design-plan.md`](./docs/creative/design-plan.md).

- **Type:** Anek Devanagari (variable weight and width, from Indian foundry Ek Type) for UI and Hindi, and Kalam for anything handwritten. Both are self-hosted through Fontsource.
- **Motion:** [Motion](https://motion.dev) for the fold, fly, stamp and shared-layout unfold, plus one CSS scroll-timeline line. Every animation respects `prefers-reduced-motion` (`MotionConfig reducedMotion="user"`) and falls back to crossfades.
- **Cards:** drawn on a canvas by `lib/story-card.ts`, so the preview is pixel-for-pixel the PNG that gets shared. Text stays out of the zones Instagram covers.

## Architecture

```
app/
  actions.ts         Server actions: the only way the browser changes data
  api/inbox/         GET the signed-in host's profile and questions (the inbox polls it)
  u/[handle]/        Ask page, server-rendered from Postgres (/@handle rewrites here)
  sign-in/           Clerk sign-in
proxy.ts             Clerk middleware; /inbox and /settings need a session
neon.ts              Neon project config (`neon init`)
lib/server/
  schema.ts          Drizzle schema: profiles, questions, answers, ask_log
  db.ts              node-postgres pool + attachDatabasePool, as Neon recommends on Vercel
  repo.ts            Every query. Host data is always scoped to the Clerk user ID
drizzle/             Generated SQL migrations
lib/moderation.ts    Pre-delivery filter (runs on the server for real questions)
lib/story-card.ts    1080×1920 card renderer
tests/               node:test suites; repository tests run real SQL on PGlite
```

**Security model.** Clerk's proxy guards host pages. Every server action re-reads the user ID from the Clerk session, and every repository query filters by it, so one host can never read or change another's data (covered by tests). Ask pages send the browser only public profile fields.

**The Real Questions guarantee (US-6)** is enforced in code and in tests. `repo.askQuestion` is the only code that inserts into `questions`, and it stores only text a person sent. `tests/real-questions.test.ts` runs every host action against real SQL and scans the source for any other insert.

**Moderation and rate limits** run on the server before delivery. Askers are rate-limited to 5 questions per host per hour by a salted, daily-rotating hash of their IP and browser. Raw IPs are never stored, and hosts can't see the hash. Filtered questions and the ask log are deleted after 30 days.

## What's next

1. **Clerk production instance:** needs a domain you own, plus your own Google OAuth client for production sign-in.
2. **Server-side moderation model:** swap the heuristic filter for a hosted moderation API plus an LLM Hinglish classifier.
3. **SEO gate** (§12): index only host-approved, substantive answers, and generate OG images with the card renderer.
4. **Live updates:** move the inbox from polling to Neon Realtime once it supports per-host privacy.

Set `NEXT_PUBLIC_SITE_URL` in production so story cards and links show the real domain.
