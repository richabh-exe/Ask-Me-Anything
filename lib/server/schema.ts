import { sql } from "drizzle-orm";
import { bigserial, boolean, check, index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { ModerationResult } from "../types";

/*
 * Poocho's Postgres schema (PRD §14). Hosts are Clerk users, so `profiles.id`
 * is the Clerk user ID. Every other table hangs off it with ON DELETE CASCADE,
 * so deleting an account removes everything it owns.
 */

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const profiles = pgTable(
  "profiles",
  {
    id: text("id").primaryKey(),
    handle: text("handle").notNull().unique(),
    displayName: text("display_name").notNull(),
    prompt: text("prompt").notNull(),
    mode: text("mode", { enum: ["anonymous", "named", "choice"] }).notNull().default("anonymous"),
    filterLevel: text("filter_level", { enum: ["relaxed", "standard", "strict"] }).notNull().default("standard"),
    blockedWords: text("blocked_words").array().notNull().default(sql`'{}'::text[]`),
    paused: boolean("paused").notNull().default(false),
    /** Only the fact that the 18+ check passed. The date of birth is never stored. */
    ageConfirmedAt: timestamp("age_confirmed_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    check("profiles_handle_format", sql`${t.handle} ~ '^[a-z0-9_]{3,20}$'`),
    check("profiles_display_name_length", sql`char_length(${t.displayName}) between 1 and 40`),
    check("profiles_prompt_length", sql`char_length(${t.prompt}) between 1 and 80`),
    check("profiles_mode_valid", sql`${t.mode} in ('anonymous', 'named', 'choice')`),
    check("profiles_filter_level_valid", sql`${t.filterLevel} in ('relaxed', 'standard', 'strict')`),
  ],
);

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    hostId: text("host_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    askerName: text("asker_name"),
    status: text("status", { enum: ["new", "answered", "filtered"] }).notNull(),
    moderation: jsonb("moderation").$type<ModerationResult>().notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index("questions_host_status_created_idx").on(t.hostId, t.status, t.createdAt.desc()),
    check("questions_body_length", sql`char_length(${t.body}) between 1 and 300`),
    check("questions_asker_name_length", sql`${t.askerName} is null or char_length(${t.askerName}) between 1 and 40`),
    check("questions_status_valid", sql`${t.status} in ('new', 'answered', 'filtered')`),
  ],
);

export const answers = pgTable(
  "answers",
  {
    questionId: uuid("question_id")
      .primaryKey()
      .references(() => questions.id, { onDelete: "cascade" }),
    hostId: text("host_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    template: text("template", { enum: ["notebook", "ink", "haldi", "margin", "chalk"] }).notNull(),
    isPublic: boolean("is_public").notNull().default(true),
    answeredAt: timestamp("answered_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("answers_host_public_idx").on(t.hostId, t.isPublic, t.answeredAt.desc()),
    check("answers_body_length", sql`char_length(${t.body}) between 1 and 500`),
    check("answers_template_valid", sql`${t.template} in ('notebook', 'ink', 'haldi', 'margin', 'chalk')`),
  ],
);

/*
 * Rate limiting without identifying anyone (PRD §8): a salted hash of the
 * asker's IP and browser, rotated daily. Hosts can never read this table, and
 * rows older than 30 days are deleted.
 */
export const askLog = pgTable(
  "ask_log",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    hostId: text("host_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    askerHash: text("asker_hash").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("ask_log_host_hash_created_idx").on(t.hostId, t.askerHash, t.createdAt)],
);
