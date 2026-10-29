# PRD: "Poocho" (working name) — A Safe, Verified-Real, SEO-First AMA & Anonymous Q&A Platform

**Bottom line:** Build a mobile-first PWA where hosts (18+) collect questions through a link, choose per link whether askers stay anonymous or show identity, answer in story-ready cards, and publish moderated answers as indexable pages. The wedge is that every question is guaranteed real (no bot "engagement" messages) and AI-filtered before it reaches the host. The category's two biggest winners were both pursued by the FTC for doing the opposite, and the older alternatives (CuriousCat, ASKfm, Retrospring) have all shut down.

## TL;DR
- **The opportunity is real, but the market has been burned.** On July 9, 2024, NGL Labs and its co-founders agreed to a $5 million settlement with the FTC and the LA DA: $4.5M in consumer redress and a $500,000 civil penalty. They are banned from serving under-18s for sending fake questions and selling useless "hints." On September 29, 2025, the DOJ, on FTC referral, sued Sendit's operator Iconic Hearts and its CEO Hunter Rice on similar grounds (still pending). CuriousCat (October 2024), ASKfm (December 2024) and Retrospring (September 2025) all closed.\[1\]\[2\]\[3\] Demand persists, and no trustworthy, creator-grade platform remains.
- **Launch 18+ only, with email magic-link + Google sign-in, a web-native share flow, and no Instagram Login at MVP.** Meta shut down the Instagram Basic Display API on December 4, 2024. Its replacement serves only Business/Creator accounts and needs app review.\[4\] Instagram's official "Sharing to Stories" works only from native apps with a registered Facebook App ID.\[5\]\[6\] So the PWA should share generated 1080×1920 story cards through the Web Share API, and the official native flow should come later in a wrapper app.
- **Differentiate on pain points with proven demand:** (1) verified-real questions, (2) AI abuse filtering, (3) polished story cards, (4) a live, upvoted AMA mode for events and teams, and (5) creator monetization through paid priority questions. SEO answer pages are a growth engine, not a proven user demand. Ship them with strict indexing rules: only host-approved, moderated, substantive answers.

---

## 0. Assumptions applied
- **Audience:** Global, with India (Hindi + English first) as the launch market.
- **Platform:** Mobile-first PWA before native apps. A native wrapper (Capacitor) comes in V2, mainly to unlock the official Instagram/Snapchat story SDKs.
- **Business model:** Freemium.
- **Team:** A solo developer (JS/TS/React/Node) or a team of 2–3.
- **Age policy (research-driven recommendation):** 18+ only for hosts and askers at launch. Three things make a teen product legally and operationally out of reach for a solo developer: the FTC's NGL order, Apple's February 2026 rule change for anonymous chat apps, and India's DPDP rule requiring verifiable parental consent for under-18s.\[7\]\[8\]\[9\]

---

## 1. Glossary

| Term | Meaning in this project |
|---|---|
| **PRD** | Product Requirements Document: the single source of truth for what to build and why. |
| **MVP** | Minimum Viable Product: the smallest version that proves hosts will share links and askers will send real questions. |
| **User persona** | A research-based representative user. |
| **User story** | "As a [persona], I want [capability] so that [benefit]." |
| **Acceptance criteria** | Testable Given/When/Then conditions that define "done." |
| **JTBD** | Jobs-To-Be-Done: the progress a user "hires" the product to make. |
| **North-star metric** | The one metric that best captures delivered value. |
| **KPI** | Key Performance Indicator: a supporting metric (activation, retention, revenue). |
| **MoSCoW** | Must / Should / Could / Won't have. |
| **Funnel** | The conversion path: visit → sign up → share link → first question → first answer. |
| **Retention** | % of users returning after N days (D1/D7/D30). |
| **DAU/MAU** | Daily / Monthly Active Users; DAU÷MAU = "stickiness." |
| **Viral loop / k-factor** | k = invites per user × conversion rate; k > 1 means growth sustains itself. |
| **PWA** | Progressive Web App: an installable website with offline caching and push notifications. |
| **SSR / SSG / ISR** | Server-side, static, or incremental static rendering: pre-rendered HTML that Google can index. |
| **Core Web Vitals** | Google's UX metrics: LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1. |
| **Schema markup / JSON-LD** | Structured data that tells search engines what a page contains (QAPage, ProfilePage…). |
| **OAuth / OIDC** | Standard "Sign in with Google" protocols that avoid handling passwords. |
| **Magic link** | Passwordless email sign-in link. |
| **Rate limiting** | Capping requests per IP/device/account per time window. |
| **Content moderation / T&S** | Detecting and acting on harmful content (AI, humans, user reports); Trust & Safety is the function that owns it. |
| **CSAM** | Child sexual abuse material: zero tolerance, detect, report. |
| **Data fiduciary** | DPDP Act term for the entity that decides how personal data is used (you). |
| **Pseudonymous ID** | An internal hash that links actions for abuse prevention without exposing identity. |

---

## 2. Executive summary & product vision

**Vision:** "Ask anything — honestly, safely, and publicly when it matters." Poocho is the trustworthy home for AMAs. Creators, educators, founders and companies collect questions from anywhere (Instagram, WhatsApp, X, live events), answer them well, and turn the best answers into a searchable, shareable archive.

**Why now:**
1. **The category leaders are discredited.** According to the FTC's July 9, 2024 press release, "after failing to generate much interest in its app, NGL in 2022 began automatically sending consumers fake computer-generated messages that appeared to be from real people," such as "are you straight?" or "I know what you did." It then pushed users toward a $9.99 subscription for "hints" about who sent them. The 2024 order bans NGL from offering the app to minors. On September 29, 2025, the DOJ, on FTC referral, filed a complaint against Sendit's operator, Iconic Hearts, and its CEO Hunter Rice in the Central District of California under COPPA, the FTC Act and ROSCA. It alleges fake messages used to sell a "Diamond Membership" costing up to $9.99/week, and data collection from 116,000+ self-reported under-13 users in 2022.
2. **The cleaner incumbents have exited.** CuriousCat announced it would be discontinued on October 7, 2024, citing prolonged deficits.\[10\] ASKfm had 215 million registered users as of 2017. It discontinued services on December 1, 2024, citing "a significant decline in our user base." Wikiwand reports the brand was reacquired and relaunched in 2026 at askfm.app (not verified). Retrospring was volunteer-run and open source. It went read-only on March 1, 2025 and closed on September 1, 2025.\[3\]\[11\]\[12\]
3. **Demand persists.** When Snap suspended YOLO and LMK in May 2021, Sendit gained more than 3.5 million installs across iOS and Android in roughly 80 days, according to Apptopia data reported by TechCrunch. TechCrunch noted the ban "only crowned a new app as the market leader." Tellonym still lists 10M+ Google Play installs and a 4.3★ rating from ~352K ratings.\[13\]
4. **Platforms won't fill the gap.** Instagram told Fast Company: "There is no anonymous version of the questions sticker… we have no plans to test anything like this."\[14\]

**Positioning:** "The NGL alternative you can trust," plus "the free Slido for small rooms." One engine (questions → moderation → answers → shareable cards/pages) serves both consumer creators and professional use cases.

---

## 3. Problem statement & opportunity

### 3.1 Problems
- **Creators:** Instagram's Question sticker is not anonymous. Instagram says responses can be found "in your story's viewers list."\[14\] When it launched, users complained: "Someone shoulda told me the Instagram 'Ask me a question' thing was not anonymous."\[15\] The anonymous apps that remain expose creators to fake questions, paywalls and hate.
- **Askers:** They hold back honest questions when their identity is visible, and they distrust "anonymous" apps after the NGL/Sendit revelations.
- **Teams/events:** Slido's free plan caps at 100 participants per event, and paid plans bill annually only.\[16\]\[17\]\[18\] That is expensive overkill for a monthly town hall at an Indian startup or college.
- **Everyone:** Answers vanish after 24h (Stories) or are trapped in apps that shut down without portability.

