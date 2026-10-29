import { and, count, desc, eq, gt, inArray, lt } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { checkHandle } from "../handle";
import { MAX_ANSWER, MAX_QUESTION, RATE_LIMIT, RATE_WINDOW_MS, RETENTION_MS } from "../limits";
import { moderate } from "../moderation";
import type { Answer, FilterLevel, LinkMode, Profile, PublicProfile, Question, QuestionStatus } from "../types";
import * as schema from "./schema";
import { answers, askLog, profiles, questions } from "./schema";

/*
 * Every database read and write in Poocho lives here. Functions take the
 * database as an argument, so the app passes its Neon pool and the tests pass
 * an in-process Postgres. Anything a host owns is always filtered by hostId,
 * which comes from the signed-in Clerk session, never from the client.
 *
 * The Real Questions guarantee (PRD US-6): askQuestion is the only function
 * that inserts into `questions`, and it stores only text a person sent.
 * tests/real-questions.test.ts enforces this.
 */

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;


type ProfileRow = typeof profiles.$inferSelect;

function toProfile(row: ProfileRow): Profile {
  return {
    handle: row.handle,
    displayName: row.displayName,
    prompt: row.prompt,
    mode: row.mode,
    filterLevel: row.filterLevel,
    blockedWords: row.blockedWords,
    paused: row.paused,
    createdAt: row.createdAt.getTime(),
    ageConfirmedAt: row.ageConfirmedAt.getTime(),
  };
}

export function toPublicProfile(profile: Profile): PublicProfile {
  const { handle, displayName, prompt, mode, paused } = profile;
  return { handle, displayName, prompt, mode, paused };
}

/* ── profiles ───────────────────────────────────────────────────────── */

export async function getProfileById(db: Db, id: string): Promise<Profile | null> {
  const [row] = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
  return row ? toProfile(row) : null;
}

export async function getProfileByHandle(db: Db, handle: string): Promise<{ id: string; profile: Profile } | null> {
  const [row] = await db.select().from(profiles).where(eq(profiles.handle, handle)).limit(1);
  return row ? { id: row.id, profile: toProfile(row) } : null;
}

export type HandleStatus = "free" | "taken" | "mine" | "invalid" | "reserved";

export async function handleStatus(db: Db, input: string, viewerId: string | null): Promise<HandleStatus> {
  const check = checkHandle(input);
  if (!check.ok) return check.reason;
  const [row] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.handle, check.handle)).limit(1);
  if (!row) return "free";
  return row.id === viewerId ? "mine" : "taken";
}

export interface NewProfile {
  handle: string;
  displayName: string;
  prompt: string;
  mode: LinkMode;
  filterLevel: FilterLevel;
}

export type CreateProfileResult =
  | { ok: true; profile: Profile }
  | { ok: false; reason: "invalid" | "reserved" | "taken" | "exists" };

function isUniqueViolation(error: unknown): boolean {
  const code = (error as { code?: string; cause?: { code?: string } })?.code ?? (error as { cause?: { code?: string } })?.cause?.code;
  return code === "23505";
}

export async function createProfile(db: Db, id: string, input: NewProfile, now = new Date()): Promise<CreateProfileResult> {
  const check = checkHandle(input.handle);
  if (!check.ok) return { ok: false, reason: check.reason };
  if (await getProfileById(db, id)) return { ok: false, reason: "exists" };
  try {
    // A new link starts with an empty inbox. Nothing is ever pre-filled.
    const [row] = await db
      .insert(profiles)
      .values({
        id,
        handle: check.handle,
        displayName: input.displayName.trim().slice(0, 40) || check.handle,
        prompt: input.prompt.trim().slice(0, 80) || "Ask me anything!",
        mode: input.mode,
        filterLevel: input.filterLevel,
        ageConfirmedAt: now,
      })
      .returning();
    return { ok: true, profile: toProfile(row) };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, reason: "taken" };
    throw error;
  }
}

export type ProfilePatch = Partial<Pick<Profile, "displayName" | "prompt" | "mode" | "filterLevel" | "blockedWords" | "paused">>;

