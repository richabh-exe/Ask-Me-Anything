import type { ContentPage } from "./types";

/*
 * English guides. Claims about other apps stick to what regulators, the apps'
 * own store listings or archives say, and each page links its sources. Keep
 * the tone of the pledge: plain, honest, never cruel about competitors.
 */

const DATE = "2026-10-29";

const FTC_NGL = {
  label: "FTC: order bans NGL Labs from offering anonymous messaging apps to kids under 18 (July 2024)",
  href: "https://www.ftc.gov/news-events/news/press-releases/2024/07/ftc-order-will-ban-ngl-labs-its-founders-offering-anonymous-messaging-apps-kids-under-18-halt",
};

const CTA = {
  kind: "cta",
  title: "Get a link only real people can fill",
  text: "Claim your Poocho link in about 30 seconds. Free, and for people 18 and over.",
  button: "Get your link",
} as const;

export const EN_PAGES: ContentPage[] = [
  {
    section: "alternatives",
    slug: "ngl",
    locale: "en",
    eyebrow: "NGL alternative",
    title: "The NGL alternative that never fakes a question",
    seoTitle: "NGL alternative with no fake questions",
    description:
      "Looking for an NGL alternative? Poocho gives you an anonymous question link for your Instagram story with real questions only, an abuse filter and no paid hints.",
    published: DATE,
    updated: DATE,
    lede: "NGL made the anonymous story link famous. Then the US Federal Trade Commission found it had been sending users computer-written questions and selling “hints” about who asked. Poocho keeps the part people loved, one link on your story, and drops the tricks.",
    body: [
      { kind: "h2", id: "what-happened", text: "What happened with NGL" },
      {
        kind: "p",
        text: "In July 2024 the FTC and the Los Angeles District Attorney settled with NGL Labs. According to the FTC, the app sent users fake messages made to look as if real people had sent them, sold a subscription that promised to reveal who was asking but didn't, and claimed AI moderation filtered out bullying when it didn't. The order bans NGL from offering the app to anyone under 18 and required NGL to pay $5 million.",
      },
      {
        kind: "p",
        text: "NGL is still available, and if it works for you, that's fine. If you'd rather not wonder which questions are real, here is how Poocho is different.",
      },
      { kind: "h2", id: "compare", text: "NGL and Poocho, side by side" },
      {
        kind: "table",
        caption: "What the FTC found about NGL, next to what Poocho commits to",
        head: ["", "NGL (FTC findings, 2024)", "Poocho"],
        ours: 2,
        rows: [
          ["Questions in your inbox", "Sent computer-written messages made to look real", "Only questions a person typed. Prompt ideas are labelled “From Poocho” and never land in your inbox"],
          ["Who asked", "Sold “hints” that didn't reveal the sender", "No hints, clues or reveals, at any price"],
          ["Abuse", "Claimed AI moderation it didn't deliver", "Every question is checked before you see it. Cruel ones go to a Filtered folder you choose whether to open"],
          ["Age", "Now barred from users under 18", "18+ only, for hosts and askers"],
        ],
      },
      { kind: "h2", id: "what-you-get", text: "What else you get" },
      {
        kind: "list",
        items: [
          "**Your rules.** Choose Relaxed, Standard or Strict filtering, block your own words, or pause your inbox for a day.",
          "**Anonymous, named or their choice.** Decide per link whether askers stay hidden, give a name, or choose for themselves.",
          "**Story cards.** Five card styles at 1080 × 1920, each with your link on it, so the next question is one tap away.",
          "**Your data, yours.** Export every question and answer as JSON or CSV, or delete your account and everything in it.",
          "**Hindi and English.** Askers can switch the ask page to Hindi with one tap.",
        ],
      },
      { kind: "h2", id: "switch", text: "Switch in two minutes" },
      {
        kind: "steps",
        items: [
          { title: "Claim your link", body: "Pick a handle on [Poocho](/start). Sign in with Google or a one-time email link; there's no password." },
          { title: "Set your rules", body: "Choose who can ask, how strict the filter is, and any words you never want to see." },
          { title: "Swap the sticker", body: "Share your “Ask me” card to your story and put your Poocho link on the link sticker where your NGL link used to be." },
          { title: "Answer as a card", body: "Open a question, write your answer, pick a card and share it straight back to your story." },
        ],
      },
      {
        kind: "note",
        tone: "haldi",
        title: "Keep your old questions",
        text: "Poocho can't import questions from NGL, and never adds questions nobody sent. Screenshot the NGL answers you want to keep before you take the link down.",
      },
      { kind: "h2", id: "pledge", text: "Why we wrote it down" },
      {
        kind: "p",
        text: "Anonymous apps earn more when you keep opening them, which is exactly how fake questions and paid hints happened. Poocho put the opposite in writing in the [Real Questions Pledge](/pledge), and an automated test checks on every change that no code path can put a computer-written question in an inbox.",
      },
      CTA,
    ],
    faq: [
      {
        q: "Is NGL safe to use now?",
        a: "The FTC's 2024 order bars NGL from users under 18 and from repeating the claims the FTC called deceptive. Whether it's right for you is your call. If fake questions or paid hints worry you, choose an app that rules them out in writing, like Poocho's [pledge](/pledge).",
      },
      {
        q: "Does Poocho send fake questions to get me started?",
        a: "No. A new inbox starts empty. Prompt ideas appear in their own panel marked “From Poocho” and are never delivered as questions.",
      },
      {
        q: "Can I see who sent a question on Poocho?",
        a: "Only if your link asks for names, or the asker chooses to show theirs. On an anonymous link you see the question and when it arrived, nothing else, and there's no paid way around that.",
      },
      { q: "Is Poocho free?", a: "Yes. Everything on this page is free." },
    ],
    related: ["/guides/anonymous-questions-instagram-story", "/guides/are-anonymous-question-apps-safe", "/alternatives/tellonym"],
    translation: "/hi/alternatives/ngl",
    sources: [
      FTC_NGL,
      { label: "TechCrunch: FTC bans NGL from offering its anonymous social app to minors", href: "https://techcrunch.com/2024/07/09/ftc-bans-ngl-from-offering-its-anonymous-social-app-to-minors/" },
    ],
  },

  {
    section: "alternatives",
    slug: "tellonym",
    locale: "en",
    eyebrow: "Tellonym alternative",
    title: "A Tellonym alternative made for your story",
    seoTitle: "Tellonym alternative for Instagram stories",
    description:
      "A Tellonym alternative built for Instagram stories: one anonymous question link, an abuse filter you control, answers as story cards, and no fake questions.",
    published: DATE,
    updated: DATE,
    lede: "Tellonym has been around since 2016 and is still going. Poocho is for people who want something lighter: no feed and no follower count, just one link on your story, a filter that catches cruel questions first, and answers that turn into story cards.",
    body: [
      { kind: "h2", id: "differences", text: "How they differ" },
      {
        kind: "table",
        caption: "Tellonym and Poocho compared",
        head: ["", "Tellonym", "Poocho"],
        ours: 2,
        rows: [
          ["What it is", "A social app with profiles, followers and a feed of answers", "One ask link and an inbox. No feed, nothing to scroll"],
          ["Before you see a question", "Word filters and blocking", "Every question is checked first; cruel ones go to a Filtered folder"],
          ["Who asked", "Anonymous or public", "Your choice per link: anonymous, named, or the asker decides"],
          ["Answers", "Shared to Snapchat and Instagram", "Five 1080 × 1920 story cards, each carrying your link"],
          ["Age", "Rated 17+ on the App Store", "18+ for hosts and askers"],
          ["Price", "Free, with in-app purchases", "Free"],
        ],
      },
      { kind: "h2", id: "tellonym-fit", text: "When Tellonym is the better fit" },
      {
        kind: "p",
        text: "If you want a social network around your answers, with followers, a feed and an app to open every day, Tellonym does that and Poocho deliberately doesn't.",
      },
      { kind: "h2", id: "poocho-fit", text: "When Poocho is the better fit" },
      {
        kind: "list",
        items: [
          "You want questions from the people who already follow you on Instagram or WhatsApp, not a new audience to build.",
          "You'd rather not read the cruel ones at all. Poocho filters before delivery, and you set how strict it is.",
          "You want your askers to need nothing: no app, no account, just a link.",
          "You want a [written promise](/pledge) that every question is real and nobody can pay to find out who asked.",
        ],
      },
      { kind: "h2", id: "switch", text: "Switching" },
      {
        kind: "steps",
        items: [
          { title: "Claim your link", body: "Pick a handle on [Poocho](/start). It takes about 30 seconds." },
          { title: "Share the card", body: "Post your “Ask me” card to your story with your link on a link sticker. [Here's the full Instagram setup](/guides/anonymous-questions-instagram-story)." },
          { title: "Answer", body: "Reply to questions as story cards. Keep your Tellonym if you like; the two work side by side." },
        ],
      },
      CTA,
    ],
    faq: [
      {
        q: "Is Tellonym anonymous?",
        a: "Tellonym lets people send messages anonymously or publicly. Like any app that fights abuse, the operator keeps some technical data, so anonymous to the person you message isn't the same as anonymous to the law. Poocho explains its own rules under [how anonymity works](/pledge#anonymity).",
      },
      { q: "Can I use Poocho and Tellonym together?", a: "Yes. Your Poocho link works anywhere you can paste a link, alongside anything else you use." },
      { q: "Do people need an app to ask me on Poocho?", a: "No. Askers open your link in their browser, type a question and send it. No account, no download." },
    ],
    related: ["/alternatives/ngl", "/alternatives/curiouscat", "/guides/are-anonymous-question-apps-safe"],
    sources: [
      { label: "tellonym on the App Store", href: "https://apps.apple.com/us/app/id1265133033" },
      { label: "Common Sense Media: Tellonym app review", href: "https://www.commonsensemedia.org/app-reviews/tellonym" },
    ],
  },

  {
    section: "alternatives",
    slug: "curiouscat",
    locale: "en",
    eyebrow: "CuriousCat alternative",
    title: "CuriousCat is gone. Here's a new home for your questions.",
    seoTitle: "CuriousCat alternative after the shutdown",
    description:
      "CuriousCat shut down in 2024. Poocho is a free anonymous question link for your story, with real questions only, an abuse filter and answers you can export.",
    published: DATE,
    updated: DATE,
    lede: "CuriousCat closed in October 2024 after years of losses, and ASKfm followed that December. If you're still looking for somewhere to take anonymous questions, Poocho works the way CuriousCat did at its best: one link, honest questions, and answers you're happy to share.",
    body: [
      { kind: "h2", id: "what-closed", text: "What closed, and what it taught us" },
      {
        kind: "p",
        text: "CuriousCat lost its original domain in December 2021 and shut down in October 2024. ASKfm closed on 1 December 2024, and Retrospring, a volunteer-run favourite, closed in 2025. Each time, people lost years of answers.",
      },
      {
        kind: "p",
        text: "The lesson we took is simple: a question box needs a way to pay for itself and a way for you to leave with your answers. That's why Poocho lets you export everything as JSON or CSV from Settings, whenever you like.",
      },
      { kind: "h2", id: "compare", text: "What carries over, and what's new" },
      {
        kind: "table",
        caption: "CuriousCat and Poocho compared",
        head: ["", "CuriousCat", "Poocho"],
        ours: 2,
        rows: [
          ["Status", "Closed in October 2024", "Open and free"],
          ["Built around", "Twitter", "Instagram stories and WhatsApp status"],
          ["Anonymous questions", "Yes", "Yes, or named, or the asker's choice"],
          ["Before you read a question", "Minimal moderation", "Every question is checked; cruel ones are filtered first"],
          ["Answers", "A public profile", "A public page, plus 1080 × 1920 story cards"],
          ["Leaving", "Answers went with the service", "Export as JSON or CSV at any time"],
        ],
      },
      { kind: "h2", id: "start", text: "Start again in a minute" },
      {
        kind: "steps",
        items: [
          { title: "Claim your old handle", body: "If you were @something on CuriousCat, see whether it's free on [Poocho](/start)." },
          { title: "Tell your followers", body: "Post your “Ask me” card to your story, or pin the link in your bio on X." },
          { title: "Answer the first few fast", body: "People ask more once they can see you reply." },
        ],
      },
      CTA,
    ],
    faq: [
      { q: "Is CuriousCat coming back?", a: "As of October 2026 it remains closed, and its original domain was lost back in 2021." },
      { q: "Can I import my CuriousCat answers?", a: "No. CuriousCat's data closed with it, and Poocho only ever holds questions people send to you here." },
      { q: "Does Poocho work on X (Twitter)?", a: "Yes. Your link works anywhere you can paste one. Poocho's story cards are sized for Instagram and WhatsApp, and they look fine on X too." },
    ],
    related: ["/alternatives/ngl", "/alternatives/tellonym", "/ideas/story-questions"],
    sources: [
      { label: "Archive Team: CuriousCat", href: "https://wiki.archiveteam.org/index.php/CuriousCat" },
      { label: "Wikipedia: Ask.fm", href: "https://en.wikipedia.org/wiki/Ask.fm" },
      { label: "Archive Team: Retrospring", href: "https://wiki.archiveteam.org/index.php/Retrospring" },
    ],
  },

  {
    section: "guides",
    slug: "anonymous-questions-instagram-story",
    locale: "en",
    eyebrow: "Instagram guide",
    title: "How to get anonymous questions on your Instagram story",
    seoTitle: "Anonymous questions on your Instagram story",
    description:
      "Instagram's question sticker shows who replied. Here's how to get truly anonymous questions on your story with a link sticker, step by step, in two minutes.",
    published: DATE,
    updated: DATE,
    lede: "Instagram's own question sticker isn't anonymous: you can see who replied. To let people ask without their name, add a link sticker that opens an anonymous ask page. Here's the whole setup.",
    body: [
      { kind: "h2", id: "is-it-anonymous", text: "Is the Instagram question sticker anonymous?" },
      {
        kind: "p",
        text: "No. When someone answers your question sticker, Instagram shows you their username, and you can share their reply to your story. That's fine for “recommend me a song”, but people rarely ask what they really want to know with their name attached.",
      },
      { kind: "h2", id: "steps", text: "Set it up in five steps" },
      {
        kind: "steps",
        items: [
          { title: "Get your link", body: "Claim a link with your handle on [Poocho](/start). It's free and takes about 30 seconds." },
          { title: "Share your “Ask me” card", body: "Tap **Share to story** on your phone and Poocho opens the share sheet with a 1080 × 1920 card ready. On a computer, save the image instead." },
          { title: "Add a link sticker", body: "In the Instagram story editor, tap the sticker icon, choose **Link**, paste your Poocho link and set the sticker text to something like “ask me anything”." },
          { title: "Post, then wait", body: "Questions arrive in your Poocho inbox. Insults, threats and anyone sharing a phone number go to Filtered first." },
          { title: "Answer as a story card", body: "Open a question, write your answer, pick one of five card styles and share it back to your story. Each card carries your link, so the next question is one tap away." },
        ],
      },
      {
        kind: "note",
        tone: "haldi",
        title: "Every account can add a link sticker",
        text: "Instagram opened link stickers to all accounts in 2021, so there's no follower minimum.",
      },
      { kind: "h2", id: "better-questions", text: "Get more, and better, questions" },
      {
        kind: "list",
        items: [
          "**Be specific.** “Ask me about moving to Bengaluru” gets more questions than “ask me anything”. Steal one of [100 prompt ideas](/ideas/story-questions).",
          "**Answer the first few quickly.** People ask more once they can see you reply.",
          "**Post a follow-up story** a few hours later with your first answers on it.",
          "**Pin the link in your bio** so it keeps working after the story expires.",
          "**Use the same link on WhatsApp status.** It works anywhere a link does.",
        ],
      },
      { kind: "h2", id: "keep-it-kind", text: "Keep it kind" },
      {
        kind: "p",
        text: "You decide how strict the filter is (Relaxed, Standard or Strict) and can block words of your own, like an ex's name. You can pause your inbox whenever you like, and nothing in Filtered is shown unless you open it. More in [are anonymous question apps safe?](/guides/are-anonymous-question-apps-safe)",
      },
      CTA,
    ],
    faq: [
      { q: "Can I see who asked me a question?", a: "Not on an anonymous link. If you want names, set your link to Named, or to Asker's choice so people can decide." },
      { q: "Does this work with Snapchat and WhatsApp?", a: "Yes. Your link works anywhere you can paste one: Snapchat, WhatsApp status, your bio or a group chat." },
      {
        q: "Why are some questions in Filtered?",
        a: "Poocho checks every question before it reaches you. Insults, threats, sexual messages and personal details such as phone numbers go to Filtered. You can open the folder, move a question back, or never look.",
      },
      { q: "Do the people asking need Poocho?", a: "No. They tap your link, type and send. No app, no account." },
    ],
    related: ["/ideas/story-questions", "/alternatives/ngl", "/guides/are-anonymous-question-apps-safe"],
    translation: "/hi/guides/anonymous-questions-instagram-story",
    sources: [
      { label: "Fast Company: No, Instagram has not launched an anonymous questions sticker", href: "https://www.fastcompany.com/90520274/no-instagram-has-not-launched-an-anonymous-questions-sticker" },
    ],
  },

  {
    section: "guides",
    slug: "are-anonymous-question-apps-safe",
    locale: "en",
    eyebrow: "Safety guide",
    title: "Are anonymous question apps safe?",
    seoTitle: "Are anonymous question apps safe?",
    description:
      "Are NGL-style anonymous question apps safe? What regulators found, what “anonymous” really means, and seven checks to make before you put a link on your story.",
    published: DATE,
    updated: DATE,
    lede: "They can be, but the category has a record worth knowing. Here's what regulators found, what “anonymous” does and doesn't mean, and seven checks to make before you share any ask link.",
    body: [
      { kind: "h2", id: "record", text: "What regulators found" },
      {
        kind: "p",
        text: "In July 2024 the US Federal Trade Commission settled with NGL Labs. The FTC said NGL sent users fake messages made to look like they came from real people, sold “hints” that didn't reveal who asked, and claimed AI moderation it didn't deliver. NGL is now barred from users under 18.",
      },
      {
        kind: "p",
        text: "In September 2025 the US Department of Justice, acting for the FTC, sued the makers of Sendit, alleging fake messages, deceptive subscriptions and collecting data from children under 13.",
      },
      {
        kind: "p",
        text: "The pattern is the same both times: apps that profit from keeping you curious about who asked. That's the thing to check for.",
      },
      { kind: "h2", id: "anonymous", text: "What “anonymous” really means" },
      {
        kind: "p",
        text: "On a well-run app you're anonymous to the person you're asking, not to the service or the law. Apps keep some technical data, such as IP addresses, to stop abuse and to answer valid legal orders. Be wary of any app that promises you can never be traced, and of any app that offers to reveal who sent something.",
      },
      {
        kind: "p",
        text: "Poocho keeps limited technical data in an access-controlled log for 30 days and never shows it to hosts. The full detail is under [how anonymity works](/pledge#anonymity).",
      },
      { kind: "h2", id: "checks", text: "Seven checks before you share a link" },
      {
        kind: "list",
        ordered: true,
        items: [
          "**Does it promise real questions only?** Look for a written commitment, not just a tagline.",
          "**Does it sell hints or reveals?** If so, your askers aren't really anonymous, and hints were at the centre of both FTC cases.",
          "**What happens to cruel questions?** The best answer: they're filtered before you see them, into a folder you choose whether to open.",
          "**Can you control the filter?** Strictness levels, your own blocked words and a pause button matter on bad days.",
          "**Is there an age limit?** The apps in trouble marketed to teenagers. Poocho is 18+.",
          "**Can you leave with your data?** Export and delete should be a button, not an email to support.",
          "**Can you report, and get help?** Look for a report option on public answers and clear support details.",
        ],
      },
      {
        kind: "note",
        tone: "margin",
        title: "If a question hurts",
        text: "You don't have to answer it, and you don't have to read it. Delete it, block the words, or pause your link. In India, Tele-MANAS offers free, confidential mental health support day and night: call **14416**.",
      },
      { kind: "h2", id: "poocho", text: "How Poocho handles it" },
      {
        kind: "list",
        items: [
          "Every question in your inbox was typed by a person. A test checks this on every code change.",
          "No hints, clues or reveals, ever, and no paid feature touches anonymity.",
          "Questions are checked before delivery; you choose Relaxed, Standard or Strict, and can block your own words.",
          "Askers can send at most five questions to one person per hour.",
          "18+ for hosts and askers.",
          "Export or delete everything from Settings.",
        ],
      },
      CTA,
    ],
    faq: [
      {
        q: "Can the person I ask find out it was me?",
        a: "Not through Poocho. Hosts never see your IP address, device, location or any hint. One caveat: if your question includes details only you would know, people may guess.",
      },
      {
        q: "What should I do about a threatening question?",
        a: "Don't reply. Delete it and report it. If you believe someone is in danger, contact local emergency services; in India, dial 112.",
      },
      { q: "Are anonymous apps okay for teenagers?", a: "Poocho isn't: it's for adults only, and accounts that look like they belong to someone under 18 are closed." },
    ],
    related: ["/alternatives/ngl", "/guides/anonymous-questions-instagram-story", "/use-cases/town-hall"],
    translation: "/hi/guides/are-anonymous-question-apps-safe",
    sources: [
      FTC_NGL,
      { label: "FTC: Iconic Hearts Holdings, Inc. (Sendit), U.S. v.", href: "https://www.ftc.gov/legal-library/browse/cases-proceedings/232-3029-iconic-hearts-holdings-inc-us-v" },
    ],
  },

  {
    section: "use-cases",
    slug: "town-hall",
    locale: "en",
    eyebrow: "For teams",
    title: "Honest questions for your next town hall",
    seoTitle: "Anonymous questions for town halls and all-hands",
    description:
      "Collect honest, anonymous questions before your next town hall or all-hands. One free link, an abuse filter, and no sign-up for anyone asking. Here's how.",
    published: DATE,
    updated: DATE,
    lede: "People ask the real questions when their name isn't on them. Share one Poocho link before your all-hands, read every question in one inbox, and answer the ones that matter, on stage or in writing.",
    body: [
      { kind: "h2", id: "how", text: "How to run it" },
      {
        kind: "steps",
        items: [
          { title: "Make a link for the event", body: "Create a Poocho link with a prompt like “Ask leadership anything before Friday's town hall” and set it to Anonymous." },
          { title: "Share it a few days ahead", body: "Post it in Slack, Teams, email or the calendar invite. People asking don't need an account or an app." },
          { title: "Let the filter do the first pass", body: "Insults and personal details go to Filtered, so whoever reads questions aloud isn't caught off guard." },
          { title: "Group and answer", body: "Answer the common themes live, then publish written answers on your page for anyone who missed it." },
          { title: "Pause when you're done", body: "Pause the inbox after the event so questions don't pile up unanswered." },
        ],
      },
      { kind: "h2", id: "slido", text: "Poocho or Slido?" },
      {
        kind: "p",
        text: "Slido, from Cisco, is built for live sessions: attendees upvote questions on a shared screen while the event runs. If you need live voting, polls or a projector view, use Slido; Poocho doesn't do those yet. Poocho suits you when you want questions gathered ahead of time, an abuse filter on by default, and answers published afterwards on a page you can share.",
      },
      {
        kind: "table",
        caption: "Poocho and Slido for company Q&A",
        head: ["", "Poocho", "Slido"],
        ours: 1,
        rows: [
          ["Best for", "Gathering questions before and between events", "Live Q&A and polls during an event"],
          ["People asking need an account", "No", "No"],
          ["Abuse filter", "On for every question, three strictness levels", "Question review, depending on plan"],
          ["Live upvoting and screen", "Not yet", "Yes"],
          ["Price", "Free", "Free plan with limits, paid plans for larger events"],
        ],
      },
      {
        kind: "note",
        tone: "haldi",
        title: "Everyone must be 18 or over",
        text: "Poocho is for adults, which suits workplaces and universities but not schools.",
      },
      CTA,
    ],
    faq: [
      {
        q: "Can HR or leadership see who asked?",
        a: "Not on an anonymous link. The host sees the question and when it arrived, nothing else. Poocho keeps limited technical data for 30 days to stop abuse and never shows it to hosts.",
      },
      { q: "Can several people manage one link?", a: "Not yet: each link belongs to one account." },
      { q: "Can we publish the answers?", a: "Yes. Answers you mark as public appear on your page, so you can share one link to all of them after the event." },
    ],
    related: ["/use-cases/classroom", "/guides/are-anonymous-question-apps-safe", "/ideas/story-questions"],
  },

  {
    section: "use-cases",
    slug: "classroom",
    locale: "en",
    eyebrow: "For colleges",
    title: "Anonymous questions for college classes",
    seoTitle: "Anonymous questions for college classes",
    description:
      "Students ask more when nobody knows who asked. Use one free Poocho link to collect anonymous questions before or after a college lecture, with abuse filtered out.",
    published: DATE,
    updated: DATE,
    lede: "In most lectures, the question that matters goes unasked. A Poocho link lets students ask without raising a hand or giving a name, so you can clear up the confusing part before the exam does.",
    body: [
      {
        kind: "note",
        tone: "margin",
        title: "Colleges and universities only",
        text: "Poocho is for people aged 18 and over. Please don't use it with school classes.",
      },
      { kind: "h2", id: "ideas", text: "Four ways to use it" },
      {
        kind: "list",
        items: [
          "**Muddiest point.** At the end of a lecture, ask “What was least clear today?” and open the next class with the top three.",
          "**Before exams.** Run an “ask anything about the paper” link for a week and publish the answers so everyone sees them.",
          "**Seniors' AMA.** Final-year students answer first-years' questions about placements, hostels and electives.",
          "**Office hours.** Keep a standing link for the questions people are embarrassed to ask in person.",
        ],
      },
      { kind: "h2", id: "setup", text: "Set up in two minutes" },
      {
        kind: "steps",
        items: [
          { title: "Create your link", body: "Claim a link on [Poocho](/start) with a prompt like “What confused you in today's lecture?”." },
          { title: "Share it", body: "Put it on your last slide, in the class WhatsApp group or on the LMS." },
          { title: "Answer", body: "Read questions in your inbox and answer in class, or publish written answers on your page." },
        ],
      },
      { kind: "h2", id: "why", text: "Why anonymity helps" },
      {
        kind: "p",
        text: "Students worry about sounding slow in front of their classmates. Take the name away and that cost disappears, so you hear about the confusing part while there's still time to fix it. The filter keeps the occasional joker out of your inbox.",
      },
      CTA,
    ],
    faq: [
      { q: "Do students need an account?", a: "No. They open the link, type a question and send it." },
      { q: "Can I see which student asked?", a: "Not on an anonymous link. If you need names, for example for participation marks, set the link to Named." },
      { q: "Is it free?", a: "Yes." },
    ],
    related: ["/use-cases/town-hall", "/ideas/story-questions", "/guides/anonymous-questions-instagram-story"],
  },

  {
    section: "ideas",
    slug: "story-questions",
    locale: "en",
    eyebrow: "Prompt ideas",
    title: "100 questions to put on your Instagram story",
    seoTitle: "100 questions to ask on your Instagram story",
    description:
      "100 ask-me-anything prompts for your Instagram story, sorted by mood: easy, college, career, creators, deep and Hinglish. Tap any prompt to use it on your link.",
    published: DATE,
    updated: DATE,
    lede: "A specific prompt gets more questions than “ask me anything”. Pick one below and tap it to put it on your Poocho link, then swap it every week or two. We refresh this list every month.",
    body: [
      { kind: "h2", id: "easy", text: "Easy openers" },
      {
        kind: "chits",
        items: [
          "Ask me anything!",
          "Ask me for a song recommendation",
          "Ask me what I'd order at your favourite café",
          "Ask me my unpopular opinions",
          "Ask me about the last thing that made me laugh",
          "Ask me to rate your weekend plans",
          "Ask me what I'm watching right now",
          "Ask me about my comfort food",
          "Ask me the most random fact I know",
          "Ask me to pick between two things",
          "Ask me about my worst haircut",
          "Ask me which emoji I overuse",
          "Ask me what's on my home screen",
          "Ask me about my perfect Sunday",
          "Ask me something you've always wondered",
        ],
      },
      { kind: "h2", id: "college", text: "College life" },
      {
        kind: "chits",
        items: [
          "Ask me about my first year of college",
          "Ask me how I survived exam week",
          "Ask me about hostel life",
          "Ask me which elective is actually worth it",
          "Ask me about college fests",
          "Ask me how I take notes",
          "Ask me about choosing my branch",
          "Ask me about moving cities for college",
          "Ask me what I'd tell my first-year self",
          "Ask me about internships",
          "Ask me how I balance college and a part-time job",
          "Ask me about the clubs I joined",
          "Ask me how I deal with backlogs",
          "Ask me about mess food, honestly",
          "Ask me about studying abroad",
          "Ask me how I made friends in college",
          "Ask me about entrance exam prep",
          "Ask me about my favourite professor",
        ],
      },
      { kind: "h2", id: "career", text: "Career and money" },
      {
        kind: "chits",
        items: [
          "Ask me about my first job",
          "Ask me how I cracked my placement",
          "Ask me about switching careers",
          "Ask me how I budget my salary",
          "Ask me about working from home",
          "Ask me about my interview mistakes",
          "Ask me how I negotiated my offer",
          "Ask me about freelancing",
          "Ask me about building a side project",
          "Ask me what my job is really like",
          "Ask me to look at your résumé",
          "Ask me about learning to code",
          "Ask me how I started investing",
          "Ask me about quitting my job",
          "Ask me about my worst manager",
          "Ask me about government exam prep",
          "Ask me about starting a business",
        ],
      },
      { kind: "h2", id: "creators", text: "For creators" },
      {
        kind: "chits",
        items: [
          "Ask me how I plan my reels",
          "Ask me about my editing apps",
          "Ask me how I got my first 1,000 followers",
          "Ask me about brand deals",
          "Ask me what goes wrong behind the scenes",
          "Ask me about my camera setup",
          "Ask me how I handle hate comments",
          "Ask me which post flopped and why",
          "Ask me about my content calendar",
          "Ask me what I'd do if I started again today",
          "Ask me about creator burnout",
          "Ask me about my next collab",
          "Ask me how I write captions",
          "Ask me how long one reel takes",
          "Ask me about finding my niche",
          "Ask me to review your profile",
          "Ask me what's coming next on this page",
        ],
      },
      { kind: "h2", id: "deep", text: "Deep and honest" },
      {
        kind: "chits",
        items: [
          "Ask me something you'd never ask to my face",
          "Ask me about a lesson I learned the hard way",
          "Ask me what I'm working on in myself",
          "Ask me about my biggest fear",
          "Ask me what I'd change about last year",
          "Ask me about friendships that ended",
          "Ask me about my mental health routine",
          "Ask me what makes me feel confident",
          "Ask me about my family",
          "Ask me about a risk I'm glad I took",
          "Ask me what I'm grateful for this week",
          "Ask me about a time I was wrong",
          "Ask me what I wish people knew about me",
          "Ask me for advice, I'll be honest",
          "Ask me about growing up in a small town",
          "Ask me about my goals for next year",
          "Ask me the question you've been holding back",
        ],
      },
      { kind: "h2", id: "hinglish", text: "Hinglish" },
      {
        kind: "chits",
        items: [
          "Mujhse kuch bhi poocho!",
          "Poocho jo poochna hai, naam mat batana",
          "Mera favourite gaana guess karo",
          "Mere baare mein kya sochte ho? Bata do",
          "College ke baare mein kuch bhi poocho",
          "Mujhse career advice maango",
          "Meri life ka sabse funny kissa poocho",
          "Koi baat jo tum jaanna chahte ho?",
          "Mere bachpan ke baare mein poocho",
          "Mujhse relationship advice lo",
          "Weekend plans poocho",
          "Meri last reel ko rate karo",
          "Kya hum pehle mil chuke hain?",
          "Woh sawaal jo kabhi face pe nahi pooch paaye",
          "Mere city ke baare mein poocho",
          "Mujhse movie recommendation lo",
        ],
      },
      {
        kind: "note",
        tone: "leaf",
        title: "These are ideas, not questions",
        text: "Tapping a prompt only sets the line on your own ask page. Poocho never sends prompts to your inbox as if someone asked them; that's [our pledge](/pledge).",
      },
      CTA,
    ],
    faq: [
      {
        q: "What makes a good story prompt?",
        a: "Specific beats general. Name a topic you're happy to talk about (your city, your job, your last trip), and people instantly know what to ask.",
      },
      { q: "How often should I change my prompt?", a: "Every week or two, or whenever questions slow down. A new prompt gives followers a new reason to tap." },
    ],
    related: ["/guides/anonymous-questions-instagram-story", "/alternatives/ngl", "/use-cases/classroom"],
  },
];
