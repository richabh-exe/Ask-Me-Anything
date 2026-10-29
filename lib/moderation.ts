import type { FilterLevel, ModerationCategory, ModerationResult } from "./types";

/*
 * A local, dependency-free stand-in for the pre-delivery moderation service
 * described in the PRD (§9.1). In production this runs server-side, backed by
 * a hosted moderation model plus a Hindi/Hinglish classifier. The heuristics
 * here keep the whole ask → filter → inbox loop working in the browser, and
 * the result shape is the same one the real service will return.
 *
 * Honesty rule from the PRD: this filter catches a lot, not everything.
 */

interface Signal {
  category: ModerationCategory;
  weight: number;
  /** Matched against normalised text, with word boundaries. */
  phrases: string[];
}

// "you're ugly", "ur so fat", "tu pagal"… Directed insults weigh more than the bare word.
const YOU = ["you are", "you're", "youre", "ur", "u r", "u are", "you r", "you look", "you're so", "ur so", "so", "tu", "tum"];
const INSULTS = ["ugly", "fat", "stupid", "dumb", "pathetic", "worthless", "disgusting", "annoying", "fake", "a loser", "an idiot", "a joke", "pagal", "bewakoof"];
const DIRECTED = YOU.flatMap((you) => INSULTS.map((insult) => `${you} ${insult}`));

const SIGNALS: Signal[] = [
  {
    category: "harassment",
    weight: 0.75,
    phrases: [
      ...DIRECTED,
      "loser", "idiot", "pathetic", "worthless", "disgusting", "fatty",
      "nobody likes you", "no one likes you", "everyone hates you", "you suck",
      "attention seeker", "nalayak", "kamina", "kamini", "kamine", "harami",
      "kutiya", "kuttiya", "kutte kamine", "teri maa ki", "teri behen ki",
      "tu mota", "tu moti", "kitna mota", "kitni moti", "moti bhains",
      "कमीना", "कमीनी", "हरामी", "कुतिया", "नालायक", "मोटी भैंस",
    ],
  },
  {
    category: "harassment",
    weight: 0.4,
    phrases: ["ugly", "stupid", "dumb", "cringe", "clown", "shut up", "pagal", "bewakoof", "gadha", "ullu", "पागल", "बेवकूफ", "गधा"],
  },
  {
    category: "profanity",
    weight: 0.9,
    phrases: [
      "fuck", "fucking", "bitch", "bastard", "asshole", "dick", "slut", "whore",
      "chutiya", "chutia", "chutiye", "bhosdi", "bhosdike", "madarchod", "behenchod",
      "bhenchod", "gandu", "randi", "lavde", "lodu",
      "चुतिया", "भोसड़ी", "मादरचोद", "बहनचोद", "गांडू", "रंडी",
    ],
  },
  {
    category: "sexual",
    weight: 0.85,
    phrases: ["nudes", "send nudes", "nude", "boobs", "horny", "sexy pics", "hot pics", "sex chat", "sext", "rape"],
  },
  {
    category: "threat",
    weight: 1,
    phrases: [
      "kill you", "i will find you", "i know where you live", "beat you up", "hurt you",
      "kill yourself", "kys", "go die", "throw acid", "acid phek", "acid fek",
      "maar dunga", "maar dalunga", "maar daalunga", "jaan se maar", "dekh lunga",
      "मार दूंगा", "मार डालूंगा", "देख लूंगा",
    ],
  },
  {
    category: "self_harm",
    weight: 0.6,
    phrases: [
      "kill myself", "suicide", "end my life", "want to die", "self harm", "cut myself",
      "no reason to live", "marna chahta", "marna chahti", "jeena nahi", "jeene ka mann nahi",
      "मरना चाहता", "मरना चाहती", "आत्महत्या",
    ],
  },
];

/** Categories that always filter, whatever strictness the host chose. */
const ALWAYS_FILTER: ModerationCategory[] = ["threat", "self_harm", "personal_info", "blocked_word"];