export async function updateProfile(db: Db, id: string, patch: ProfilePatch): Promise<Profile | null> {
  const values: Partial<typeof profiles.$inferInsert> = {};
  if (patch.displayName !== undefined) values.displayName = patch.displayName.trim().slice(0, 40);
  if (patch.prompt !== undefined) values.prompt = patch.prompt.trim().slice(0, 80);
  if (patch.mode !== undefined) values.mode = patch.mode;
  if (patch.filterLevel !== undefined) values.filterLevel = patch.filterLevel;
  if (patch.blockedWords !== undefined) values.blockedWords = patch.blockedWords.slice(0, 200).map((w) => w.slice(0, 40));
  if (patch.paused !== undefined) values.paused = patch.paused;
  if (values.displayName === "" || values.prompt === "") return getProfileById(db, id);
  if (Object.keys(values).length === 0) return getProfileById(db, id);
  const [row] = await db.update(profiles).set(values).where(eq(profiles.id, id)).returning();
  return row ? toProfile(row) : null;
}

/** Deletes the profile; questions, answers and the ask log cascade. */
export async function deleteProfile(db: Db, id: string) {
  await db.delete(profiles).where(eq(profiles.id, id));
}

/* ── asking ─────────────────────────────────────────────────────────── */

export type AskResult =
  | { ok: true; supportCard: boolean }
  | { ok: false; reason: "unclaimed" | "paused" | "empty" | "too_long" | "name_required" }
  | { ok: false; reason: "rate_limited"; retryInMs: number };

export interface AskInput {
  handle: string;
  body: string;
  askerName?: string;
  /** Salted hash of the asker's network details, used only for rate limiting. */
  askerHash: string;
}

export async function askQuestion(db: Db, input: AskInput, now = new Date()): Promise<AskResult> {
  const text = input.body.trim();
  if (!text) return { ok: false, reason: "empty" };
  if (text.length > MAX_QUESTION) return { ok: false, reason: "too_long" };

  const host = await getProfileByHandle(db, input.handle);
  if (!host) return { ok: false, reason: "unclaimed" };
  const { id: hostId, profile } = host;
  if (profile.paused) return { ok: false, reason: "paused" };

  const askerName = input.askerName?.trim().slice(0, 40) || undefined;
  if (profile.mode === "named" && !askerName) return { ok: false, reason: "name_required" };

  const windowStart = new Date(now.getTime() - RATE_WINDOW_MS);
  const recent = await db
    .select({ createdAt: askLog.createdAt })
    .from(askLog)
    .where(and(eq(askLog.hostId, hostId), eq(askLog.askerHash, input.askerHash), gt(askLog.createdAt, windowStart)))
    .orderBy(askLog.createdAt)
    .limit(RATE_LIMIT);
  if (recent.length >= RATE_LIMIT) {
    return { ok: false, reason: "rate_limited", retryInMs: RATE_WINDOW_MS - (now.getTime() - recent[0].createdAt.getTime()) };
  }

  // Moderated before delivery (PRD US-3): flagged questions go straight to Filtered.
  const moderation = moderate(text, { level: profile.filterLevel, blockedWords: profile.blockedWords });

  await db.transaction(async (tx) => {
    await tx.insert(questions).values({
      hostId,
      body: text,
      askerName: profile.mode !== "anonymous" ? askerName : undefined,
      status: moderation.flagged ? "filtered" : "new",
      moderation,
      createdAt: now,
    });
    await tx.insert(askLog).values({ hostId, askerHash: input.askerHash, createdAt: now });
    await tx.delete(askLog).where(and(eq(askLog.hostId, hostId), lt(askLog.createdAt, new Date(now.getTime() - RETENTION_MS))));
  });

  return { ok: true, supportCard: moderation.supportCard };
}

/* ── the host's inbox ───────────────────────────────────────────────── */