### 3.2 Market size
| Indicator | Figure | Source / caveat |
|---|---|---|
| India active creators | 2–2.5M (1,000+ followers); only 8–10% monetize effectively | BCG, *From Content to Commerce*, May 2025\[19\]\[20\] |
| India creator-influenced spend | $350–400B/yr → $1T+ by 2030; direct creator revenue $20–25B → $100–125B by 2030 | BCG 2025\[21\]\[22\] |
| Global app IAP revenue | $167B in 2025 (+10.6% YoY); India led downloads with 25.5B installs | Sensor Tower State of Mobile 2026\[23\]\[24\] |
| Audience response software | ~$1.2B (2025) → ~$2.5B (2034), ~8.7–9.2% CAGR | Verified Market Reports; other firms range $0.54B–$2.58B for 2025, so directional only\[25\]\[26\]\[27\]\[28\] |
| Slido scale | 240M+ engaged participants, 1.24M+ customers, 8M+ meetings\[29\] | Slido "About" page (company-reported) |
| Mentimeter scale | 270M users by 2021 (Wikipedia) vs. "100 million users" (TrustRadius)\[30\]\[31\] | Conflicting secondary sources |
| NGL traction | 15M installs and $2.4M revenue by July 2022; Sensor Tower's recent US estimate ~700k downloads and ~$600k revenue in a month | TechCrunch 2022; Sensor Tower public page (model estimates)\[32\]\[33\]\[34\] |
| Sendit traction | 30M+ downloads;\[35\] by mid-2021 "regularly exceeding 10,000-20,000 per day" | The Cyber Express, reporting on the FTC complaint; FTC complaint |
| Tellonym traction | 10M+ Play installs (AppBrain estimates ~33M); 4.3★ (352K) Android, 4.5★ (141K) iOS\[13\]\[36\] | Store listings / AppBrain |
| Topmate (India paid Q&A) | "₹100+ crore" paid to creators; "4.8 million+ bookings"\[37\] | Topmate homepage (company-reported) |
| Marshmallow (Japan, AI-filtered anonymous Q&A) | 1,847 MAU (Nov 2017) → ~1.06M MAU (May 2018)\[38\] | Company press release, PR TIMES |

**Interpretation:** No reliable market size exists for "anonymous Q&A" as a category. The individual hits show demand that is viral but spiky: NGL reached 15M installs in months, Sendit 30M+, Tellonym 10M+. The professional engagement market (~$1.2B) is smaller but monetizes reliably. So acquire users through the consumer loop and earn revenue from creators and teams.

---

## 4. Competitive landscape

### 4.1 Feature comparison matrix

| Product | Status (Oct 2026) | Anonymity | Sharing | Moderation | Monetization | Weakness / lesson |
|---|---|---|---|---|---|---|
| **NGL** | Active; under FTC order (2024) | Anonymous | Link in IG/Snap stories; answer cards | Claimed "world class AI content moderation"; FTC calls the claim false\[39\] | "Hints" $9.99/week (2022), then $6.99/week | Fake bot questions; deceptive subscription\[7\]\[40\]\[41\] |
| **Sendit** | Active; DOJ/FTC suit pending (Sept 29, 2025) | Anonymous | Snapchat/IG | Weak; under-13 users | "Diamond" up to $9.99/week\[42\] | Fake messages; alleged COPPA violations\[43\] |
| **Tellonym** | Active (Berlin, 2016)\[44\] | Anonymous or public | Shares Q&As to Snap/IG\[36\] | Word filters, blocks\[45\] | In-app purchases | Cyberbullying reputation; App Store 17+\[44\]\[45\] |
| **ASKfm** | **Shut down Dec 1, 2024**\[2\] | Both | Profiles | Long criticized over bullying | Ads | Toxicity + monetization failure |
| **CuriousCat** | **Shut down Oct 2024**\[1\] | Anonymous | Twitter-centric | Minimal | Ads | Years of deficits; lost its domain in Dec 2021\[1\]\[10\] |
| **Retrospring** | **Closed Sept 1, 2025** (AGPL code remains)\[3\]\[10\] | Both | Basic | Volunteer | None | Volunteer burnout; no business model |
| **Sarahah** | Faded after its 2017–18 peak (not re-verified) | Anonymous | Snap link | Weak | — | Hype without safety |
| **YOLO / LMK** | Snap Kit integrations suspended May 2021 | Anonymous | Snapchat | Inadequate | — | Platform dependency: one lawsuit killed distribution\[46\]\[47\] |
| **Marshmallow (JP)** | Active | Anonymous | X/Twitter | **AI removes negative messages**; Premium can switch the filter off\[48\]\[49\] | Premium | Politely worded abuse still gets through\[50\] |
| **IG Question sticker** | Native | **Not anonymous**\[51\] | Native | Instagram | Free | No anonymity; expires in 24h |
| **Slido (Cisco)** | Active | Anonymous or named\[52\] | Webex/Teams/PPT | Moderation on Professional+ | Free ≤100/event; annual plans only\[18\] (prices conflict, §15) | Event-only; no creator use case\[16\]\[17\]\[25\] |
| **Mentimeter** | Active | Anonymous | Presentations | Basic | Free plan capped at 50 participants/month\[53\] | Presentation-first, not AMA-first |
| **Pigeonhole Live, Vevox** | Active (not re-verified) | Anonymous options | Events/enterprise | Moderation | Per-event/annual | Enterprise sales; no consumer virality |
| **Reddit AMA / Quora** | Active | Pseudonymous | Strong SEO | Community mods | Ads | Hosts don't own their audience |
| **Topmate** | Active (India) | Identified | Link-in-bio | — | 10% fee (20% via marketplace) + 2–6% gateway; Priority DM e.g. ₹500–2,000\[37\]\[54\]\[55\] | Paid only; no free/anonymous layer |
| **Cameo, Passes, paid-DM tools** | Active (not re-verified) | Identified | Creator links | Platform | Paid messages | Premium-only; no Q&A archive |
| **Discord/Twitch Q&A bots** | Many | Varies | In-platform | Server mods | Free | Locked to one platform |

### 4.2 Lessons learned (design rules)
1. **Never fabricate engagement.** The FTC quoted an NGL internal message: "there's people sharing the [NGL App link] EVERY day and all they get is fake questions 😂."\[56\] Poocho labels every system prompt "From Poocho" and never puts one in the inbox as if a person sent it.
2. **Never sell de-anonymization.** "Hints" were the core of both deception cases.\[7\]\[41\]\[43\]\[57\]
3. **Don't market to minors, and don't overclaim AI moderation.**\[7\]
4. **Don't depend on one platform's SDK.** On May 10, 2021, Kristin Bride sued over the death of her 16-year-old son Carson. The next day, May 11, Snap suspended YOLO's and LMK's Snap Kit integrations "out of an abundance of caution for the safety of the Snapchat community." In 2022 it banned anonymous messaging apps from Snap Kit for new developers.
5. **Have a business model and data portability from day one** (the lesson of the CuriousCat, Retrospring and ASKfm closures).

---

## 5. Target users, personas & segments

### 5.1 Segments

