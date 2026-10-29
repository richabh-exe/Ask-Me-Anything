import { checkHandle } from "./handle";
import { moderate } from "./moderation";
import { readDB, writeDB, clearDB } from "./store";
import type { Answer, LinkMode, FilterLevel, Profile, Question, QuestionStatus } from "./types";

/*
 * Every state change in the product goes through this file.
 *
 * The Real Questions guarantee (PRD US-6): `askQuestion` is the only function
 * that adds to `questions`, and it only ever stores text a person typed.
 * tests/real-questions.test.ts enforces this.
 */

export const MAX_QUESTION = 300;
export const MAX_ANSWER = 500;
export const RATE_LIMIT = 5;
export const RATE_WINDOW_MS = 60 * 60 * 1000;
export const FILTERED_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface NewProfile {
  handle: string;
  displayName: string;
  prompt: string;
  mode: LinkMode;
  filterLevel: FilterLevel;
}

export function createProfile(input: NewProfile, now = Date.now()): Profile {
  const check = checkHandle(input.handle);
  if (!check.ok) throw new Error(`Handle not available: ${input.handle}`);
  const profile: Profile = {
    handle: check.handle,
    displayName: input.displayName.trim() || check.handle,
    prompt: input.prompt.trim() || "Ask me anything!",
    mode: input.mode,
    filterLevel: input.filterLevel,
    blockedWords: [],
    paused: false,
    createdAt: now,
    ageConfirmedAt: now,
  };
  // A new link starts with an empty inbox. Nothing is ever pre-filled.
  writeDB((db) => ({ ...db, profile, questions: [] }));
  return profile;
}

export function updateProfile(patch: Partial<Omit<Profile, "handle" | "createdAt" | "ageConfirmedAt">>) {
  writeDB((db) => (db.profile ? { ...db, profile: { ...db.profile, ...patch } } : db));
}

export type AskResult =
  | { ok: true; status: QuestionStatus; supportCard: boolean }
  | { ok: false; reason: "unclaimed" | "paused" | "empty" | "too_long" | "name_required" }
  | { ok: false; reason: "rate_limited"; retryInMs: number };

export function sendsInWindow(handle: string, now = Date.now()): number[] {
  return (readDB().sent[handle] ?? []).filter((t) => now - t < RATE_WINDOW_MS);
}

export function askQuestion(
  handle: string,
  body: string,
  options: { askerName?: string } = {},
  now = Date.now(),
): AskResult {
  const db = readDB();
  const profile = db.profile;
  const text = body.trim();

  if (!profile || profile.handle !== handle) return { ok: false, reason: "unclaimed" };
  if (profile.paused) return { ok: false, reason: "paused" };
  if (!text) return { ok: false, reason: "empty" };
  if (text.length > MAX_QUESTION) return { ok: false, reason: "too_long" };

  const askerName = options.askerName?.trim();
  if (profile.mode === "named" && !askerName) return { ok: false, reason: "name_required" };

  const recent = sendsInWindow(handle, now);
  if (recent.length >= RATE_LIMIT) {
    return { ok: false, reason: "rate_limited", retryInMs: RATE_WINDOW_MS - (now - recent[0]) };
  }

  const moderation = moderate(text, { level: profile.filterLevel, blockedWords: profile.blockedWords });
  const question: Question = {
    id: uid(),
    handle,
    body: text,
    createdAt: now,
    status: moderation.flagged ? "filtered" : "new",
    moderation,
    ...(profile.mode !== "anonymous" && askerName ? { askerName } : {}),
  };

  writeDB((current) => ({
    ...current,
    questions: [question, ...current.questions],
    sent: { ...current.sent, [handle]: [...recent, now] },
  }));

  return { ok: true, status: question.status, supportCard: moderation.supportCard };
}

function patchQuestion(id: string, patch: (q: Question) => Question) {
  writeDB((db) => ({ ...db, questions: db.questions.map((q) => (q.id === id ? patch(q) : q)) }));
}

export function answerQuestion(id: string, answer: Omit<Answer, "answeredAt">, now = Date.now()) {
  patchQuestion(id, (q) => ({
    ...q,
    status: "answered",
    answer: { ...answer, body: answer.body.trim().slice(0, MAX_ANSWER), answeredAt: q.answer?.answeredAt ?? now },
  }));
}

export function setAnswerPublic(id: string, isPublic: boolean) {
  patchQuestion(id, (q) => (q.answer ? { ...q, answer: { ...q.answer, isPublic } } : q));
}

/** Hosts can rescue a filtered question, or filter one by hand. */
export function moveQuestion(id: string, status: "new" | "filtered") {
  patchQuestion(id, (q) => ({ ...q, status, answer: status === "filtered" ? undefined : q.answer }));
}

export function deleteQuestion(id: string) {
  writeDB((db) => ({ ...db, questions: db.questions.filter((q) => q.id !== id) }));
}

/** PRD §8: filtered questions are kept for 30 days unless reported. */
export function purgeExpiredFiltered(now = Date.now()) {
  const db = readDB();
  const keep = db.questions.filter((q) => q.status !== "filtered" || now - q.createdAt < FILTERED_RETENTION_MS);
  if (keep.length !== db.questions.length) writeDB((current) => ({ ...current, questions: keep }));
}

export function deleteEverything() {
  clearDB();
}

export function publicAnswers(questions: Question[], handle: string) {
  return questions
    .filter((q) => q.handle === handle && q.status === "answered" && q.answer?.isPublic)
    .sort((a, b) => (b.answer?.answeredAt ?? 0) - (a.answer?.answeredAt ?? 0));
}
