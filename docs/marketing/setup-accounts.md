# One-time setup: the switches only you can flip

The code for every item below is already in the app. Each step here is a setting in an account that only you can sign in to, and each takes a few minutes.

## Vercel Analytics and Speed Insights

The app now loads `<Analytics />` and `<SpeedInsights />`, but Vercel only starts recording once each product is switched on for the project.

1. Open Vercel → **ask-me-anything** → **Analytics** → **Enable**.
2. Open **Speed Insights** → **Enable**.
3. Redeploy production (or merge this change, which redeploys it).

Neither uses cookies, so no cookie banner is needed. Vercel Web Analytics shows UTM parameters, so the tagged links in [utm-links.md](./utm-links.md) show up by campaign. On the Hobby plan, check Vercel's current event limits and its non-commercial-use terms; move to Pro before any paid feature launches, as the playbook notes.

## PostHog

1. Create a free project at posthog.com. Choose the **EU** or **US** cloud; the app defaults to US.
2. In **Project settings**, turn on **Discard client IP data**. Askers' events already carry no browser ID, cookie or person; this keeps the server's IP out of PostHog too.
3. In Vercel → **Settings** → **Environment Variables**, add for Production and Preview:
   - `NEXT_PUBLIC_POSTHOG_KEY` = your project API key (starts with `phc_`)
   - `NEXT_PUBLIC_POSTHOG_HOST` = `https://us.i.posthog.com` (or `https://eu.i.posthog.com`)
4. Redeploy.

Without the key, PostHog never loads, so nothing breaks before you do this.

**Events the app sends**

| Event | Properties | Fired when |
| --- | --- | --- |
| `signup_started` | `step` | A signed-out visitor reaches the account step of `/start` |
| `signup_completed` | `method` (`google` or `email`) | The new host's link is created |
| `link_shared` | `channel` (`share_sheet`, `download`, `copy`) | A host shares or copies their link |
| `question_sent` | `mode` | Any question is sent (server-side, random ID) |
| `question_filtered` | `reason` | A question goes to Filtered (server-side, random ID) |
| `answer_published` | `template`, `public` | A host saves an answer |
| `card_shared` | `channel`, `template` | A host shares or saves an answer card |
| `ask_page_cta_clicked` | `placement` (`after_send`, `unclaimed`, `sample`) | An asker taps "Get your own link": the viral loop |
| `pwa_installed` | | The app is installed to a home screen |

`push_enabled`, the playbook's tenth event, will be added with push notifications, which aren't built yet.

**Three saved insights to create**

1. Funnel: `signup_started` → `signup_completed`, broken down by `$initial_utm_source`.
2. Funnel: `$pageview` where the URL contains `/@` → `ask_page_cta_clicked` → `signup_completed`. This is the viral conversion KPI.
3. Retention: identified users, `signup_completed` then any event, weekly, to read D7.

## Uptime monitor

1. Create a free account at uptimerobot.com (or Better Stack).
2. Add three HTTP(s) monitors at 5-minute intervals: `https://poocho.vercel.app/`, `https://poocho.vercel.app/@demo` and `https://poocho.vercel.app/api/health`.
3. Alert to your email and, if you use it, Telegram.

`/api/health` answers 200 when the app can reach the database and 503 when it can't, so a database outage alerts even when the homepage still loads. After Domain day, change the three URLs to poocho.app.

## The admin numbers page

`/admin` shows this week's hosts, answers, activation, active hosts, questions, filtered share and indexable profiles, plus a tagged-link builder. It's limited to Clerk user IDs you list:

1. In the Clerk dashboard → **Users**, open your own user and copy the ID (starts with `user_`).
2. In Vercel, add `ADMIN_USER_IDS` = that ID (comma-separate more than one) for Production.
3. Redeploy and open `https://poocho.vercel.app/admin` while signed in.

Everyone else gets a 404. The same numbers are in [weekly-review.sql](./weekly-review.sql) for the Neon SQL editor.