| Segment | Size signal | Underserved? | Priority |
|---|---|---|---|
| **Creators (micro/mid-tier)** | 2–2.5M Indian creators (BCG)\[21\] | **High**: IG sticker isn't anonymous; NGL-type apps are distrusted | **P0** |
| **College students/young adults 18–24** | Drove NGL/Sendit/Tellonym virality | High, but legally sensitive near minors | **P0** (18+ gate) |
| **Educators & coaching (India)** | Large | Medium: Slido/Mentimeter free tiers capped | P1 |
| **Company town halls / HR feedback** | Slido 1.24M+ customers | Medium: annual-only pricing hurts SMBs | P1 (Teams) |
| **Founders (product AMAs)** | Product Hunt / X communities | Medium: want SEO + an archive | P1 |
| **Speakers, podcasters, streamers** | Growing | Medium: need live upvotes + overlay | P2 |
| **Communities (Discord, WhatsApp groups)** | Large in India | Medium | P2 |
| **Dating/"ask me" games** | Large | High risk, low trust | **Won't** |
| **Under-18 users** | Historically the largest viral pool | — | **Excluded** |

### 5.2 Personas
1. **Ananya, 24, Lucknow micro-creator (18K IG followers, Hindi/English).** JTBD: "Get followers talking without getting trolled, and turn the best answers into content."
2. **Rohan, 21, engineering student, Pune.** JTBD: "Run a fun anonymous AMA on my story." Pains: fake questions, "who sent this" paywalls.
3. **Priya, 34, HR lead at a 120-person Bengaluru startup.** JTBD: "Honest all-hands questions without an annual Slido contract."
4. **Dr. Mehta, 45, coaching educator.** JTBD: "Let shy students ask doubts anonymously."
5. **Sam, 29, indie founder.** JTBD: "A product AMA whose answers rank on Google and become my FAQ."

---

## 6. Validated unique value propositions (with demand evidence)

Each feature is scored 1–5 on (a) evidence of demand, (b) size of the competitor gap, and (c) feasibility.

| # | Feature | Demand evidence | (a) | (b) | (c) | Phase |
|---|---|---|---|---|---|---|
| 1 | **Verified-real questions** (badge + public policy) | NGL's App Store reviews were full of "bot," "fake questions" and "scam" (TechCrunch keyword analysis, 2022). One review warned: "do not listen to the fake 5 star reviews." TechCrunch received "questions" on a link it never shared.\[32\]\[58\]\[59\] FTC/DOJ actions against both leaders.\[60\]\[61\] | 5 | 5 | 5 | MVP |
| 2 | **AI abuse filter + host-set strictness** | The FTC says users described NGL messages as "invasive," "anxiety inducing," and "hateful." NBC got "You're fat" and "Everyone hates you" through NGL's filters. A Tellonym reviewer asked for "regulating the anonymous messages via flagged words or phrases." Marshmallow grew from 1,847 to ~1.06M MAU in seven months on the promise that "AI quietly removes negative content."\[38\]\[48\]\[56\]\[62\]\[63\] | 5 | 4 | 4 | MVP |
| 3 | **Story-ready answer cards + one-tap share** | Answer-to-story is the core loop of NGL and Tellonym ("Share anonymous Q&A's to Snapchat and Instagram").\[59\] Instagram won't build an anonymous sticker.\[14\]\[57\]\[64\] | 5 | 3 | 4 | MVP |
| 4 | **Per-link anonymity toggle** | Tellonym and ASKfm supported both modes; askers were burned by the non-anonymous IG sticker; Slido offers both.\[2\]\[15\]\[52\] | 4 | 3 | 5 | MVP |
| 5 | **Live AMA mode with upvoting** | Slido calls audience Q&A its "most used feature." It logged 20M+ questions by 2020 and reports 240M+ participants.\[29\]\[65\]\[66\] | 4 | 3 | 4 | V1 |
| 6 | **Data export + permanence** | CuriousCat users were left "scrambling"; Retrospring told users to export; ASKfm closed with 215M users.\[2\]\[10\]\[12\] | 3 | 4 | 5 | MVP |
| 7 | **Paid priority questions (refund if unanswered)** | Topmate's Priority DM ("If you miss it, the buyer gets a full refund") and ₹100+ crore paid to creators.\[37\] | 3 | 4 | 3 | V1 |
| 8 | **Hindi/Indian-language UI and moderation** | India led 2025 downloads (25.5B); BCG highlights vernacular trust;\[23\]\[67\] Tellonym already offers Hindi.\[68\] | 3 | 4 | 3 | MVP (Hindi/Hinglish) |
| 9 | **AI clustering/dedup** | Duplicate questions flood large AMAs; upvoting only partly fixes this. | 3 | 3 | 4 | V1 |
| 10 | **SEO-indexed answer pages** | No direct user demand found; a growth bet (the Reddit AMA/Quora model). | 2 | 4 | 4 | MVP (opt-in) |
| 11 | **Private team AMAs (SSO, domain lock)** | Slido's enterprise traction\[25\] | 3 | 3 | 3 | V1–V2 |
| 12 | **Video/audio answers; widget; analytics** | Weak direct evidence | 2 | 2–3 | 3–4 | V2 |
| ✗ | **"Reveal sender"/hints** | Demand exists, but this was the core of the FTC's deception claims\[7\]\[57\] | — | — | — | **Never** |

**Takeaway:** The top three features rest on the strongest evidence and are cheap to build, so they are the MVP. One honest limit: no Reddit thread directly requesting an anonymous IG sticker was found. The demand for features 3–4 is inferred from press coverage, tweets and NGL/Tellonym usage.

---

## 7. Feature requirements (MoSCoW, phased)

### 7.1 MVP (weeks 0–10): "Ask, filter, answer, share"
**Must have**
1. Host signup (email magic link + Google), 18+ DOB check, unique handle (poocho.app/@ananya).
2. Public ask page. Per-link mode: *Anonymous*, *Named* (asker signs in), or *Asker's choice*.
3. Anonymous asking with no signup (Turnstile + rate limits).
4. Pre-delivery AI moderation: toxicity, harassment, sexual content, self-harm, threats, PII/doxxing. Three strictness levels; flagged items go to a hidden "Filtered" folder.
5. Answer composer → auto-generated story card (templates, Hindi fonts).
6. Sharing via the Web Share API with an image file; fallback is download + copy link.
7. Public profile showing host-approved answers.
8. Report/block/mute, keyword blocklist, "pause inbox."
9. A "Real questions only" policy page; system prompts clearly labeled.
10. Data export (JSON + CSV) and account deletion.
11. Terms, Privacy (DPDP/GDPR-aligned), Community Guidelines, Grievance Officer contact.

**Should have:** PWA install + push, Hinglish moderation tuning, 5 templates, basic counts.
**Could have:** Prompt ideas, dark mode.
**Won't (MVP):** Native apps, Instagram Login, payments, live mode, video, minors.

### 7.2 V1 (months 3–5)
Live AMA sessions (scheduling, real-time upvotes, moderation queue, presenter view, QR code, recap page), AI clustering and "top themes," paid priority questions (Razorpay + Stripe), Creator Pro, Teams beta (domain-restricted, member-only anonymous questions), more Indian languages.

### 7.3 V2+ (months 6–12)
Capacitor wrapper with official Instagram "Sharing to Stories" and Snapchat Creative Kit; optional Instagram verification (Instagram API with Instagram Login, professional accounts only); video/audio answers; embeddable widget; stream overlay; Slack/Teams/Discord bots; SSO; analytics.

### 7.4 User stories & acceptance criteria

**US-1 Host onboarding:** As a creator, I want my link within 60 seconds so I can post it to my story.
- Given Google OAuth succeeds, a DOB ≥18 and a handle are entered, when the user submits, then a profile and a default anonymous link are created and the share sheet opens.
- Handle availability is checked in real time; reserved/offensive handles are blocked.
- DOB <18 → no account is created, and no data is kept beyond the attempt log.

**US-2 Anonymous ask:** As a follower, I want to ask without an account so I feel safe being honest.
- The ask page reaches LCP ≤2.5 s on a mid-range Android over 4G.
- The bot check is required; the default limit is 5 questions per device/IP per host per hour.
- The host never sees IP, device or any "hint." The asker sees: "The host can't see who you are. Poocho keeps limited technical data for abuse prevention for 30 days."

