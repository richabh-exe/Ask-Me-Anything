"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";

export type Locale = "en" | "hi";

/*
 * Copy for the public surfaces: the landing page and the ask page that askers
 * reach from Instagram. The host dashboard is English-only for now.
 */
const en = {
  "nav.sample": "Sample page",
  "nav.getLink": "Get your link",
  "nav.inbox": "Your inbox",
  "nav.home": "Poocho home",
  "nav.lang": "हिंदी में देखें",

  "hero.line1": "Get asked anything.",
  "hero.line2": "Only by real people.",
  "hero.body":
    "Share one link on your story. People ask without giving their name, Poocho filters out the cruel stuff before you see it, and your best answers become story cards.",
  "hero.cta": "Get your link",
  "hero.secondary": "See a sample page",
  "hero.trust1": "No fake questions, ever",
  "hero.trust2": "No paid hints about who asked",
  "hero.trust3": "18+ only",

  "demo.caption": "Try it. This is what your followers see.",
  "demo.prompt": "Ask me anything!",
  "demo.placeholder": "Type a question…",
  "demo.send": "Send",
  "demo.inbox": "Inbox",
  "demo.filtered": "Filtered",
  "demo.delivered": "Delivered. It's waiting in the inbox.",
  "demo.filteredMsg": "Filtered. Mean questions go to a separate folder, so you never have to read them.",
  "demo.idle": "Try something kind, then something rude, and watch where each one goes.",
  "demo.note": "This demo runs in your browser. Nothing is sent.",
  "demo.anon": "Anonymous",

  "how.title": "How Poocho works",
  "how.1.title": "Share your link",
  "how.1.body": "Post poocho.app/@you on your Instagram story, WhatsApp status or bio.",
  "how.2.title": "People ask, no name needed",
  "how.2.body": "Followers type a question. You decide whether names stay hidden, are shown, or are up to them.",
  "how.3.title": "Poocho filters first",
  "how.3.body": "Insults, threats and personal details move to a Filtered folder before they reach you.",
  "how.4.title": "Answer as a story card",
  "how.4.body": "Write your reply, pick a card and share it straight to your story.",

  "cards.title": "Answers that look good on a story",
  "cards.body":
    "Every answer becomes a 1080 × 1920 image with your link on it, so the next question is one tap away.",
  "cards.example": "Example card",
  "cards.pick": "Card style",
  "cards.q": "What's one thing you'd tell your first-year self?",
  "cards.a": "Talk to the quiet kid in the back row. Join the club you think you're bad at. And sleep, seriously.",

  "pledge.title": "The Real Questions Pledge",
  "pledge.intro":
    "Other anonymous apps faked questions and charged for “hints” about who sent them. Poocho is built on the opposite promise.",
  "pledge.1": "Every question in your inbox was typed by a real person. We never send fake ones to keep you hooked.",
  "pledge.2": "We will never sell hints, clues or reveals about who asked. Not at any price.",
  "pledge.3": "Cruel questions are filtered before you see them, and you decide how strict the filter is.",
  "pledge.4": "Poocho is for adults. Hosts and askers must be 18 or older.",
  "pledge.5": "Your answers are yours. Export them or delete everything, anytime.",
  "pledge.sign": "Team Poocho",
  "pledge.more": "Read the full pledge",

  "claim.title": "Claim your link",
  "claim.label": "Choose your link",
  "claim.free": "@{h} is free",
  "claim.mine": "@{h} is your link",
  "claim.invalid": "Use 3–20 letters, numbers or underscores",
  "claim.reserved": "@{h} isn't available",
  "claim.cta": "Claim @{h}",
  "claim.open": "Open your inbox",

  "footer.tag": "Ask anything. Honestly, safely.",
  "footer.adult": "Poocho is for people 18 and over.",
  "footer.pledge": "Real Questions Pledge",
  "footer.guidelines": "Community guidelines",
  "footer.privacy": "How anonymity works",

  "ask.anon": "Anonymous. @{h} can't see who you are.",
  "ask.named": "Your name will be shown to @{h}.",
  "ask.choice": "Show my name to @{h}",
  "ask.choiceOff": "Anonymous unless you choose to show your name.",
  "ask.namePh": "Your name",
  "ask.nameLabel": "Name shown with your question",
  "ask.questionLabel": "Your question for @{h}",
  "ask.placeholder": "Write your question…",
  "ask.send": "Send question",
  "ask.sending": "Folding…",
  "ask.policy":
    "Poocho keeps limited technical data for 30 days to stop abuse. It is never shown to @{h}.",
  "ask.sentTitle": "Sent!",
  "ask.sent": "Your question is on its way to @{h}.",
  "ask.another": "Ask another question",
  "ask.own": "Get your own link",
  "ask.ownTitle": "Want questions like this?",
  "ask.ownBody": "Get a link like @{h}'s in about 30 seconds. No fake questions, ever.",
  "ask.answers": "Answers from @{h}",
  "ask.noAnswers": "@{h} hasn't published any answers yet. Yours could be the first question.",
  "ask.paused": "@{h} has paused their inbox for now. Check back later.",
  "ask.rate": "You've sent 5 questions to @{h} in the last hour. Try again in {m} min.",
  "ask.pii": "This looks like it includes a phone number, email or address. Questions with personal details go to a filtered folder.",
  "ask.nameRequired": "Add your name. This link only accepts named questions.",
  "ask.unclaimedTitle": "Nobody has claimed @{h} yet",
  "ask.unclaimedBody": "If this is the link you want, it can be yours in about 30 seconds.",
  "ask.claim": "Claim @{h}",
  "ask.ownPage": "This is your page. Questions you send here land in your own inbox, which is handy for testing.",
  "ask.openInbox": "Open inbox",
  "ask.samplePage": "This is a sample page with answers written by the Poocho team. Questions sent here aren't delivered anywhere.",
  "ask.sampleSent": "That's how it feels. On a real page, your question would now be in the host's inbox.",
  "ask.support":
    "If you're going through something heavy, you don't have to carry it alone. Tele-MANAS is free and confidential, day and night: call 14416.",
  "ask.anonQuestion": "Anonymous question",
  "ask.report": "Report",
  "ask.reported": "Thanks. This preview can't send reports yet. In the live app they go straight to the Poocho safety team.",
  "ask.askedBy": "Asked by {n}",
} as const;

