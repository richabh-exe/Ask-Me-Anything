# Poocho launch kit: marketing and advertising

This folder turns the *Poocho Launch Playbook: SEO, Monitoring & Marketing* (30 Oct 2026) into finished, ready-to-use material. Everything that can live in code is built and shipped in the app. Everything that needs a person, an account or a budget is written out here so it can be done in minutes rather than hours.

**About the domain.** poocho.app is not bought yet. Until it is, the site runs on `https://poocho.vercel.app`, and every link in this kit uses that address. When the domain is bought, follow [Domain day](./setup-accounts.md#domain-day): one environment variable changes, production starts redirecting `*.vercel.app` to poocho.app with a permanent redirect (path and UTM tags intact), and every link already shared keeps working. No image in `creatives/` prints the domain, so none of them needs re-rendering.

## What's in here

| File | Use it for |
| --- | --- |
| [setup-accounts.md](./setup-accounts.md) | The one-time account settings: Vercel Analytics, PostHog and `/admin` (all done), then the uptime monitor, social profiles, Search Console, Bing and Domain day |
| [creator-seeding.md](./creator-seeding.md) | Finding and signing the 20 seeded creators: criteria, DMs in English and Hinglish, follow-ups, weekly asks |
| [creators.csv](./creators.csv) | The tracker for those 20 creators (open in Google Sheets) |
| [content-calendar.md](./content-calendar.md) | 12 reel scripts for Poocho's Instagram, the carousel, WhatsApp status copy, and four build-in-public posts |
| [community-and-launch.md](./community-and-launch.md) | Reddit posts, directory listings (AlternativeTo, SaaSHub, Peerlist, BetaList), the Product Hunt kit and the Indie Hackers post |
| [press-pitch.md](./press-pitch.md) | Pitches for YourStory, Inc42 and campus media, plus a press fact sheet |
| [campus-ambassadors.md](./campus-ambassadors.md) | The 18+ campus ambassador programme and the seniors' AMA playbook |
| [paid-ads-test.md](./paid-ads-test.md) | The ₹5,000 Instagram ads test for month 2, with its gate, audiences, creatives, copy and kill rules |
| [utm-links.md](./utm-links.md) | Every tagged link for every channel, ready to paste |
| [weekly-review.sql](./weekly-review.sql) | The playbook's user-count queries, rewritten for Poocho's schema |
| [monday-review.ics](./monday-review.ics) | A recurring 15-minute Monday review; open it to add it to Google Calendar |
| [creatives/](./creatives) | 19 finished images: four story ads, two feed ads, a six-slide carousel, a Pinterest pin, X and LinkedIn banners, a profile avatar and three Product Hunt gallery images |

Re-render the images after any copy change with `npm run creatives` (needs Playwright with Chromium).

## Master checklist

Ticked items are done and live in this change. Unticked items need your accounts or your hands, and each one links to the exact steps.

### Domain

- [ ] Buy poocho.app (you, later) → [Domain day](./setup-accounts.md#domain-day)
- [ ] Add poocho.app and www in Vercel; make poocho.app primary → [Domain day](./setup-accounts.md#domain-day)
- [x] Permanent redirect from `*.vercel.app` to the real domain. Built into `proxy.ts`; it switches on by itself when `NEXT_PUBLIC_SITE_URL` changes
- [x] One setting for the site address. `NEXT_PUBLIC_SITE_URL` drives canonicals, the sitemap, share images, story cards and every printed link; there were no hard-coded `poocho.vercel.app` strings left to replace

### Technical SEO

- [x] `app/robots.ts` (host screens, `/admin` and `/api` disallowed)
- [x] `app/sitemap.ts`: home in both languages, pledge, guides hub, every guide, and only the ask pages that pass the indexing gate (3 public answers of 120+ characters to clean questions, a week-old account, inbox not paused)
- [x] Self-canonical on every page, hreflang for English and Hindi pairs, `summary_large_image` everywhere. Canonicals are set per page on purpose: one in the root layout would have pointed every forgotten page at the homepage
- [x] Share images: homepage, every guide, the pledge, the hub, and every ask page (handle, prompt and latest public answer). Hindi images are rendered in Chromium because the share-image engine cannot shape Devanagari
- [x] Ask pages: "Ask @handle anything" titles, descriptions from the prompt, noindex until they pass the gate, and `/@demo` always noindex
- [x] Organization, WebSite, ProfilePage, Article and BreadcrumbList structured data. `sameAs` fills in from `SOCIAL_PROFILES` in `lib/seo.ts` once the profiles exist
- [ ] PageSpeed check on mobile after deploy → [setup-accounts.md](./setup-accounts.md#after-each-deploy)

### Getting listed

- [ ] Search Console domain property and sitemap (after Domain day) → [steps](./setup-accounts.md#search-console-and-bing)
- [ ] Request indexing for `/`, `/hi`, `/pledge`, `/guides` and the two lead guides
- [ ] Bing Webmaster Tools, imported from Search Console
- [x] IndexNow key (`public/af6a0850195b35b59f1eb4e91d93b7b5.txt`) and a ping whenever a profile that passes the gate publishes an answer. Pings stay off until the site is on its own domain

### Monitoring

- [x] Vercel Web Analytics and Speed Insights, switched on and live in production
- [x] PostHog live in production with nine of the ten playbook events; askers never identified, no question text, no session replay, client IPs discarded. `push_enabled` waits until push notifications exist
- [x] PostHog [launch dashboard](https://us.posthog.com/project/698222/dashboard/2280231): north star, share channels, sign-up funnel, viral loop, retention, filtered questions
- [x] `/admin` numbers page, open to the founder's account, and [saved SQL](./weekly-review.sql)
- [x] `/api/health` for the uptime monitor
- [ ] UptimeRobot watching `/`, `/@demo` and `/api/health` → [steps](./setup-accounts.md#uptime-monitor)
- [ ] Sentry: optional, needs your Sentry account → [notes](./setup-accounts.md#sentry-optional)
- [x] Privacy copy on `/pledge#analytics` names every analytics tool

### Marketing

- [ ] Instagram, X and LinkedIn profiles with the same name, logo and link → [handles, bios and art](./setup-accounts.md#social-profiles)
- [ ] 20 seeded creators confirmed → [creator-seeding.md](./creator-seeding.md)
- [x] First two guides published (NGL alternative, Instagram how-to), plus six more and three in Hindi
- [ ] AlternativeTo, SaaSHub, Peerlist and BetaList listings → [copy for each](./community-and-launch.md#directory-listings)
- [x] Product Hunt page drafted → [the kit](./community-and-launch.md#product-hunt)
- [ ] Press pitch sent → [pitches](./press-pitch.md)
- [ ] Monday review on the calendar → open [monday-review.ics](./monday-review.ics)

## The 30-day calendar (2 to 29 November 2026)

**Week 1, Foundations (Mon 2 to Sun 8 Nov).** Merge this change and flip the switches in [setup-accounts.md](./setup-accounts.md). Create the three social profiles. Send the first creator DMs (aim for 40 sent to land 20). Post reels 1 to 3. Publish the story-prompts carousel.

**Week 2, Seed (Mon 9 to Sun 15 Nov).** First Monday review on 9 Nov. Creator AMAs start: each seeded creator posts one "Ask me" story this week. Post reels 4 to 6. Share the Reddit build story in r/SideProject on Tuesday and answer "is NGL safe?" threads where it genuinely helps. First build-in-public post with real numbers.

**Week 3, Spread (Mon 16 to Sun 22 Nov).** Recruit campus ambassadors and run the first seniors' AMA. Submit the four directory listings. Post reels 7 to 9. Check Search Console (once the domain is live) for indexed pages and queries.

**Go/no-go on Sunday 22 Nov.** Launch only with at least 100 hosts and 40% activation (new hosts who got a real question within 48 hours; `/admin` shows both). If either is short, move Product Hunt back two weeks and spend them on more seeded creators. A launch only helps when visitors find real activity.

**Week 4, Launch (Mon 23 to Sun 29 Nov).** Send the press pitches on Monday 23 Nov with the Tuesday launch named. Launch on Product Hunt on **Tuesday 24 Nov** at 12:01 am Pacific (1:31 pm IST). Post on Indie Hackers on Wednesday 25 Nov. Post reels 10 to 12. At the end of the week, reset the KPI targets below using four weeks of real numbers.

## KPIs and targets

The north-star metric is **weekly shared answers**. These targets are the playbook's starting guesses for a solo launch; reset them after the week-2 review.

| Metric | Definition | Day 30 | Day 90 | Where to read it |
| --- | --- | --- | --- | --- |
| Weekly shared answers | Answers published or shared as cards in the last 7 days | 300 | 2,500 | `/admin`, PostHog `answer_published` + `card_shared` |
| Total hosts | Accounts with a claimed link | 300 | 2,000 | `/admin` |
| Activation | New hosts with a real question within 48 hours | 50% | 55% | `/admin` |
| Weekly active hosts | Hosts who answered in the last 7 days | 30% of hosts | 30% of hosts | `/admin` |
| Viral conversion | Ask-page visitors who tap "Get your own link" and sign up | 3% | 4% | PostHog funnel `ask_page_cta_clicked` → `signup_completed` |
| Host D7 retention | New hosts returning on day 7 | 20% | 25% | PostHog retention on identified users |
| Filtered rate | Share of questions filtered as abusive | Watch only | Watch only | `/admin`; investigate above 15% |
| Indexed pages | Pages Google has indexed | 15 | 60 | Search Console |
| Organic clicks | Monthly clicks from Google | 100 | 1,000 | Search Console |
| Mobile LCP | 75th-percentile load time on phones | Under 2.5 s | Under 2.5 s | Vercel Speed Insights |
| Uptime | Time the site is reachable | 99.5% | 99.9% | UptimeRobot |

## The Monday review (15 minutes)

Open `/admin` and copy the six tiles into the KPI table. In Vercel Analytics, note visitors, top referrers and the UTM campaigns that brought them. In the [PostHog launch dashboard](https://us.posthog.com/project/698222/dashboard/2280231), read the sign-up funnel, the viral loop and weekly retention. In Search Console, note clicks, impressions and newly indexed pages. Check UptimeRobot for any downtime. Then write one build-in-public post from those numbers, using the template in [content-calendar.md](./content-calendar.md#build-in-public).
