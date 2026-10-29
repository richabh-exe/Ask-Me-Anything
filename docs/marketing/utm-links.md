# Tagged links for every channel

Every link Poocho shares carries UTM tags, so Vercel Analytics and PostHog can show which channel actually brought hosts. These match the presets in the link builder on `/admin`, which makes new ones in one tap.

The links use today's address. After [Domain day](./setup-accounts.md#domain-day) they keep working through the permanent redirect, tags included; swap the domain in new posts from then on.

## Poocho's own channels

| Where | Link |
| --- | --- |
| Instagram bio | `https://poocho.vercel.app/?utm_source=instagram&utm_medium=bio&utm_campaign=profile` |
| Instagram story link sticker (reels week) | `https://poocho.vercel.app/?utm_source=instagram&utm_medium=social&utm_campaign=reels` |
| Story-prompts carousel caption | `https://poocho.vercel.app/ideas/story-questions?utm_source=instagram&utm_medium=social&utm_campaign=prompts` |
| X bio | `https://poocho.vercel.app/?utm_source=x&utm_medium=bio&utm_campaign=profile` |
| X build-in-public posts | `https://poocho.vercel.app/?utm_source=x&utm_medium=social&utm_campaign=build_in_public` |
| LinkedIn page | `https://poocho.vercel.app/?utm_source=linkedin&utm_medium=bio&utm_campaign=profile` |
| LinkedIn build-in-public posts | `https://poocho.vercel.app/?utm_source=linkedin&utm_medium=social&utm_campaign=build_in_public` |
| WhatsApp groups and status | `https://poocho.vercel.app/?utm_source=whatsapp&utm_medium=social&utm_campaign=groups` |
| Pinterest pin | `https://poocho.vercel.app/ideas/story-questions?utm_source=pinterest&utm_medium=social&utm_campaign=prompts` |

## Seeded creators

Creators share **their own ask page**, tagged so their followers count as seeding. Replace `HANDLE` with theirs:

`https://poocho.vercel.app/@HANDLE?utm_source=instagram&utm_medium=story&utm_campaign=seed`

## Campus ambassadors

Replace `COLLEGE` with a short slug such as `lu` or `iiml`:

`https://poocho.vercel.app/?utm_source=campus&utm_medium=ambassador&utm_campaign=COLLEGE`

## Communities, listings and launch

| Where | Link |
| --- | --- |
| Reddit build story | `https://poocho.vercel.app/?utm_source=reddit&utm_medium=community&utm_campaign=build_story` |
| AlternativeTo | `https://poocho.vercel.app/?utm_source=alternativeto&utm_medium=directory&utm_campaign=listings` |
| SaaSHub | `https://poocho.vercel.app/?utm_source=saashub&utm_medium=directory&utm_campaign=listings` |
| Peerlist | `https://poocho.vercel.app/?utm_source=peerlist&utm_medium=directory&utm_campaign=listings` |
| BetaList | `https://poocho.vercel.app/?utm_source=betalist&utm_medium=directory&utm_campaign=listings` |
| Product Hunt | `https://poocho.vercel.app/?utm_source=producthunt&utm_medium=launch&utm_campaign=launch` |
| Indie Hackers | `https://poocho.vercel.app/?utm_source=indiehackers&utm_medium=launch&utm_campaign=launch` |
| YourStory | `https://poocho.vercel.app/?utm_source=yourstory&utm_medium=pr&utm_campaign=launch` |
| Inc42 | `https://poocho.vercel.app/?utm_source=inc42&utm_medium=pr&utm_campaign=launch` |
| Campus media | `https://poocho.vercel.app/?utm_source=campus_media&utm_medium=pr&utm_campaign=launch` |

## Paid test (month 2)

One link per creative, so the winner is obvious:

| Creative | Link |
| --- | --- |
| `ad-story-real-questions.png` | `https://poocho.vercel.app/?utm_source=instagram&utm_medium=paid_social&utm_campaign=paid_test&utm_content=real_questions` |
| `ad-story-never-fake.png` | `https://poocho.vercel.app/?utm_source=instagram&utm_medium=paid_social&utm_campaign=paid_test&utm_content=never_fake` |
| `ad-story-filter.png` | `https://poocho.vercel.app/?utm_source=instagram&utm_medium=paid_social&utm_campaign=paid_test&utm_content=filter` |
| `ad-story-hinglish.png` | `https://poocho.vercel.app/hi?utm_source=instagram&utm_medium=paid_social&utm_campaign=paid_test&utm_content=hinglish` |
| `ad-feed-real-questions.png` | `https://poocho.vercel.app/?utm_source=instagram&utm_medium=paid_social&utm_campaign=paid_test&utm_content=feed_real_questions` |
| `ad-feed-hinglish.png` | `https://poocho.vercel.app/hi?utm_source=instagram&utm_medium=paid_social&utm_campaign=paid_test&utm_content=feed_hinglish` |
