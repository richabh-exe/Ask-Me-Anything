"use server";

import { createHash } from "node:crypto";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { getDb } from "@/lib/server/db";
import * as repo from "@/lib/server/repo";
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

export async function askQuestionAction(handle: string, body: string, askerName?: string): Promise<repo.AskResult> {
  return repo.askQuestion(getDb(), {
    handle: text(handle),
    body: text(body),
    askerName: text(askerName) || undefined,
    askerHash: await askerHash(),
  });
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
  return repo.answerQuestion(getDb(), userId, text(questionId), {
    body: text(answer.body),
    template: answer.template,
    isPublic: answer.isPublic === true,
  });
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