**US-3 Moderation:** As a host, I want abusive questions filtered before I see them.
- Every question is classified before delivery (p95 ≤3 s). Items above the threshold go to "Filtered."
- Self-harm content triggers a support resource card (e.g., Tele-MANAS 14416 in India).
- Strictness options: Relaxed / Standard / Strict. Custom blocked words support Hindi, English and Hinglish transliterations.

**US-4 Story card:** As a host, I want an answer turned into a story image in one tap.
- The card is a 1080×1920 PNG ≤1 MB with the question, answer, handle and the footer "Ask me on poocho.app/@handle."
- If `navigator.canShare({files})` is true, the OS share sheet opens with the image. Otherwise the image downloads, the link is copied, and a toast explains how to add a link sticker.

**US-5 Named mode:** In Named mode askers must sign in, see "Your name will be shown" before submitting, and their display name appears on the question.

**US-6 Real-questions guarantee:** No code path inserts system-generated items into the inbox. Starter prompts appear in a separate "Ideas" UI labeled "From Poocho." An automated test enforces this invariant.

**US-7 Export/delete:** Export (JSON + CSV) arrives within 24h. Deletion purges content within 30 days, apart from logs required by law.

---

## 8. Anonymity model

**Modes per ask-link:** *Anonymous* (no account; host sees only text + timestamp), *Named* (authenticated; name shown), *Asker's choice* (signed-in askers choose whether to "Show my name").

**How anonymity is preserved:**
- Hosts never receive IP, device, location or "hints," and Poocho never sells de-anonymization.
- A salted, rotating hash of IP + device fingerprint serves as a pseudonymous ID for rate limits and detecting ban evasion. Raw IPs sit in an access-controlled abuse log for 30 days, longer only under a legal hold or order.
- When signed-in askers choose anonymity, their identity is stored encrypted. Only the T&S role can access it, under a documented legal/abuse process, and the privacy policy says so plainly: "Anonymous to the host, not anonymous to the law."
- No third-party ad trackers run on ask pages.

**Abuse prevention without breaking anonymity:** pre-delivery AI moderation; per-host and global rate limits; Cloudflare Turnstile; silent shadow-drop bans by hash (the abuser sees "sent," the host never receives it); repeat-offender scoring across hosts; a "signed-in askers only" switch. Marshmallow added a similar control after abusive messages drove users away.\[69\]

**Retention defaults:**
| Data | Retention |
|---|---|
| Q&A content | Until host deletes, or account deletion + 30 days |
| Filtered questions | 30 days (unless reported) |
| IP/device abuse logs | 30 days rolling |
| Reports/enforcement | 1 year |
| Payment records (V1) | Per tax law (verify with a CA) |

---

## 9. Trust & Safety and legal compliance

### 9.1 Moderation stack
1. **Automated:** the OpenAI Moderation endpoint for English, an LLM-prompted Hindi/Hinglish classifier, and regex lists for slurs, phone numbers, addresses and emails (doxxing).
2. **Host:** strictness levels, keyword lists, block/mute, pause.
3. **Community:** a report button on every public item.
4. **Human:** a founder-run queue at first. Act on reports within 24h, as Apple has required of UGC apps.\[70\] Confirm the exact Indian grievance timelines with counsel. Escalation playbook for threats, self-harm and CSAM; image hash-matching arrives in V2 along with media.
5. **Indexing gate:** nothing is indexed unless host-approved, moderation-clean and substantive.

**Honesty rule:** never claim "AI blocks all bullying." The FTC treated NGL's moderation claim as deceptive.\[7\]\[39\] Publish measured filter performance instead.

### 9.2 Age gating
- 18+ only. Hosts give a DOB; askers see an 18+ notice and the terms prohibit under-18 use.
- Why: the NGL order requires an age gate that blocks under-18s.\[71\] India's DPDP Rules require *verifiable* parental consent for anyone under 18 (a checkbox is insufficient) and ban tracking and behavioral monitoring of children, with effect from May 13, 2027.\[9\]\[72\]
- No marketing aimed at teens. Accounts showing under-18 signals are terminated and their data purged.