## Social profiles

Claim the same handle everywhere. In order of preference: **@poocho.app**, **@poochoapp**, **@getpoocho**. Use **Poocho** as the display name and `creatives/profile-avatar.png` as the photo on all three.

**Instagram bio (150 characters max)**

> Get asked anything. Only by real people. 🫶
> Anonymous Q&A for your story. No fake questions, ever. 18+
> ⬇️ Get your link

Link: the Instagram bio link from [utm-links.md](./utm-links.md).

**X bio**

> Anonymous questions from real people, filtered before you see them, answered as story cards. No fake questions, no paid hints. 18+. Built in India.

Header: `creatives/banner-x-1500x500.png`.

**LinkedIn company page**

- Tagline: *Anonymous Q&A where every question is real*
- About: *Poocho gives creators, teams and classrooms one link for anonymous questions. Every question is typed by a real person, cruel questions are filtered before anyone reads them, and answers become story cards. We never send fake questions and never sell hints about who asked. Adults only.*
- Banner: `creatives/banner-linkedin-1584x396.png`

**Then tell Google they belong together.** Add the three profile URLs to `SOCIAL_PROFILES` in `lib/seo.ts`. They go into the Organization structured data as `sameAs`, which helps Google show a brand panel for "Poocho".

## After each deploy

Run PageSpeed Insights (pagespeed.web.dev) on the homepage and `/@demo` with the **Mobile** tab. The target is LCP under 2.5 seconds. Speed Insights in Vercel then tracks the real-user number over time.

## Search Console and Bing

**Wait for Domain day.** Google should learn the final address first; submitting `poocho.vercel.app` now means migrating its signals later.

1. In Search Console, add a **Domain** property for `poocho.app` and verify it with the DNS TXT record it gives you (add it in Vercel → Domains → poocho.app → DNS records).
2. **Sitemaps** → submit `https://poocho.app/sitemap.xml`.
3. **URL Inspection** → request indexing for `/`, `/hi`, `/pledge`, `/guides`, `/alternatives/ngl` and `/guides/anonymous-questions-instagram-story`. While you're there, use **View crawled page** on `/@demo` to confirm the title sits in the head for Googlebot.
4. Add `https://poocho.vercel.app` as a URL-prefix property too, and use **Change of address** if Search Console offers it.
5. At bing.com/webmasters, sign in and choose **Import from Google Search Console**. Bing's index also feeds DuckDuckGo, Yahoo and several AI assistants.

IndexNow is already wired: its key file is live, and pings start automatically once the site runs on poocho.app.

## Sentry (optional)

Error tracking needs a Sentry account and DSN. When you're ready, run `npx @sentry/wizard@latest -i nextjs` on a branch, add `SENTRY_DSN` in Vercel, and check that the build still passes with Cache Components. It isn't part of this change because it needs your account and adds a build step.

## Domain day

When poocho.app is bought:

1. Vercel → **ask-me-anything** → **Settings** → **Domains**: add `poocho.app` and `www.poocho.app`. Make `poocho.app` the primary and set `www` to redirect to it.
2. **Environment Variables**: change `NEXT_PUBLIC_SITE_URL` (Production) from `https://poocho.vercel.app` to `https://poocho.app`.
3. Redeploy production. From that deploy on, the app itself 308-redirects every production request on `*.vercel.app` to poocho.app with the path and UTM tags intact, so every story card already shared keeps working. Keep that redirect forever. (You can also set `poocho.vercel.app` to redirect to `poocho.app` under **Domains**, so Vercel's edge does it before the app runs; having both is fine.)
4. Clerk: create the production instance on poocho.app (Clerk dashboard → **Deploy to production**), add the DNS records it lists, and swap the Clerk keys in Vercel.
5. Do [Search Console and Bing](#search-console-and-bing), update the uptime monitors, and swap the link in each social bio.
6. Find and replace `poocho.vercel.app` with `poocho.app` in this folder's docs. The images need no change.