export const THRESHOLDS: Record<FilterLevel, number> = {
  relaxed: 0.85,
  standard: 0.6,
  strict: 0.3,
};

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", $: "s" };

/** Lowercase, undo common leetspeak and squeeze stretched letters ("uglyyyy" → "uglyy"). */
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFC")
    .replace(/[01345@$7]/g, (c) => LEET[c] ?? c)
    .replace(/(\p{L})\1{2,}/gu, "$1$1")
    .replace(/[^\p{L}\p{M}\s']/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function squeeze(text: string): string {
  // Second pass that collapses all doubled letters, so "uglyy" also matches "ugly".
  return text.replace(/(\p{L})\1+/gu, "$1");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function phrasePattern(phrase: string): RegExp {
  // \b does not understand Devanagari, so use explicit letter/mark boundaries.
  return new RegExp(`(?:^|[^\\p{L}\\p{M}])${escapeRegExp(phrase)}(?:$|[^\\p{L}\\p{M}])`, "u");
}

function containsPhrase(haystack: string, phrase: string): boolean {
  return phrasePattern(phrase).test(haystack);
}

/** Each phrase compiles twice: as written, and squeezed to match stretched spellings. */
const COMPILED = SIGNALS.map((signal) => ({
  ...signal,
  patterns: signal.phrases.map((phrase) => [phrasePattern(phrase), phrasePattern(squeeze(phrase))] as const),
}));

// Indian mobile numbers, however they are spaced: "98765 43210", "+91-987-654-3210".
const PHONE = /(?<!\d)[6-9](?:[\s-]?\d){9}(?!\d)/;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]{2,}/;
const ADDRESS = /\b(?:house|flat|plot|h\.?\s?no|ghar)\s?(?:no\.?|number)?\s?\d+/i;

export interface ModerationOptions {
  level?: FilterLevel;
  blockedWords?: string[];
}

export function moderate(text: string, options: ModerationOptions = {}): ModerationResult {
  const level = options.level ?? "standard";
  const raw = text.trim();
  const norm = normalise(raw);
  const squeezed = squeeze(norm);

  const categories = new Set<ModerationCategory>();
  let keep = 1; // product of (1 - weight): the probability that nothing is wrong

  const hit = (category: ModerationCategory, weight: number) => {
    categories.add(category);
    keep *= 1 - weight;
  };

  for (const signal of COMPILED) {
    const matched = signal.patterns.some(([plain, loose]) => plain.test(norm) || loose.test(squeezed));
    if (matched) hit(signal.category, signal.weight);
  }

  if (PHONE.test(raw) || EMAIL.test(raw) || ADDRESS.test(raw)) hit("personal_info", 0.9);

  for (const word of options.blockedWords ?? []) {
    const w = normalise(word);
    if (w && (containsPhrase(norm, w) || containsPhrase(squeezed, squeeze(w)))) {
      hit("blocked_word", 1);
      break;
    }
  }

  const letters = raw.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 12 && letters.replace(/[^A-Z]/g, "").length / letters.length > 0.7) {
    hit("shouting", 0.18);
  }

  const score = Math.round((1 - keep) * 100) / 100;
  const list = [...categories];
  const flagged = score >= THRESHOLDS[level] || list.some((c) => ALWAYS_FILTER.includes(c));

  return { score, categories: list, flagged, supportCard: categories.has("self_harm") };
}

export function hasPersonalInfo(text: string): boolean {
  return PHONE.test(text) || EMAIL.test(text) || ADDRESS.test(text);
}

export const CATEGORY_LABEL: Record<ModerationCategory, string> = {
  harassment: "Insult",
  profanity: "Swearing",
  sexual: "Sexual",
  threat: "Threat",
  self_harm: "May need support",
  personal_info: "Personal info",
  blocked_word: "Your blocked words",
  shouting: "Shouting",
};