### 9.3 Compliance checklist
| Regime | What it means for Poocho | Phase |
|---|---|---|
| **India DPDP Act 2023 + Rules 2025** (notified Nov 13, 2025; consent managers from Nov 13, 2026; substantive duties incl. 72-hour breach notification and children's data from May 13, 2027) | Itemized consent notice, purpose-limited retention, breach response, grievance contact, deletion rights; no under-18 processing without verifiable parental consent\[73\]\[74\]\[75\] | Design now; complete by May 2027 |
| **India IT Rules 2021** | Published rules/privacy policy, a named Grievance Officer, complaint timelines, takedown on valid orders. Extra duties apply only above the significant-intermediary threshold (verify with counsel). | MVP |
| **GDPR** | Lawful basis, vendor DPAs, data-subject rights, SCCs for transfers | MVP |
| **CCPA/CPRA** | Notice, no sale/share, access/deletion rights | MVP |
| **COPPA** | Don't knowingly collect under-13 data; delete on knowledge. The Sendit allegations involve 116,000+ under-13s.\[76\] | MVP |
| **ROSCA / FTC Act** | Clear recurring-charge disclosure, express consent, easy cancellation; never imply a paid feature reveals senders | V1 |
| **KOSA & US state kids' laws** | Check federal status at launch; the 18+ policy minimizes exposure | Monitor |
| **Apple App Store 1.2** | Since Feb 6, 2026, "random or anonymous chat" apps are explicitly covered: content filter, reporting, blocking, published contact info. Apps used primarily for anonymous chat or bullying "may be removed without notice."\[77\]\[78\] Position as Q&A, with no stranger DMs. | V2 |
| **Google Play UGC policy** | In-app reporting, moderation, blocking | V2 |
| **Snap Kit policy** | Anonymous messaging apps are banned from Snap Kit for new developers (2022); Creative Kit apps in "anonymous or Q&A categories" must implement Identity Web View\[79\]\[80\] | V2 (evaluate) |

---

## 10. Social integrations spec

### 10.1 Feasibility

| Platform | PWA (MVP) | Native/API (V2) | Notes |
|---|---|---|---|
| **Instagram Stories** | PNG card → `navigator.share({files:[png]})` → Instagram → Stories. Reliable on Android Chrome. On iOS Safari 14+ the API supports files, but Instagram's handling is inconsistent; share files only, with a blank title. Fallback: save + copy link.\[81\]\[82\]\[83\] | Android intent `com.instagram.share.ADD_TO_STORY`; iOS `instagram-stories://share?source_application=<FB App ID>` with background/sticker image + colors via the pasteboard\[6\]\[81\] | A registered Facebook App ID has been required since late 2022.\[5\]\[84\] **No API pre-attaches a link sticker**, so the user adds it manually and the card should prompt for it. |
| **Instagram Login / API** | Not needed | Instagram API with Instagram Login (Business/Creator only) for verification\[85\] | Basic Display API shut down Dec 4, 2024; no API for personal accounts;\[4\]\[86\] Meta app review required |
| **Facebook Stories** | Web Share API | `facebook-stories://share` with a validated App ID; Facebook Stories API needs Facebook Login + approval\[87\]\[88\] | — |
| **Snapchat** | Creative Kit Web button (`snapchat-creative-kit-share`, `data-share-url`, `snapchat:sticker` meta tag)\[89\] | Creative Kit SDK | Q&A/anonymous apps need Identity Web View; Snap says URL attachments are "no longer broadly supported."\[79\]\[90\] Share only public answer pages. |
| **WhatsApp** (most important in India) | `wa.me/?text=` + Web Share for images/Status | — | OG image = rich preview |
| **X / Threads / LinkedIn / Facebook / Reddit** | Web intent/share URLs | APIs are paid or reviewed — skip | OG/Twitter cards do the work; Reddit penalizes self-promotion |
| **Discord / TikTok / YouTube** | Copy link; save image for TikTok upload | Discord bot, TikTok Share Kit, live overlay (V2) | — |

*(Intent URL formats for WhatsApp, X, Threads, LinkedIn, Facebook and Reddit are long-standing public endpoints that were not re-verified here. Test them before launch.)*

### 10.2 Instagram Story flow (MVP)
1. Host answers and picks a template.
2. The server renders a 1080×1920 PNG with Satori/`@vercel/og`, keeping text out of the top ~250px and bottom ~340px where IG overlays its UI.
3. If `canShare({files})` → `share({files})` with no title/text; otherwise download + copy link.\[83\]\[91\]
4. A toast explains: "Tap sticker → Link → paste."\[92\]
5. Viewers land on `poocho.app/@handle?src=igstory`, with UTM attribution only and no personal tracking.

### 10.3 V2 native flow
A Capacitor plugin. On iOS it writes `com.instagram.sharedSticker.backgroundImage`/`stickerImage` to the pasteboard and opens `instagram-stories://share?source_application=<FB_APP_ID>`. On Android it fires `ADD_TO_STORY` with `source_application`.\[6\]\[93\] This matches the one-tap story sharing NGL and Tellonym offer.

---

## 11. Authentication strategy

| Option | Cost | Approval | Verdict |
|---|---|---|---|
| **Email magic link** | ~Free (Supabase Auth/Resend) | None | **MVP Must** |
| **Google OAuth** | Free | Light verification for email/profile scopes | **MVP Must** (most Indian Android users have Google accounts) |
| Phone OTP | SMS cost + DLT registration in India | DLT templates | V1 Could |
| Apple Sign-In | $99/yr dev account | Required in an iOS app that offers other social logins | V2 |
| **Instagram Login** | Free | Meta app review; Business/Creator accounts only since Dec 4, 2024\[4\] | **V2: optional "Verify my IG" badge** |
| Facebook / X / Snap Login | Free to paid | Reviews; X API is paid | Won't |

**Recommendation:** Email magic link + Google at MVP through Supabase Auth. Creators type their IG handle as an unverified link. Add "Verify with Instagram" later as a trust badge, not a login requirement. This keeps Meta's review off the critical path, works for personal-account users (most young Indians), and costs nothing.

---

## 12. SEO strategy

**Targets:** "[name] AMA," long-tail topical questions, and category terms ("anonymous questions app," "NGL alternative," "free Slido alternative," Hindi variants).

1. **Rendering:** Next.js SSR/ISR for profiles, sessions and answer pages. App-shell pages are client-rendered and `noindex`.
2. **URLs:** `/@handle`, `/@handle/a/<slug-id>`, `/ama/<event>`, `/topics/<topic>`, `/alternatives/ngl`, `/vs/slido`, `/hi/...` with `hreflang`.
3. **Structured data, following Google's rules:**
   - Profiles: `ProfilePage` + `Person`.
   - Google says not to use `QAPage` for content with one answer and no way for users to add alternatives, and reserves `FAQPage` for site-owner content.\[94\]\[95\] So use `QAPage` only once community answers are enabled (V1). Until then, mark single-answer pages as `DiscussionForumPosting`/`Article` with an author, or leave them unmarked. Never mark up every page site-wide.\[94\]
   - Sessions: `Event` + recap pages.
   - Q&A containing obscene, harassing or hateful language is ineligible for rich results,\[94\] so moderation also protects SEO.
4. **Indexing gate:** an answer page is indexed only if it is host-public, moderation-clean, ≥~120 characters (or has media), and the account is ≥7 days old with no strikes. Everything else gets `noindex,follow`. Profiles with <3 indexable answers get `noindex`. Canonicalize duplicates. Sitemaps list only indexable URLs and set `lastmod`.
5. **Core Web Vitals budget:** ask-page JS <100 KB gzipped; self-hosted Noto Sans Devanagari subset; AVIF/WebP images.
6. **Dynamic OG image** for every answer (same renderer as the story cards) to lift WhatsApp/X/LinkedIn click-through.
7. **Programmatic SEO, carefully:** topic hubs, city hubs ("AMAs by Lucknow creators"), and alternative/comparison pages, since the CuriousCat/ASKfm/Retrospring closures keep "alternative" searches alive. Each page needs unique substance or stays `noindex`.
8. **Competitor ranking:** NGL and Tellonym rank mostly on brand terms and app-store pages, and their user pages are ask forms, not content. Reddit and Quora own question-intent results. Poocho's edge is moderated, host-curated, indexable answers.

---

## 13. Mobile-first UX

**Principles:** thumb-reachable actions; ≤3 taps from notification to shared story; Hindi/English toggle on the first screen; runs on 4G with a ₹10k Android; installable PWA with push.

**Key screens:**
1. **Landing:** value prop, "Get your link," trust badges ("No fake questions. No hint paywalls. 18+.").
2. **Onboarding:** Google/email → DOB → handle → prompt → share "Ask me" story card.
3. **Ask page:** prompt, 300-character box, anonymity indicator, send → "Get your own link" (the viral loop).
4. **Inbox:** New / Answered / Filtered tabs; swipe to delete/block.
5. **Answer composer:** text → template carousel → Share (Story / WhatsApp / More) + "Publish to profile" + "Allow Google indexing."
6. **Public profile:** answered feed with a sticky "Ask me" button.
7. **Live AMA (V1):** host queue sorted by upvotes, audience submit/upvote, projector view, QR code.
8. **Settings:** mode, filter level, blocked words, notifications, export/delete, language.

**PWA vs native:** Start with a PWA. It avoids app-store risk under Apple's 2026 anonymous-chat language,\[8\] ships updates instantly, is SEO-friendly, and askers arrive on the web anyway. Go native in V2 only for the official story SDKs and store discovery.

---

## 14. Tech stack & architecture

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + React + TypeScript** | SSR/ISR for SEO; server actions remove the need for a separate Express server at MVP |
| UI / i18n | Tailwind + shadcn/ui; next-intl | Fast, accessible, Hindi-ready |
| DB/Auth/Realtime/Storage | **Supabase (Postgres + RLS)** | One vendor covers magic link, Google, live upvotes and card storage |
| ORM | Drizzle or Prisma | Type-safe queries |
| Hosting | **Vercel** (or Cloudflare) | Zero-config Next.js, edge cache, OG rendering |
| Cards/OG | `@vercel/og` (Satori) | One pipeline for story cards and previews |
| Moderation | OpenAI Moderation + LLM Hinglish classifier via a queue | Pre-delivery checks; cheap |
| Bot defense | Cloudflare Turnstile + Upstash Redis rate limiting | Free/low-cost, serverless |
| Jobs | Supabase Edge Functions / Inngest / QStash | Moderation, exports, email |
| Email / Push | Resend; Web Push (VAPID) | Push works on iOS 16.4+ once installed |
| Payments (V1) | Razorpay (UPI) + Stripe | Paid questions and subscriptions |
| Analytics / errors | PostHog; Sentry | Funnels, flags, monitoring |

**Data model:** `users`, `profiles`, `ask_links(mode, filter_level)`, `questions(link_id, body, asker_user_id_encrypted, asker_hash, status, moderation_scores)`, `answers(question_id, body, card_url, is_public, is_indexable)`, `reports`, `blocks`, `sessions`, `votes`, `payments`.

**Anonymous-question flow:** Turnstile → server action → Redis rate limit → insert `pending` → moderation job (≤3 s) → `delivered` or `filtered` → realtime + Web Push to the host.

**Cost estimate (list prices change, so verify):**
| Stage | Monthly |
|---|---|
| MVP (<1k users) | ~$0–10 on free tiers (Vercel Hobby is non-commercial, so move to Pro once monetizing) + domain ~₹1,000/yr |
| Launch (1k–50k MAU) | ~$50–120 (Vercel Pro ~$20, Supabase Pro ~$25, LLM moderation, Redis/email) |
| Growth (50k–500k MAU) | ~$300–1,500 (bandwidth, DB compute, part-time human moderator) |

---

## 15. Monetization

**Benchmarks:**
- NGL "hints": $9.99/week (2022), later $6.99/week.\[40\] Sendit: up to $9.99/week.\[71\]\[96\]
- Topmate: 10% fee on direct sales (20% via marketplace) + 2–6% gateway charges.\[37\]\[54\]
- Slido: free up to 100 participants per event; annual billing only. Published 2026 prices conflict: one source lists Engage $210/yr, Professional $900/yr and Enterprise $2,400/yr, while others list $150/$600/$1,800. One-time event plans run ~$80–700.\[16\]\[17\]\[18\]\[97\]\[98\]\[99\]

**Proposed tiers:**
| Tier | Price | Includes |
|---|---|---|
| **Free** | ₹0 | Unlimited Q&A, Standard AI filter, 5 templates, profile, watermark, live AMA ≤150 participants |
| **Creator Pro** | ₹149/mo or ₹1,199/yr; $4.99/mo | No watermark, all templates, Strict/custom filters, analytics, scheduled AMAs |
| **Paid priority questions** | Creator sets ₹49–₹2,000; Poocho 10% + gateway | Answer by deadline or automatic refund |
| **Teams** | ₹2,499/mo or $39/mo per workspace, **monthly** | Private org AMAs, domain restriction, ≤1,000 participants, mod roles, exports |
| **Event pass** | ₹999 / $19 | One event, 7 days |

**Rules:** No paid feature ever touches anonymity. Recurring charges are disclosed clearly with one-tap cancellation (the ROSCA lesson). No ads on ask pages at launch.

---

## 16. Go-to-market & growth loops

**Viral loop:** host posts an "Ask me" card → followers ask → the confirmation screen says "Get your own link in 30s" → new hosts. Every shared answer card carries `poocho.app/@handle`. Target **k ≥ 0.5** at launch (with SEO and creator seeding), and k > 1 during seasonal spikes.

**India-first launch:**
1. **Weeks 1–4, private beta:** 50 Hindi-belt micro-creators (5k–50k followers) plus 5 college societies (18+), offered a lifetime Pro badge.
2. **SEO from day one:** "NGL/CuriousCat/Tellonym alternative," "anonymous questions for Instagram story," "free Slido alternative India," plus Hindi variants.
3. **Live AMAs** at college fests and startup meetups (V1).
4. **LinkedIn templates** for founders and HR ("free anonymous all-hands Q&A").
5. **Product Hunt / Indie Hackers launch** once live mode ships.
6. **Trust marketing:** a public "Real Questions Pledge" and a monthly transparency report (questions filtered, reports resolved).

---

## 17. Success metrics

**North-star metric: Weekly Shared Answers**, i.e. answers published or shared off-platform per week. It captures host value, asker value and growth surface in one number.

| Area | KPI | 90-day target |
|---|---|---|
| Activation | Hosts sharing their link within 24h | ≥60% |
| Activation | Hosts getting ≥1 real question within 48h | ≥50% |
| Engagement | Answered ÷ received | ≥35% |
| Virality | Ask-page → new-host conversion | ≥3% |
| Retention | Host D7 / D30 | ≥25% / ≥12% |
| Safety | Delivered questions later reported abusive | <0.5% |
| Safety | Median report resolution | <24h |
| SEO (months 3–6) | Indexed answers; organic sessions | 5k; 10k/mo |
| Revenue (V1) | Free→Pro; paid-question GMV | 2–3%; ₹2 lakh/mo by month 9 |
| Stickiness | DAU/MAU | ≥15% |

---

## 18. Risks, assumptions & open questions

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| "Empty inbox" (the trap that pushed NGL into fake questions)\[7\] | High | High | Labeled prompt ideas, live mode, posting-time tips; never fabricate |
| Cyberbullying incident / press | Medium | Severe | 18+, pre-delivery filter, shadow bans, fast reports, crisis resources |
| Minors use it anyway | Medium | High | Age gate, no teen marketing, purge process |
| iOS Web Share to IG inconsistent | High | Medium | Download + copy fallback; native in V2 |
| Meta/Snap policy changes | Medium | Medium | Web-first; no login/SDK dependency |
| Apple rejects the native app | Medium | Medium | Q&A positioning, full 1.2 controls, web first |
| Weak Hinglish moderation | High | Medium | Custom lists, LLM classifier, human sampling |
| Thin-content SEO penalties | Medium | Medium | Strict indexing gate |
| Solo-dev burnout (Retrospring) | Medium | High | Narrow MVP, managed services, early revenue |
| India payments/KYC | Medium | Medium | Razorpay Route; paid questions only after the core loop works |

**Open questions:**
1. Should anonymous askers be able to get a private reply (which needs a return channel)?
2. Should community answers be enabled (unlocks QAPage, but raises moderation load)?
3. If under-18s are ever allowed, which DPDP Rule 10 verification method (e.g., DigiLocker)?\[100\]
4. Final brand/domain and Indian trademark check ("Poocho" is a placeholder).
5. Legal entity (LLP/Pvt Ltd) before payments? Consult a CA.

---

## 19. Phased roadmap

| Phase | Timeline | Deliverables | Exit criteria |
|---|---|---|---|
| **0. Foundations** | Weeks 0–2 | Next.js + Supabase scaffold, auth, schema, design system, legal drafts, moderation test on 500 Hinglish samples | Ask → inbox works end-to-end |
| **1. MVP** | Weeks 3–10 | 3 link modes, AI filter, inbox, cards, Web Share, profile, SEO gate, report/block, export/delete, PWA + push, Hindi UI | 50 beta creators; ≥50% get a real question in 48h; zero critical incidents |
| **2. V1** | Months 3–5 | Live AMA + upvotes, clustering, Creator Pro, paid questions, Teams beta, more languages, topic hubs | 1k weekly active hosts; ₹50k MRR; D30 ≥12% |
| **3. V2** | Months 6–12 | Capacitor apps with official IG/Snap sharing, Apple/Google sign-in, IG badge, video answers, widget, bots, SSO | Store approval; 10k weekly active hosts; ≥30 paying Teams |
| **4. Scale** | Year 2 | Enterprise, SEA/MENA expansion, moderation team, API | Profitability |

---

## 20. Caveats on the evidence
- Estimates of audience-response market size vary roughly 5× between firms.\[25\]\[26\]\[28\]
- Sensor Tower and AppBrain figures are model estimates. Slido, Topmate and Marshmallow figures are company-reported.
- Slido's 2026 pricing is reported inconsistently, so check slido.com before using it in sales copy.\[17\]\[97\]
- The Sendit case was pending in the sources reviewed; its allegations are not findings.\[43\]
- Sarahah, Lipsi, Qooh.me, Passes, Fanhouse, Cameo, Pigeonhole Live, Vevox and Peerlist were not re-verified in this research. Confirm their current status before publishing a comparison page.
- The legal summaries are product guidance, not legal advice. Have an Indian tech lawyer review the IT Rules timelines, DPDP notices and payments setup.

## Sources

1. [CuriousCat - Archiveteam](https://wiki.archiveteam.org/index.php/CuriousCat)
2. [Ask.fm](https://en.wikipedia.org/wiki/Ask.fm)
3. [Retrospring - Archiveteam](https://wiki.archiveteam.org/index.php/Retrospring)
4. [Instagram Basic Display API Deprecation Tips 2026](https://www.getphyllo.com/post/instagram-basic-display-api-deprecation-what-it-is-for-developers-and-businesses)
5. [Instagram Adds New Requirement for Developers Using Sharing to Stories](https://www.adweek.com/media/instagram-adds-new-requirement-for-developers-using-sharing-to-stories/)
6. [Share content to an Instagram story from an iOS app](https://medium.com/@danielcrompton5/share-content-to-an-instagram-story-from-an-ios-app-d55b1e10e68a)
7. [FTC bans NGL from offering its anonymous social app to minors](https://techcrunch.com/2024/07/09/ftc-bans-ngl-from-offering-its-anonymous-social-app-to-minors/)
8. [Apple updates its App Review Guidelines with expanded list of apps with ‘objectionable’ content - MacTech.com](https://www.mactech.com/2026/02/06/apple-updates-its-app-review-guidelines-with-expanded-list-of-apps-with-objectionable-content/)
9. [DPDP Rules 2025: What the Rules Actually Say, What They Defer, and What Is Still Missing](https://www.matters.ai/compliance/dpdp/dpdp-rules-2025)
10. [CuriousCat Alternatives: Anonymous Q&A Platforms in 2026](https://lock.pub/en/blog/curious-cat-alternative)
11. [Retrospring (@retrospring@floss.social) - FLOSS.social](https://floss.social/@retrospring)
12. [Retrospring is shutting down on 1st March 2025 — Retrospring](https://blog.retrospring.net/retrospring-is-shutting-down-on-1st-march-2025)
13. [Tellonym: anonymous questions - Free APK Download for ...](https://www.appbrain.com/app/tellonym-anonymous-questions/de.tellonym.app)
14. [No, Instagram has not launched an anonymous questions sticker - Fast Company](https://www.fastcompany.com/90520274/no-instagram-has-not-launched-an-anonymous-questions-sticker)
15. [21 People Who Are Really Regretting What They Asked On Instagram Questions](https://www.buzzfeed.com/jenniferabidor/21-people-who-thought-the-instagram-question-feature-was)
16. [Slido Pricing: Cost and Pricing plans](https://www.saasworthy.com/product/slido/pricing)
17. [Slido Pricing 2026: Plans, Costs & Total Cost - Slido](https://checkthat.ai/brands/slido/pricing)
18. [Slido vs Mentimeter: Which Audience Engagement Tool Fits Your Meetings in 2026?](https://resources.rework.com/tools/events/slido-vs-mentimeter)
19. [PIB India on X: "BOSTON CONSULTING GROUP (BCG) REPORT RELEASED The emergence of the creative economy is propelling India's digital landscape into rapid transformation. Boston Consulting Group (BCG) launched new research titled "From Content to Commerce: Measuring India's Creator Economy" yesterday… / X](https://x.com/PIB_India/status/1927992620359336007)
20. [Creator economy India 2026: who earns · Qolab Blog](https://qolab.in/blog/creator-economy-india-2026)
21. [From Content to Commerce: Mapping India’s Creator Economy](https://www.bcg.com/publications/2025/india-from-content-to-commerce-mapping-indias-creator-economy)
22. [WAVES 2025: India’s creator economy set to influence over \$1 trillion in consumer spending by 2030, says BCG report - DD India](https://ddindia.co.in/2025/05/waves-2025-indias-creator-economy-set-to-influence-over-1-trillion-in-consumer-spending-by-2030-says-bcg-report/)
23. [Sensor Tower: The State of the Mobile Market in 2026](https://gamedevreports.substack.com/p/sensor-tower-the-state-of-the-mobile)
24. [2026 State of Mobile: AI Moves Mobile into Its Next Phase](https://sensortower.com/blog/state-of-mobile-2026)
25. [Audience Response Software Market Size, Share & Forecast](https://www.verifiedmarketreports.com/product/audience-response-software-market/)
26. [Audience Response Software Market Size, Trends & Growth 2035](https://www.wiseguyreports.com/reports/audience-response-software-market)
27. [Global Audience Response System Market Size, Growth Trends, Industry Share & Forecast 2026-2034](https://www.verifiedmarketreports.com/product/audience-response-system-market/)
28. [Audience Response Software Market Research Report 2034](https://dataintelo.com/report/audience-response-software-market)
29. [About us](https://www.slido.com/about)
30. [Mentimeter vs Slido](https://www.trustradius.com/compare-products/mentimeter-vs-slido)
31. [Mentimeter](https://en.wikipedia.org/wiki/Mentimeter)
32. [NGL makes \$2.4M as users complain about being scammed](https://techcrunch.com/2022/07/11/anonymous-social-ngl-tops-15m-installs-2-4m-in-revenue-as-users-complain-about-being-scammed/)
33. [NGL Fooled Users Into Thinking They Had Friends Interested In Their Sad Little Lives](https://www.vice.com/en/article/ngl-fooled-users-into-thinking-they-had-friends-interested-in-their-sad-little-lives/)
34. [NGL: ask me anything - Apple App Store - US - Category Rankings, Keyword Rankings, Sales Rankings, Research, Performance, and Growth Metrics.](https://app.sensortower.com/overview/1596550932?country=US)
35. [FTC Sues Sendit App, CEO Over Illegal Children's Data Collection](https://thecyberexpress.com/ftc-complaint-against-sendit-app-ceo/)
36. [tellonym - anonymous questions](https://apps.apple.com/US/app/id1265133033)
37. [Topmate: sell what your people ask for](https://topmate.io/)
38. [匿名メッセージサービス「マシュマロ」がAIによる合議制を採用！](https://prtimes.jp/main/html/rd/p/000000002.000034056.html)
39. [FTC Order Will Ban NGL Labs and its Founders from Offering Anonymous Messaging Apps to Kids Under 18 and Halt Deceptive Claims Around AI Content Moderation](https://www.ftc.gov/news-events/news/press-releases/2024/07/ftc-order-will-ban-ngl-labs-its-founders-offering-anonymous-messaging-apps-kids-under-18-halt)
40. [NGL app icon on iPhone](https://techcrunch.com/2022/08/04/top-anonymous-social-app-ngl-forced-to-stop-tricking-its-users)
41. [FTC bans NGL from offering its anonymous social app to minors](https://www.yahoo.com/news/ftc-bans-ngl-offering-anonymous-144130611.html)
42. [FTC alleges messaging app violated child privacy law, duped users into subscriptions](https://therecord.media/ftc-alleges-sendit-app-violated-children-privacy-rule)
43. [Iconic Hearts Holdings, Inc., U.S. v.](https://www.ftc.gov/legal-library/browse/cases-proceedings/232-3029-iconic-hearts-holdings-inc-us-v)
44. [tellonym 1](https://www.cbinsights.com/company/tellonym-1/)
45. [Tellonym - Parents' Guide & App Review](https://www.commonsensemedia.org/app-reviews/tellonym)
46. [Snap suspends anonymous Q&A apps Yolo and LMK after lawsuit over teen's death](https://finance.yahoo.com/news/snap-suspends-anonymous-q-apps-234421846.html)
47. [Snap Responds to Lawsuit by Suspending Two Partner Apps](https://dot.la/yolo-lmk-snapchat-2652955300.html)
48. [What is Marshmallow?](https://marshmallow-qa.com/about)
49. [【質問箱】Twitter向け匿名メッセージ『マシュマロ』の使い方-質問募集や回答方法・有料プランの特典など徹底紹介！](https://dohack.jp/sns/marshmallow)
50. [Peing, Marshmallow, Soudanbako, BoxFresh](https://caen.co.jp/en/news/questionbox-comparison)
51. [Are Instagram Poll & Question Answers Anonymous?](https://peekstories.com/blog/instagram-poll-question-sticker-answers-anonymous-2026)
52. [Slido Vs Mentimeter Vs ClassPoint: Best Choice For Audience Engagement](https://www.classpoint.io/blog/slido-vs-mentimeter-vs-classpoint)
53. [Mentimeter vs Slido: Which Is Better in 2026? (Free Plans)](https://www.quizotic.live/learn/mentimeter-vs-slido-vs-quizotic)
54. [Topmate Pricing](https://topmate.io/pricing)
55. [Product Management Mentorship & Courses](https://topmate.io/use-cases/product-management)
56. [www.ftc.gov](https://www.ftc.gov/node/85821)
57. [NGL (app)](<https://en.wikipedia.org/wiki/NGL_(app)>)
58. [NGL: ask me anything - Ratings & Reviews - App Store - Apple](https://apps.apple.com/us/app/ngl-ask-me-anything/id1596550932?see-all=reviews&platform=iphone)
59. [Image Credits:TechCrunch](https://techcrunch.com/2022/07/15/not-gonna-lie-this-ngl-lawsuit-is-kinda-juicy)
60. [NGL Reviews (2026)](https://justuseapp.com/en/app/1596550932/ngl-anonymous-q-a/reviews)
61. [Image Credits:TechCrunch](https://techcrunch.com/2022/06/29/anonymous-social-apps-shift-their-attention-to-instagram-in-the-wake-of-snapchats-ban)
62. [What is NGL? The anonymous messaging app that's taking over Instagram](https://www.nbcnews.com/news/amp/rcna36152)
63. [tellonym - ask me anything - Ratings & Reviews - App Store](https://apps.apple.com/us/app/tellonym-ask-me-anything/id1265133033?see-all=reviews)
64. [Tellonym: anonymous questions - Apps on Google Play](https://play.google.com/store/apps/details?id=de.tellonym.app)
65. [Slido Has Made One Million Events More Engaging - Slido Blog](https://blog.slido.com/one-million-events-milestone/)
66. [Slido Celebrates One Million Participants a Week - Slido Blog](https://blog.slido.com/slido-milestone-one-million-participants/)
67. [DeepBrief: 150K+ professionals, 2.5mn rising stars: Inside the \$2bn+ surge of India’s creator economy — BCG report › Mediabrief.com](https://mediabrief.com/inside-the-2bn-surge-of-indias-creator-economy-bcg-report/)
68. [Tellonym: Anonymous QA APK for Android - Download](https://tellonym.en.softonic.com/android)
69. [「マシュマロ」がバージョンアップ、送信ユーザーをフォロワーに限定する機能を追加【やじうまWatch】 - INTERNET Watch](https://internet.watch.impress.co.jp/docs/yajiuma/1273131.html)
70. [Questions about user-generated content rules](https://developer.apple.com/forums/thread/26899)
71. [techcrunch.com](https://techcrunch.com/?p=2806531)
72. [DPDP Rules 2025 — Phased Rollout and Data Fiduciary Duties](https://veritect.ai/digital-data-ai-law/dpdp-rules-2025-phased-rollout)
73. [Transforming data privacy: DPDP Act, 2023 and DPDP Rules, 2025](https://www.ey.com/en_in/insights/cybersecurity/transforming-data-privacy-digital-personal-data-protection-rules-2025)
74. [DPDP Act Timeline 2025–2027: Rules, Consent Manager & Deadlines](https://www.dpdpactindia.com/timeline.html)
75. [Digital Personal Data Protection Rules, 2025](https://adplawoffices.com/digital-personal-data-protection-rules-2025-notified/)
76. [FTC Initiates Enforcement Action Against Sendit and CEO for COPPA Violations](https://www.hunton.com/privacy-and-information-security-law/ftc-initiates-enforcement-action-against-sendit-and-ceo-for-coppa-violations)
77. [Apple's 2026 App Review Guideline Changes: 4.3(b) Spam, 4.5.3 Live Activities, 1.2 UGC](https://appcompliance.io/blog/apple-2026-app-review-guideline-changes/)
78. [Apple Rewrote Its App Review Guidelines Twice in 2026: What Actually Changed](https://www.macobserver.com/news/apple-app-review-guidelines-2026-changes-explained/)
79. [Creative Kit](https://developers.snap.com/snap-kit/creative-kit/overview)
80. [logo of mobile app Snapchat](https://techcrunch.com/2022/03/17/following-suicides-and-lawsuits-snapchat-restricts-apps-building-on-its-platform-with-new-policies)
81. [ideia: cartão de compartilhamento por post (preview no X e "adicionar ao Story" no Instagram) · Issue #109 · armandomonteir-o/armando-blog · GitHub](https://github.com/armandomonteir-o/armando-blog/issues/109)
82. [sharing image to facebook using navigator.share on Safari (iOS)](https://developer.apple.com/forums/thread/665812)
83. [Share cover image to Instagram Stories via Web Share files by thebloccoffee · Pull Request #7 · thebloccoffee/bon-website-apr1 · GitHub](https://github.com/thebloccoffee/bon-website-apr1/pull/7)
84. [Developer wanted to enhance instagram / facebook stories share with app ID parameter · Issue #1304 · react-native-share/react-native-share · GitHub](https://github.com/react-native-share/react-native-share/issues/1304)
85. [Instagram Platform](https://developers.facebook.com/documentation/instagram-platform)
86. [Meta Graph API Deprecations: A Dated Timeline for Instagram, Facebook, and Threads](https://postgate.studio/blog/meta-api-deprecations)
87. [techcrunch.com](https://techcrunch.com/2023/11/02/new-facebook-stories-api-helps-creators-share-directly-from-third-party-desktop-or-web-apps/amp/)
88. [GitHub - KQED/social-story-share: Share content to social media stories · GitHub](https://github.com/KQED/social-story-share)
89. [Web Integration](https://developers.snap.com/snap-kit/creative-kit/web)
90. [Attachment url not attaching to sticker · Issue #80 · Snapchat/creative-kit-sample · GitHub](https://github.com/Snapchat/creative-kit-sample/issues/80)
91. [Integrate with the OS sharing UI with the Web Share API | Articles | web.dev](https://web.dev/web-share/)
92. [How to Share a Web Page to Instagram Stories](https://tostories.app/guides/share-a-web-page-to-instagram-stories)
93. [Sharing an image to instagram stories or create a post · GitHub](https://gist.github.com/michaeltys/a8613e5aea9db8e4684bf85568e40160)
94. [Schema for Q&A Pages (QAPage)](https://developers.google.com/search/docs/appearance/structured-data/qapage)
95. [FAQ Schema Markup: The Complete Implementation Guide and Best Practices](https://schemaengineai.com/blog/faq-schema-markup-implementation-guide/)
96. [Sendit tricked kids, harvested their data, and faked messages, FTC claims](https://www.malwarebytes.com/blog/news/2025/10/sendit-app-tricked-kids-harvested-their-data-and-faked-messages-ftc-claims)
97. [Slido Pricing 2026: Hidden Costs & Total ROI Revealed](https://www.itqlick.com/slido/pricing)
98. ["Best Slido Alternatives in 2026: 12 Tools for Q&A, Live Polls, and Meeting Engagement"](https://resources.rework.com/tools/events/best-slido-alternatives)
99. [Slido - Features, Reviews & Pricing (September 2026)](https://www.saasworthy.com/product/slido)
100. [DPDP Compliance Guide 2026: Requirements & Deadlines](https://www.privybyidfy.com/blog/dpdp-compliance-guide-2026-what-indian-enterprises-must-do-before-may-2027)
