import type { Profile, Question } from "./types";

/*
 * The /@demo sample page. Every line here was written by the Poocho team as
 * an example and the page says so. These are never shown in an inbox.
 */
export const SAMPLE_PROFILE: Profile = {
  handle: "demo",
  displayName: "Sample page",
  prompt: "Ask me anything about starting college",
  mode: "choice",
  filterLevel: "standard",
  blockedWords: [],
  paused: false,
  createdAt: 0,
  ageConfirmedAt: 0,
};

const clean = { score: 0, categories: [], flagged: false, supportCard: false };

export const SAMPLE_ANSWERS: Question[] = [
  {
    id: "sample-1",
    handle: "demo",
    body: "How did you make friends in the first month?",
    createdAt: 0,
    status: "answered",
    moderation: clean,
    answer: {
      body: "I said yes to every chai invite in week one, even the awkward ones. Two of those people are still my closest friends.",
      template: "ink",
      isPublic: true,
      answeredAt: 3,
    },
  },
  {
    id: "sample-2",
    handle: "demo",
    body: "Is it okay to not know what you want to study yet?",
    createdAt: 0,
    status: "answered",
    moderation: clean,
    answer: {
      body: "Completely. Most people I know changed plans at least once. Pick the class that makes you curious and see where it goes.",
      template: "notebook",
      isPublic: true,
      answeredAt: 2,
    },
  },
  {
    id: "sample-3",
    handle: "demo",
    body: "Hostel or PG?",
    createdAt: 0,
    status: "answered",
    moderation: clean,
    answer: {
      body: "Hostel for the first year if you can. You meet more people by accident than you ever will on purpose.",
      template: "haldi",
      isPublic: true,
      answeredAt: 1,
    },
  },
];
