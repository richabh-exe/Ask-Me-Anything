import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { after, before, beforeEach, describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { IDEAS } from "../lib/ideas";
import { RATE_LIMIT, RATE_WINDOW_MS, RETENTION_MS } from "../lib/limits";
import * as repo from "../lib/server/repo";
import * as schema from "../lib/server/schema";

/*
 * Runs the real migrations in drizzle/ against an in-process Postgres
 * (PGlite), then exercises the repository the app uses.
 *
 * PRD US-6, the Real Questions guarantee: no code path inserts
 * system-generated items into an inbox.
 */

const client = new PGlite();
const db = drizzle({ client, schema }) as unknown as repo.Db;

const HOST = "user_host_a";
const OTHER = "user_host_b";
const base = { displayName: "Ananya", prompt: "Ask me anything!", mode: "anonymous" as const, filterLevel: "standard" as const };
const ask = (body: string, extra: Partial<repo.AskInput> = {}, now?: Date) =>
  repo.askQuestion(db, { handle: "ananya", body, askerHash: "hash-1", ...extra }, now);

before(async () => {
  await migrate(drizzle({ client }), { migrationsFolder: join(process.cwd(), "drizzle") });
});

after(async () => {
  await client.close();
});

beforeEach(async () => {
  await client.exec("truncate table profiles cascade");
  await repo.createProfile(db, HOST, { ...base, handle: "ananya" });
});

describe("the inbox only ever holds questions people typed", () => {
  it("starts empty when a link is created", async () => {
    assert.equal(await repo.countQuestions(db, HOST), 0);
  });

  it("is untouched by every host action, including choosing a prompt idea", async () => {
    for (const idea of IDEAS) await repo.updateProfile(db, HOST, { prompt: idea.en });
    await repo.updateProfile(db, HOST, { paused: true });
    await repo.updateProfile(db, HOST, { paused: false, filterLevel: "strict", blockedWords: ["ex"] });
    await repo.listInbox(db, HOST);
    assert.equal(await repo.countQuestions(db, HOST), 0);
  });

  it("stores exactly the text the asker sent, and nothing else", async () => {
    assert.deepEqual(await ask("  What's your go-to chai order?  "), { ok: true, supportCard: false });
    const [only, ...rest] = await repo.listInbox(db, HOST);
    assert.equal(rest.length, 0);
    assert.equal(only.body, "What's your go-to chai order?");
    assert.equal(only.status, "new");
  });

  it("refuses questions for links that don't exist, or are paused", async () => {
    assert.deepEqual(await ask("hi", { handle: "nobody_here" }), { ok: false, reason: "unclaimed" });
    await repo.updateProfile(db, HOST, { paused: true });
    assert.deepEqual(await ask("hi"), { ok: false, reason: "paused" });
    assert.equal(await repo.countQuestions(db, HOST), 0);
  });

  it("only inserts into the questions table from repo.askQuestion (source check)", () => {
    // Any new code that inserts questions must be reviewed against US-6.
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) walk(path);
        else if (/\.(ts|tsx)$/.test(name)) files.push(path);
      }
    };
    ["lib", "components", "app"].forEach((dir) => walk(join(process.cwd(), dir)));
    const inserts = files.filter((file) => /\.insert\(\s*questions\s*\)/.test(readFileSync(file, "utf8")));
    assert.deepEqual(
      inserts.map((f) => f.replace(process.cwd() + "/", "")),
      ["lib/server/repo.ts"],
    );
    const source = readFileSync(join(process.cwd(), "lib/server/repo.ts"), "utf8");
    assert.equal(source.match(/\.insert\(\s*questions\s*\)/g)?.length, 1);
  });
});