export type MessageKey = keyof typeof en;

const hi: Record<MessageKey, string> = {
  "nav.sample": "सैंपल पेज",
  "nav.getLink": "अपना लिंक पाइए",
  "nav.inbox": "आपका इनबॉक्स",
  "nav.home": "Poocho होम",
  "nav.lang": "View in English",

  "hero.line1": "लोग आपसे कुछ भी पूछें।",
  "hero.line2": "बस असली लोग।",
  "hero.body":
    "अपनी स्टोरी पर एक लिंक डालिए। लोग बिना नाम बताए सवाल पूछें, Poocho बुरे सवाल आपके देखने से पहले ही छाँट दे, और आपके बेहतरीन जवाब स्टोरी कार्ड बन जाएँ।",
  "hero.cta": "अपना लिंक पाइए",
  "hero.secondary": "सैंपल पेज देखिए",
  "hero.trust1": "कभी कोई नकली सवाल नहीं",
  "hero.trust2": "किसने पूछा, इसके पैसे वाले हिंट नहीं",
  "hero.trust3": "सिर्फ़ 18+",

  "demo.caption": "आज़माइए। आपके फ़ॉलोअर्स यही देखेंगे।",
  "demo.prompt": "मुझसे कुछ भी पूछो!",
  "demo.placeholder": "अपना सवाल लिखिए…",
  "demo.send": "भेजिए",
  "demo.inbox": "इनबॉक्स",
  "demo.filtered": "फ़िल्टर्ड",
  "demo.delivered": "पहुँच गया। सवाल इनबॉक्स में इंतज़ार कर रहा है।",
  "demo.filteredMsg": "फ़िल्टर हो गया। बुरे सवाल अलग फ़ोल्डर में जाते हैं, ताकि आपको उन्हें पढ़ना न पड़े।",
  "demo.idle": "पहले कुछ अच्छा लिखिए, फिर कुछ बदतमीज़ी वाला, और देखिए कौन-सा कहाँ जाता है।",
  "demo.note": "यह डेमो आपके ब्राउज़र में चलता है। कुछ भी भेजा नहीं जाता।",
  "demo.anon": "गुमनाम",

  "how.title": "Poocho कैसे काम करता है",
  "how.1.title": "अपना लिंक शेयर कीजिए",
  "how.1.body": "poocho.app/@you को अपनी इंस्टाग्राम स्टोरी, व्हाट्सऐप स्टेटस या बायो में डालिए।",
  "how.2.title": "लोग पूछें, नाम ज़रूरी नहीं",
  "how.2.body": "फ़ॉलोअर्स सवाल लिखें। नाम छिपे, दिखे या उनकी मर्ज़ी पर रहे, यह आप तय कीजिए।",
  "how.3.title": "Poocho पहले छाँटता है",
  "how.3.body": "गालियाँ, धमकियाँ और निजी जानकारी आप तक पहुँचने से पहले फ़िल्टर्ड फ़ोल्डर में चली जाती हैं।",
  "how.4.title": "जवाब को स्टोरी कार्ड बनाइए",
  "how.4.body": "जवाब लिखिए, कार्ड चुनिए और सीधे अपनी स्टोरी पर शेयर कीजिए।",

  "cards.title": "ऐसे जवाब जो स्टोरी पर अच्छे लगें",
  "cards.body": "हर जवाब 1080 × 1920 की इमेज बन जाता है जिस पर आपका लिंक होता है, ताकि अगला सवाल बस एक टैप दूर हो।",
  "cards.example": "उदाहरण कार्ड",
  "cards.pick": "कार्ड का स्टाइल",
  "cards.q": "कॉलेज के पहले साल वाले खुद को आप क्या एक बात बताएँगे?",
  "cards.a": "पीछे की बेंच पर बैठे चुप लड़के से बात करो। वो क्लब जॉइन करो जिसमें लगता है तुम अच्छे नहीं हो। और सच में, नींद पूरी करो।",

  "pledge.title": "असली सवालों का वादा",
  "pledge.intro":
    "दूसरे गुमनाम ऐप्स ने नकली सवाल भेजे और यह बताने के पैसे लिए कि सवाल किसने भेजा। Poocho इसके ठीक उलट वादे पर बना है।",
  "pledge.1": "आपके इनबॉक्स का हर सवाल किसी असली इंसान ने लिखा है। आपको उलझाए रखने के लिए हम कभी नकली सवाल नहीं भेजते।",
  "pledge.2": "सवाल किसने पूछा, इसके हिंट या सुराग हम कभी नहीं बेचेंगे। किसी भी कीमत पर नहीं।",
  "pledge.3": "बुरे सवाल आपके देखने से पहले फ़िल्टर हो जाते हैं, और फ़िल्टर कितना सख़्त हो, यह आप तय करते हैं।",
  "pledge.4": "Poocho बड़ों के लिए है। पूछने वाले और जवाब देने वाले, दोनों की उम्र 18 या उससे ज़्यादा होनी चाहिए।",
  "pledge.5": "आपके जवाब आपके हैं। जब चाहें एक्सपोर्ट कीजिए या सब कुछ डिलीट कर दीजिए।",
  "pledge.sign": "टीम Poocho",
  "pledge.more": "पूरा वादा पढ़िए",

  "claim.title": "अपना लिंक लीजिए",
  "claim.label": "अपना लिंक चुनिए",
  "claim.free": "@{h} उपलब्ध है",
  "claim.mine": "@{h} आपका लिंक है",
  "claim.invalid": "3–20 अक्षर, अंक या अंडरस्कोर इस्तेमाल कीजिए",
  "claim.reserved": "@{h} उपलब्ध नहीं है",
  "claim.cta": "@{h} लीजिए",
  "claim.open": "अपना इनबॉक्स खोलिए",

  "footer.tag": "कुछ भी पूछिए। ईमानदारी से, सुरक्षित तरीके से।",
  "footer.adult": "Poocho 18 साल और उससे ज़्यादा उम्र के लोगों के लिए है।",
  "footer.pledge": "असली सवालों का वादा",
  "footer.guidelines": "कम्युनिटी के नियम",
  "footer.privacy": "गुमनामी कैसे काम करती है",

  "ask.anon": "गुमनाम। @{h} नहीं देख सकते कि आप कौन हैं।",
  "ask.named": "आपका नाम @{h} को दिखेगा।",
  "ask.choice": "@{h} को मेरा नाम दिखाइए",
  "ask.choiceOff": "जब तक आप नाम दिखाना न चुनें, आप गुमनाम हैं।",
  "ask.namePh": "आपका नाम",
  "ask.nameLabel": "सवाल के साथ दिखने वाला नाम",
  "ask.questionLabel": "@{h} के लिए आपका सवाल",
  "ask.placeholder": "अपना सवाल लिखिए…",
  "ask.send": "सवाल भेजिए",
  "ask.sending": "मोड़ रहे हैं…",
  "ask.policy": "गलत इस्तेमाल रोकने के लिए Poocho 30 दिनों तक सीमित तकनीकी जानकारी रखता है। यह @{h} को कभी नहीं दिखाई जाती।",
  "ask.sentTitle": "भेज दिया!",
  "ask.sent": "आपका सवाल @{h} तक पहुँच रहा है।",
  "ask.another": "एक और सवाल पूछिए",
  "ask.own": "अपना लिंक पाइए",
  "ask.ownTitle": "आपको भी ऐसे सवाल चाहिए?",
  "ask.ownBody": "करीब 30 सेकंड में @{h} जैसा लिंक पाइए। कभी कोई नकली सवाल नहीं।",
  "ask.answers": "@{h} के जवाब",
  "ask.noAnswers": "@{h} ने अभी तक कोई जवाब पब्लिश नहीं किया है। पहला सवाल आपका हो सकता है।",
  "ask.paused": "@{h} ने फ़िलहाल अपना इनबॉक्स रोक रखा है। थोड़ी देर बाद आइए।",
  "ask.rate": "आप पिछले एक घंटे में @{h} को 5 सवाल भेज चुके हैं। {m} मिनट बाद फिर कोशिश कीजिए।",
  "ask.pii": "लगता है इसमें फ़ोन नंबर, ईमेल या पता है। निजी जानकारी वाले सवाल फ़िल्टर्ड फ़ोल्डर में जाते हैं।",
  "ask.nameRequired": "अपना नाम लिखिए। यह लिंक सिर्फ़ नाम वाले सवाल लेता है।",
  "ask.unclaimedTitle": "@{h} को अभी तक किसी ने नहीं लिया है",
  "ask.unclaimedBody": "अगर आपको यही लिंक चाहिए, तो करीब 30 सेकंड में यह आपका हो सकता है।",
  "ask.claim": "@{h} लीजिए",
  "ask.ownPage": "यह आपका पेज है। यहाँ भेजे गए सवाल आपके अपने इनबॉक्स में आते हैं, टेस्ट करने के लिए बढ़िया।",
  "ask.openInbox": "इनबॉक्स खोलिए",
  "ask.samplePage": "यह सैंपल पेज है, इसके जवाब Poocho टीम ने लिखे हैं। यहाँ भेजे गए सवाल कहीं नहीं पहुँचते।",
  "ask.sampleSent": "ऐसा लगता है। असली पेज पर आपका सवाल अब होस्ट के इनबॉक्स में होता।",
  "ask.support":
    "अगर आप किसी मुश्किल से गुज़र रहे हैं, तो आपको यह अकेले नहीं सहना है। Tele-MANAS मुफ़्त और गोपनीय है, दिन-रात: 14416 पर कॉल कीजिए।",
  "ask.anonQuestion": "गुमनाम सवाल",
  "ask.report": "रिपोर्ट कीजिए",
  "ask.reported": "शुक्रिया। यह प्रीव्यू अभी रिपोर्ट नहीं भेज सकता। असली ऐप में रिपोर्ट सीधे Poocho की सेफ़्टी टीम तक जाती है।",
  "ask.askedBy": "{n} ने पूछा",
};

const DICTIONARIES: Record<Locale, Record<MessageKey, string>> = { en, hi };
const STORAGE_KEY = "poocho:locale";

const localeListeners = new Set<() => void>();

function readLocale(): Locale {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "hi" ? "hi" : "en";
  } catch {
    return "en";
  }
}

function subscribeLocale(listener: () => void) {
  localeListeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    localeListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;

interface I18n {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translate;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribeLocale, readLocale, () => "en" as Locale);

  const setLocale = useCallback((next: Locale) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* fall through: the change still applies to this tab */
    }
    localeListeners.forEach((fn) => fn());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "hi" ? "hi" : "en";
  }, [locale]);

  const value = useMemo<I18n>(() => {
    const dict = DICTIONARIES[locale];
    const t: Translate = (key, vars) => {
      let text: string = dict[key] ?? en[key];
      if (vars) for (const [name, v] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(v));
      return text;
    };
    return { locale, setLocale, t };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
