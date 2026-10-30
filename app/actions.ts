"use server";

import { createHash } from "node:crypto";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { after } from "next/server";
import { isProfileIndexable } from "@/lib/seo";
import { captureAskerEvent } from "@/lib/server/analytics";
import { getDb } from "@/lib/server/db";
import { pingIndexNow } from "@/lib/server/indexnow";
import * as repo from "@/lib/server/repo";
import { askPath } from "@/lib/site";
import type { Answer, FilterLevel, LinkMode, Profile, QuestionStatus } from "@/lib/types";

/*
 * Server actions: the only way the browser changes data. Host actions read
 * the user ID from the Clerk session and pass it to the repository, which
 * scopes every query to that host.
 */

async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Sign in to continue.");
  return userId;
}

/** A salted, daily-rotating hash of the asker's network details. Never stored raw, never shown to hosts. */
async function askerHash(): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const agent = h.get("user-agent") ?? "";
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.ASKER_HASH_SALT ?? process.env.CLERK_SECRET_KEY ?? "";
  return createHash("sha256").update(`${salt}|${day}|${ip}|${agent}`).digest("hex");
}

/* ── public ──────────────────────────────────────────────────────────── */

// Actions are public HTTP endpoints, so arguments are checked before use.
const MODES: LinkMode[] = ["anonymous", "named", "choice"];
const LEVELS: FilterLevel[] = ["relaxed", "standard", "strict"];
const TEMPLATES: Answer["template"][] = ["notebook", "ink", "haldi", "margin", "chalk"];
const text = (value: unknown) => (typeof value === "string" ? value : "");

export type AskReply = Exclude<repo.AskResult, { ok: true }> | { ok: true; supportCard: boolean };

export async function askQuestionAction(handle: string, body: string, askerName?: string): Promise<AskReply> {
  const result = await repo.askQuestion(getDb(), {
    handle: text(handle),
    body: text(body),
    askerName: text(askerName) || undefined,
    askerHash: await askerHash(),
  });
  if (!result.ok) return result;

  const { mode, filteredFor, supportCard } = result;
  after(async () => {
    await captureAskerEvent({ event: "question_sent", mode });
    if (filteredFor) await captureAskerEvent({ event: "question_filtered", reason: filteredFor });
  });
  // Askers learn only that the question went through, never whether it was filtered.
  return { ok: true, supportCard };
}

export async function handleStatusAction(handle: string): Promise<repo.HandleStatus> {
  const { userId } = await auth();
  return repo.handleStatus(getDb(), text(handle), userId);
}

/* ── host ────────────────────────────────────────────────────────────── */

export async function createProfileAction(input: {
  handle: string;
  displayName: string;
  prompt: string;
  mode: LinkMode;
  filterLevel: FilterLevel;
}): Promise<repo.CreateProfileResult> {
  const userId = await requireUserId();
  if (!MODES.includes(input.mode) || !LEVELS.includes(input.filterLevel)) return { ok: false, reason: "invalid" };
  return repo.createProfile(getDb(), userId, {
    handle: text(input.handle),
    displayName: text(input.displayName),
    prompt: text(input.prompt),
    mode: input.mode,
    filterLevel: input.filterLevel,
  });
}

export async function updateProfileAction(patch: repo.ProfilePatch): Promise<Profile | null> {
  const userId = await requireUserId();
  const clean: repo.ProfilePatch = {};
  if (typeof patch.displayName === "string") clean.displayName = patch.displayName;
  if (typeof patch.prompt === "string") clean.prompt = patch.prompt;
  if (patch.mode && MODES.includes(patch.mode)) clean.mode = patch.mode;
  if (patch.filterLevel && LEVELS.includes(patch.filterLevel)) clean.filterLevel = patch.filterLevel;
  if (Array.isArray(patch.blockedWords)) clean.blockedWords = patch.blockedWords.filter((w) => typeof w === "string");
  if (typeof patch.paused === "boolean") clean.paused = patch.paused;
  return repo.updateProfile(getDb(), userId, clean);
}

export async function answerQuestionAction(questionId: string, answer: Omit<Answer, "answeredAt">): Promise<boolean> {
  const userId = await requireUserId();
  if (!TEMPLATES.includes(answer.template)) return false;
  const isPublic = answer.isPublic === true;
  const saved = await repo.answerQuestion(getDb(), userId, text(questionId), {
    body: text(answer.body),
    template: answer.template,
    isPublic,
  });
  if (saved && isPublic) after(() => announceProfile(userId));
  return saved;
}

/** Tells IndexNow a profile changed, once it passes the indexing gate. */
async function announceProfile(userId: string) {
  const db = getDb();
  const profile = await repo.getProfileById(db, userId);
  if (!profile) return;
  const substantiveAnswers = await repo.countSubstantiveAnswers(db, userId);
  if (isProfileIndexable({ createdAt: profile.createdAt, paused: profile.paused, substantiveAnswers })) {
    await pingIndexNow([askPath(profile.handle)]);
  }
}

export async function setAnswerPublicAction(questionId: string, isPublic: boolean) {
  await repo.setAnswerPublic(getDb(), await requireUserId(), questionId, isPublic);
}

export async function moveQuestionAction(questionId: string, status: Extract<QuestionStatus, "new" | "filtered">) {
  const userId = await requireUserId();
  if (status !== "new" && status !== "filtered") return;
  await repo.moveQuestion(getDb(), userId, text(questionId), status);
}

export async function deleteQuestionAction(questionId: string) {
  await repo.deleteQuestion(getDb(), await requireUserId(), questionId);
}

/** PRD US-7: removes the profile and everything it owns, then the Clerk account. */
export async function deleteAccountAction() {
  const userId = await requireUserId();
  await repo.deleteProfile(getDb(), userId);
  const clerk = await clerkClient();
  await clerk.users.deleteUser(userId);
}
