# Communities, listings and launch day

Honest build stories, listings that also earn early backlinks, and the Product Hunt and Indie Hackers launch. Every link is tagged; see [utm-links.md](./utm-links.md).

## Reddit

Reddit rewards people who show up as builders, not advertisers. Read each subreddit's rules first: several only allow promotion in a weekly thread or on certain days. Post from your personal account, reply to every comment within the first two hours, and never ask for upvotes.

### r/SideProject (Tue 10 Nov)

**Title:** I built an anonymous Q&A link that can't send fake questions, after the FTC caught NGL doing it

> Hi r/SideProject! I'm a solo builder from Lucknow.
>
> In 2024 the FTC found that NGL, the biggest "ask me anything" link app, was sending users computer-written questions to keep them hooked, and selling "hints" about who asked that didn't actually reveal anyone. People loved the idea; the product was tricking them.
>
> So I built **Poocho** around the opposite rules:
> - Every question in your inbox was typed by a person. There's a test in the codebase that fails the build if any code path could insert one that wasn't.
> - Nobody can pay to find out who asked. No hints, no reveals.
> - Questions are moderated before you see them. Cruel ones go to a Filtered folder you can choose never to open.
> - Answers become 1080 × 1920 story cards.
> - Adults only, and English + Hindi.
>
> Stack: Next.js 16 (App Router, Cache Components), Clerk for sign-in, Neon Postgres with Drizzle, story cards drawn on a canvas so the preview is pixel-for-pixel the PNG you share.
>
> Try the demo (no sign-up): https://poocho.vercel.app/@demo
> Or get a link: https://poocho.vercel.app/?utm_source=reddit&utm_medium=community&utm_campaign=build_story
>
> What would make you trust an anonymous app more? Brutal feedback welcome.

### r/IndiaStartups (Thu 12 Nov, or that week's self-promotion thread)

**Title:** Building an India-first anonymous Q&A for Instagram stories. Week 2 numbers and what I got wrong

> Two weeks ago I launched Poocho, an anonymous question link for Instagram stories, built in Lucknow with a Hindi UI from day one.
>
> Numbers so far: {hosts} hosts, {questions} questions, {filtered}% filtered as abusive, {activation}% of new hosts got a real question within 48 hours.
>
> What I got wrong: {one honest lesson}. What worked: seeding 20 micro-creators by hand instead of running ads.
>
> The positioning is trust: no fake questions (the FTC acted against NGL for that in 2024), no paid hints, abuse filtered before you read it, 18+ only. Happy to share anything about seeding creators or building with Next.js + Neon on Vercel's Singapore region.
>
> https://poocho.vercel.app/?utm_source=reddit&utm_medium=community&utm_campaign=build_story

### r/developersIndia (on their showcase day)

**Title:** Show and tell: a test that guarantees no fake questions ever reach an inbox

> Side project: Poocho, an anonymous Q&A site. The product promise is "every question is from a real person", so I made it a test rather than a policy.
>
> The repository's `askQuestion` is the only function allowed to insert into `questions`. A test runs every host action against real SQL in PGlite (in-process Postgres) and asserts the inbox count never moves, then scans the source for any other insert into that table. If someone adds a "starter question" feature, CI goes red.
>
> Other bits that might interest you: story cards drawn on canvas (text kept out of the zones Instagram covers), a salted, daily-rotating hash for per-asker rate limits so raw IPs are never stored, share images rendered with Satori, and Hindi share images prerendered in Chromium because Satori can't shape Devanagari.
>
> Demo: https://poocho.vercel.app/@demo. Happy to answer questions about Next.js 16 Cache Components, Clerk or Neon.

### Answering "is NGL safe?" threads

Only reply where the question is genuinely being asked, and lead with help rather than a link:

> Worth knowing: in July 2024 the US FTC settled with NGL over sending fake messages and selling "hints" that didn't reveal senders, and NGL is now barred from users under 18 (FTC press release: https://www.ftc.gov/news-events/news/press-releases/2024/07/ftc-order-will-ban-ngl-labs-its-founders-offering-anonymous-messaging-apps-kids-under-18-halt). Whatever app you use, check that it promises real questions only, doesn't sell reveals, and filters abuse before you see it. (Disclosure: I build one of the alternatives, Poocho.)

Always include the disclosure.

## Directory listings

Submit all four in week 3 (16 to 22 November). Use `creatives/profile-avatar.png` as the logo and the Product Hunt gallery images as screenshots.

**Short description (≤ 140 characters):**
> Anonymous Q&A link for Instagram stories. Every question is from a real person, abuse is filtered first, answers become story cards.