function toQuestion(
  handle: string,
  row: typeof questions.$inferSelect,
  answer: typeof answers.$inferSelect | null,
): Question {
  return {
    id: row.id,
    handle,
    body: row.body,
    createdAt: row.createdAt.getTime(),
    status: row.status,
    moderation: row.moderation,
    ...(row.askerName ? { askerName: row.askerName } : {}),
    ...(answer
      ? {
          answer: {
            body: answer.body,
            template: answer.template,
            isPublic: answer.isPublic,
            answeredAt: answer.answeredAt.getTime(),
          },
        }
      : {}),
  };
}

export async function listInbox(db: Db, hostId: string, now = new Date()): Promise<Question[]> {
  // PRD §8: filtered questions are kept for 30 days unless reported.
  await db
    .delete(questions)
    .where(and(eq(questions.hostId, hostId), eq(questions.status, "filtered"), lt(questions.createdAt, new Date(now.getTime() - RETENTION_MS))));

  const [owner] = await db.select({ handle: profiles.handle }).from(profiles).where(eq(profiles.id, hostId)).limit(1);
  if (!owner) return [];
  const rows = await db
    .select()
    .from(questions)
    .leftJoin(answers, eq(answers.questionId, questions.id))
    .where(eq(questions.hostId, hostId))
    .orderBy(desc(questions.createdAt))
    .limit(500);
  return rows.map((r) => toQuestion(owner.handle, r.questions, r.answers));
}

export async function publicAnswers(db: Db, hostId: string, handle: string, limit = 50): Promise<Question[]> {
  const rows = await db
    .select()
    .from(answers)
    .innerJoin(questions, eq(questions.id, answers.questionId))
    .where(and(eq(answers.hostId, hostId), eq(answers.isPublic, true), eq(questions.status, "answered")))
    .orderBy(desc(answers.answeredAt))
    .limit(limit);
  return rows.map((r) => toQuestion(handle, r.questions, r.answers));
}

export async function answerQuestion(
  db: Db,
  hostId: string,
  questionId: string,
  answer: Omit<Answer, "answeredAt">,
  now = new Date(),
): Promise<boolean> {
  const body = answer.body.trim().slice(0, MAX_ANSWER);
  if (!body) return false;
  return db.transaction(async (tx) => {
    const updated = await tx
      .update(questions)
      .set({ status: "answered" })
      .where(and(eq(questions.id, questionId), eq(questions.hostId, hostId), inArray(questions.status, ["new", "answered"])))
      .returning({ id: questions.id });
    if (updated.length === 0) return false;
    await tx
      .insert(answers)
      .values({ questionId, hostId, body, template: answer.template, isPublic: answer.isPublic, answeredAt: now })
      .onConflictDoUpdate({
        target: answers.questionId,
        // Keep the original answeredAt so editing doesn't reorder the public page.
        set: { body, template: answer.template, isPublic: answer.isPublic },
      });
    return true;
  });
}

export async function setAnswerPublic(db: Db, hostId: string, questionId: string, isPublic: boolean) {
  await db
    .update(answers)
    .set({ isPublic })
    .where(and(eq(answers.questionId, questionId), eq(answers.hostId, hostId)));
}

/** Hosts can rescue a filtered question, or filter one by hand. Filtering removes any answer. */
export async function moveQuestion(db: Db, hostId: string, questionId: string, status: Extract<QuestionStatus, "new" | "filtered">) {
  await db.transaction(async (tx) => {
    const moved = await tx
      .update(questions)
      .set({ status })
      .where(and(eq(questions.id, questionId), eq(questions.hostId, hostId)))
      .returning({ id: questions.id });
    if (moved.length && status === "filtered") {
      await tx.delete(answers).where(and(eq(answers.questionId, questionId), eq(answers.hostId, hostId)));
    }
  });
}

export async function deleteQuestion(db: Db, hostId: string, questionId: string) {
  await db.delete(questions).where(and(eq(questions.id, questionId), eq(questions.hostId, hostId)));
}

export async function countQuestions(db: Db, hostId: string): Promise<number> {
  const [row] = await db.select({ n: count() }).from(questions).where(eq(questions.hostId, hostId));
  return Number(row?.n ?? 0);
}

