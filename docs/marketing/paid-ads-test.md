# The ₹5,000 Instagram ads test (month 2)

Paid traffic only pays off once people who arrive stay. So this test runs in month 2, and only if the gate below is met. Its job is to learn one thing cheaply: what it costs to win a host who gets value, and which message and city do it best.

## The gate

Start only when both hold for **two weekly cohorts in a row**: host D7 retention of **20% or more** (PostHog retention) and activation of **40% or more** (`/admin`). If not, keep spending time on seeded creators instead; ads would only buy visitors who leave.

## Set-up in Meta Ads Manager

| Setting | Choice | Why |
| --- | --- | --- |
| Objective | Traffic, optimised for **link clicks** | Poocho has no Meta pixel by design (the pledge promises no ad trackers), so Meta can't optimise for sign-ups. UTMs and PostHog measure those instead |
| Placements | Instagram only: Stories, Reels, Feed | Where Poocho links live |
| Ad sets | Two: **Lucknow** (+25 km) and **Delhi** (+25 km) | The playbook's two cities: home turf and the biggest Hindi-belt market |
| Age | **18 to 24**, Advantage+ audience off | Adults only, and Meta must not widen the age range below 18 |
| Languages | English, Hindi | |
| Detailed targeting | None (broad) | Small budget; let the creative find its audience |
| Budget | ₹250 a day per ad set for 10 days = **₹5,000** | |
| Ads per ad set | The four story ads, plus the two feed ads for Feed placements | One variable at a time: message |

Each ad uses its own link from [utm-links.md](./utm-links.md#paid-test-month-2), so PostHog can split results by `utm_content`.

## Creatives and copy

| Creative | Primary text | Headline | Button |
| --- | --- | --- | --- |
| `creatives/ad-story-real-questions.png` | Get asked anything on your story, only by real people. Mean questions are filtered before you see them. Free, 18+. | Your anonymous link, minus the fakes | Sign up |
| `creatives/ad-story-never-fake.png` | Some ask apps sent fake questions to keep you hooked. Poocho never will: every question is from a real person, and it's in our pledge. | No fake questions. Ever. | Learn more |
| `creatives/ad-story-filter.png` | Mean questions go to a Filtered folder you never have to open. You choose how strict, and block any word you like. | Ask me anything, minus the hate | Sign up |
| `creatives/ad-story-hinglish.png` | Story pe "ask me anything" daalo, sirf asli log poochenge. Bure sawaal pehle hi filter ho jaate hain. Free, 18+. | Mujhse kuch bhi poocho | Sign up |
| `creatives/ad-feed-real-questions.png` | As the first row | As the first row | Sign up |
| `creatives/ad-feed-hinglish.png` | As the Hinglish row | As the Hinglish row | Sign up |

Ads never name a competitor, never imply they know anything about the viewer, and never show a real person's question.

## What to measure

Build one PostHog insight filtered to `utm_campaign = paid_test`, broken down by `utm_content` and by city (`$geoip_city_name`): pageview → `signup_completed`, then activation and D7 for that cohort. Read Meta for spend, reach, CTR and cost per click.

| Number | Formula | Good |
| --- | --- | --- |
| Cost per click | Meta | ₹5 or less |
| Cost per new host | Spend ÷ `signup_completed` | ₹40 or less |
| Cost per activated host | Spend ÷ new hosts with a real question in 48 h | ₹80 or less |
| Paid-cohort D7 | PostHog retention for the paid cohort | Within 5 points of organic |

## Kill and scale rules

After the first ₹1,500, pause any ad with a CTR under 0.5% or no sign-ups. At the end of 10 days, if the best city and creative bring an activated host for under ₹50 and paid-cohort D7 is 20% or more, double the budget on that pair for the next 10 days. If no pair gets under ₹100 per activated host, stop paid and put the money into creator perks instead.

## Write-up

Add a short section to the next Monday review: spend, sign-ups and activated hosts per creative and city, the winner, and the decision.