**Long description:**
> Poocho gives you one link for anonymous questions. Share it on your Instagram story, WhatsApp status or bio; people ask without giving their name, and Poocho checks every question before it reaches you, moving insults, threats and personal details to a Filtered folder you can choose never to open. Answers become 1080 × 1920 story cards with your link on them. Poocho never sends fake questions and never sells hints about who asked, a promise written into its Real Questions Pledge and enforced by a test in its code. Free, adults only, in English and Hindi.

| Directory | What to fill in |
| --- | --- |
| **AlternativeTo** (alternativeto.net) | Add Poocho as an application (Platform: Online, License: Free). Then use "Suggest alternative" on the **NGL**, **Tellonym**, **CuriousCat** and **ASKfm** pages. Tags: anonymous-questions, q-and-a, instagram, privacy. Link: the AlternativeTo URL in utm-links.md |
| **SaaSHub** (saashub.com) | Submit product; category "Anonymous Q&A" or "Social Q&A". Mark it an alternative to NGL, Tellonym and Slido |
| **Peerlist** (peerlist.io) | Launch it as a Project from your profile. Tagline: *Anonymous Q&A where every question is real*. Add the stack (Next.js, Clerk, Neon, Vercel) |
| **BetaList** (betalist.com) | Submit as a startup. One-liner: *Anonymous questions for your story, with no fake questions*. The free queue can take weeks; submit on day 1 of week 3 |

## Product Hunt

**Launch:** Tuesday 24 November 2026 at 12:01 am Pacific (1:31 pm IST). Draft the page by Friday 20 November and schedule it. Go only if the go/no-go on 22 November passes.

**Name:** Poocho

**Tagline (60 max):** Anonymous Q&A where every question is from a real person

**Description (260 max):**
> One link for anonymous questions on your Instagram story. Poocho filters cruel questions before you see them, turns answers into story cards, and never sends fake questions or sells hints about who asked. Free, 18+, English and Hindi.

**Topics:** Social Media, Privacy, Messaging, Instagram

**Pricing:** Free

**Gallery, in order:**
1. `creatives/producthunt-1-hero.png`
2. A 20-second screen recording (GIF or MP4) of the homepage demo: a kind question flying to Inbox, a rude one stamped Filtered
3. `creatives/producthunt-2-filter.png`
4. `creatives/producthunt-3-pledge.png`
5. A phone screenshot of an answer story card

**Maker's first comment:**

> Hey Product Hunt 👋 I'm {name}, building Poocho from Lucknow.
>
> Anonymous "ask me anything" links are one of the most popular things on Instagram stories. They're also a category with a trust problem: in 2024 the FTC found the biggest app was sending users computer-written questions and selling "hints" that didn't reveal anyone.
>
> Poocho is built on the opposite promises, written down as the Real Questions Pledge:
> 1. Every question is from a real person. A test in the codebase fails the build if any code path could insert one that isn't.
> 2. No hints, clues or reveals about who asked, at any price.
> 3. Cruel questions are filtered before you see them, and you choose how strict.
> 4. Adults only.
> 5. Export or delete everything, any time.
>
> It's free, it works in English and Hindi, and askers need nothing but the link. Try the sample page without signing up: https://poocho.vercel.app/@demo
>
> I'd love your honest feedback, especially on what would make you trust an anonymous app.

**Launch-day plan (IST):**
- 1:31 pm: the page goes live. Post the first comment immediately.
- 1:45 pm: share on X, LinkedIn and Instagram stories with the Product Hunt link. Message the 20 Founding Creators and personal contacts asking them to try it and leave honest feedback. Ask for feedback and support, not "upvotes"; Product Hunt penalises vote rings.
- Every hour until midnight: reply to every comment.
- Next day: post the recap reel (reel 11) and thank everyone who commented.

## Indie Hackers (Wed 25 Nov)

**Title:** Launched yesterday: what 30 days of seeding 20 creators did for an anonymous Q&A app

> Poocho is an anonymous question link for Instagram stories, built solo from Lucknow. It launched on Product Hunt yesterday. Here's the playbook and the real numbers.
>
> **Positioning.** Trust over virality tricks: no fake questions, no paid hints, abuse filtered before you read it, 18+.
>
> **Distribution.** 40 DMs → {n} Founding Creators who posted their link weekly. Three reels a week on our own Instagram. Honest posts on Reddit. Four directory listings. Eight SEO guides (NGL alternative, Instagram how-to, safety checklist…), three of them in Hindi.
>
> **Numbers.** {hosts} hosts, {weekly answers} answers shared last week, {activation}% activation, viral conversion {viral}% from ask page to signup, D7 {d7}%.
>
> **What didn't work:** {honest}. **What's next:** {plan}.
>
> Happy to go deep on any of it. https://poocho.vercel.app/?utm_source=indiehackers&utm_medium=launch&utm_campaign=launch