describe("filtering and rate limits happen on the server", () => {
  it("moves abusive questions to Filtered before the host sees them", async () => {
    await ask("you're so ugly lol");
    await ask("Call me on 98765 43210");
    const inbox = await repo.listInbox(db, HOST);
    assert.deepEqual(
      inbox.map((q) => q.status),
      ["filtered", "filtered"],
    );
  });

  it("applies the host's blocked words and strictness", async () => {
    await repo.updateProfile(db, HOST, { blockedWords: ["ex"], filterLevel: "strict" });
    await ask("what about your ex?");
    await ask("that reel was cringe");
    const statuses = (await repo.listInbox(db, HOST)).map((q) => q.status);
    assert.deepEqual(statuses, ["filtered", "filtered"]);
  });

  it("flags self-harm for the support card", async () => {
    assert.deepEqual(await ask("sometimes I want to die"), { ok: true, supportCard: true });
  });

  it("allows five questions per asker per host per hour", async () => {
    const now = new Date();
    for (let i = 0; i < RATE_LIMIT; i++) {
      assert.equal((await ask(`question ${i}`, {}, new Date(now.getTime() + i))).ok, true);
    }
    const blocked = await ask("one more", {}, new Date(now.getTime() + 10));
    assert.equal(blocked.ok, false);
    assert.equal(!blocked.ok && blocked.reason, "rate_limited");
    assert.equal((await ask("someone else", { askerHash: "hash-2" }, new Date(now.getTime() + 11))).ok, true);
    assert.equal((await ask("an hour later", {}, new Date(now.getTime() + RATE_WINDOW_MS + 10))).ok, true);
  });

  it("keeps names only when the link mode allows them", async () => {
    await ask("anon?", { askerName: "Rohan" });
    await repo.updateProfile(db, HOST, { mode: "named" });
    assert.deepEqual(await ask("named, but no name"), { ok: false, reason: "name_required" });
    await ask("named question", { askerName: "Rohan" });
    const [named, anon] = await repo.listInbox(db, HOST);
    assert.equal(named.askerName, "Rohan");
    assert.equal(anon.askerName, undefined);
  });
});

describe("hosts manage only their own questions", () => {
  it("answers, publishes, hides, moves and deletes", async () => {
    await ask("Hostel or PG?");
    const [q] = await repo.listInbox(db, HOST);
    assert.equal(await repo.answerQuestion(db, HOST, q.id, { body: "Hostel, first year.", template: "ink", isPublic: true }), true);

    let pub = await repo.publicAnswers(db, HOST, "ananya");
    assert.deepEqual(
      pub.map((p) => [p.body, p.answer?.body]),
      [["Hostel or PG?", "Hostel, first year."]],
    );

    await repo.setAnswerPublic(db, HOST, q.id, false);
    assert.equal((await repo.publicAnswers(db, HOST, "ananya")).length, 0);

    await repo.moveQuestion(db, HOST, q.id, "filtered");
    const [moved] = await repo.listInbox(db, HOST);
    assert.equal(moved.status, "filtered");
    assert.equal(moved.answer, undefined, "filtering removes the answer");

    await repo.deleteQuestion(db, HOST, q.id);
    assert.equal(await repo.countQuestions(db, HOST), 0);
    pub = await repo.publicAnswers(db, HOST, "ananya");
    assert.equal(pub.length, 0);
  });

  it("can't touch another host's questions", async () => {
    await repo.createProfile(db, OTHER, { ...base, handle: "rohan" });
    await ask("A question for Ananya");
    const [q] = await repo.listInbox(db, HOST);

    assert.equal(await repo.answerQuestion(db, OTHER, q.id, { body: "hijack", template: "ink", isPublic: true }), false);
    await repo.moveQuestion(db, OTHER, q.id, "filtered");
    await repo.deleteQuestion(db, OTHER, q.id);
    await repo.setAnswerPublic(db, OTHER, q.id, true);

    const [still] = await repo.listInbox(db, HOST);
    assert.equal(still.status, "new");
    assert.equal(still.answer, undefined);
    assert.equal((await repo.listInbox(db, OTHER)).length, 0);
  });

  it("deletes filtered questions after 30 days", async () => {
    const old = new Date(Date.now() - RETENTION_MS - 60_000);
    await ask("you're so ugly", {}, old);
    await ask("A kind question", { askerHash: "hash-2" }, old);
    const inbox = await repo.listInbox(db, HOST);
    assert.deepEqual(
      inbox.map((q) => q.body),
      ["A kind question"],
    );
  });

  it("removes everything when the account is deleted", async () => {
    await ask("Something to delete");
    await repo.deleteProfile(db, HOST);
    const rows = await client.query<{ n: number }>("select (select count(*) from questions) + (select count(*) from ask_log) as n");
    assert.equal(Number(rows.rows[0].n), 0);
  });
});

describe("links", () => {
  it("reports availability", async () => {
    assert.equal(await repo.handleStatus(db, "ananya", null), "taken");
    assert.equal(await repo.handleStatus(db, "ananya", HOST), "mine");
    assert.equal(await repo.handleStatus(db, "@Free_One", null), "free");
    assert.equal(await repo.handleStatus(db, "admin", null), "reserved");
    assert.equal(await repo.handleStatus(db, "a", null), "invalid");
  });

  it("gives each account one link and each link one owner", async () => {
    assert.deepEqual(await repo.createProfile(db, OTHER, { ...base, handle: "ananya" }), { ok: false, reason: "taken" });
    assert.deepEqual(await repo.createProfile(db, HOST, { ...base, handle: "second_link" }), { ok: false, reason: "exists" });
  });
});
