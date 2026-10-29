import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { after, before, beforeEach, describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { languagesFor, pageByPath, pagePath, PAGES } from "../lib/content";
import { INDEXING, isProfileIndexable } from "../lib/seo";
import * as repo from "../lib/server/repo";
import * as schema from "../lib/server/schema";

/*
 * The indexing gate (PRD §12.4), the sitemap and admin queries on real SQL,
 * and the guide content that search engines read.
 */

const client = new PGlite();
const db = drizzle({ client, schema }) as unknown as repo.Db;

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date("2026-11-20T10:00:00Z");
const LONG = "A long, honest answer that says something real about the question, with enough detail to be worth reading for anyone who finds it.";
const base = { displayName: "Ananya", prompt: "Ask me anything!", mode: "anonymous" as const, filterLevel: "standard" as const };

let asker = 0;
async function host(id: string, handle: string, createdDaysAgo: number) {
  await repo.createProfile(db, id, { ...base, handle }, new Date(NOW.getTime() - createdDaysAgo * DAY));
}
async function answered(id: string, handle: string, body: string, opts: { isPublic?: boolean; question?: string } = {}) {
  await repo.askQuestion(db, { handle, body: opts.question ?? `What's your favourite thing about ${handle}?`, askerHash: `asker-${asker++}` }, new Date(NOW.getTime() - DAY));
  const unanswered = (await repo.listInbox(db, id, NOW)).find((q) => q.status === "new");
  assert.ok(unanswered, "the question should have been delivered");
  await repo.answerQuestion(db, id, unanswered.id, { body, template: "ink", isPublic: opts.isPublic ?? true }, new Date(NOW.getTime() - DAY));
}

before(async () => {
  await migrate(drizzle({ client }), { migrationsFolder: join(process.cwd(), "drizzle") });
});

after(async () => {
  await client.close();
});

beforeEach(async () => {
  await client.exec("truncate table profiles cascade");
});

describe("the indexing gate", () => {
  it("needs three substantive answers, a week-old account and an open inbox", () => {
    const old = NOW.getTime() - 8 * DAY;
    assert.equal(isProfileIndexable({ createdAt: old, paused: false, substantiveAnswers: 3 }, NOW.getTime()), true);
    assert.equal(isProfileIndexable({ createdAt: old, paused: false, substantiveAnswers: 2 }, NOW.getTime()), false);
    assert.equal(isProfileIndexable({ createdAt: old, paused: true, substantiveAnswers: 9 }, NOW.getTime()), false);
    assert.equal(isProfileIndexable({ createdAt: NOW.getTime() - 3 * DAY, paused: false, substantiveAnswers: 9 }, NOW.getTime()), false);
  });

  it("counts only public, long answers to questions that passed moderation", async () => {
    await host("u1", "ananya", 10);
    await answered("u1", "ananya", LONG);
    await answered("u1", "ananya", LONG, { isPublic: false });
    await answered("u1", "ananya", "Short and sweet.");
    assert.ok(LONG.length >= INDEXING.minAnswerChars);
    assert.equal(await repo.countSubstantiveAnswers(db, "u1"), 1);
  });

  it("lists only profiles that pass, newest answer first, for the sitemap", async () => {
    await host("u1", "ready", 10);
    await host("u2", "too_new", 2);
    await host("u3", "too_short", 10);
    for (let i = 0; i < 3; i++) {
      await answered("u1", "ready", LONG);
      await answered("u2", "too_new", LONG);
      await answered("u3", "too_short", "Yes!");
    }
    const listed = await repo.indexableProfiles(db, NOW);
    assert.deepEqual(
      listed.map((p) => p.handle),
      ["ready"],
    );
    assert.ok(listed[0].lastModified instanceof Date);

    await repo.updateProfile(db, "u1", { paused: true });
    assert.deepEqual(await repo.indexableProfiles(db, NOW), []);
  });
});

describe("admin numbers", () => {
  it("counts hosts, answers, questions and the filtered share", async () => {
    await host("u1", "ananya", 10);
    await host("u2", "kabir", 0);
    await answered("u1", "ananya", LONG);
    await repo.askQuestion(db, { handle: "kabir", body: "you are an idiot", askerHash: "x" }, new Date(NOW.getTime() - DAY));

    const s = await repo.adminStats(db, NOW);
    assert.equal(s.totalHosts, 2);
    assert.equal(s.newToday, 1);
    assert.equal(s.newThisWeek, 1);
    assert.equal(s.weeklyAnswers, 1);
    assert.equal(s.weeklyActiveHosts, 1);
    assert.equal(s.questionsThisWeek, 2);
    assert.equal(s.filteredPct, 50);
  });
});

describe("guide content", () => {
  const paths = PAGES.map(pagePath);
  const routes = new Set(["/", "/hi", "/pledge", "/start", "/guides", ...paths]);

  it("has one page per path", () => {
    assert.equal(new Set(paths).size, paths.length);
  });

  it("keeps titles and descriptions inside what search results show", () => {
    for (const page of PAGES) {
      assert.ok(page.seoTitle.length <= 55, `${pagePath(page)} seoTitle is ${page.seoTitle.length} chars`);
      assert.ok(page.description.length >= 110 && page.description.length <= 170, `${pagePath(page)} description is ${page.description.length} chars`);
    }
  });

  it("only links to pages that exist", () => {
    for (const page of PAGES) {
      const text = JSON.stringify(page);
      for (const [, href] of text.matchAll(/\]\((\/[^)#\s]*)(?:#[^)]*)?\)/g)) {
        assert.ok(routes.has(href), `${pagePath(page)} links to missing ${href}`);
      }
      for (const related of page.related) assert.ok(pageByPath(related), `${pagePath(page)} relates to missing ${related}`);
    }
  });

  it("pairs every translation both ways, for hreflang", () => {
    for (const page of PAGES.filter((p) => p.translation)) {
      const other = pageByPath(page.translation!);
      assert.ok(other, `${pagePath(page)} translation ${page.translation} is missing`);
      assert.equal(other.translation, pagePath(page));
      assert.notEqual(other.locale, page.locale);
      assert.deepEqual(languagesFor(page), languagesFor(other));
    }
  });

  it("offers 100 prompt ideas that fit a profile prompt", () => {
    const ideas = PAGES.find((p) => p.section === "ideas")!;
    const prompts = ideas.body.flatMap((b) => (b.kind === "chits" ? b.items : []));
    assert.equal(prompts.length, 100);
    assert.equal(new Set(prompts).size, 100);
    for (const prompt of prompts) assert.ok(prompt.length <= 80, `"${prompt}" is longer than a prompt allows`);
  });

  it("has a prerendered share image for every Hindi page", () => {
    for (const page of PAGES.filter((p) => p.locale === "hi")) {
      assert.ok(existsSync(join(process.cwd(), "public/og/hi", `${page.section}-${page.slug}.png`)), `missing share image for ${pagePath(page)}`);
    }
  });
});

describe("IndexNow", () => {
  it("serves the key file the pings point at", () => {
    const key = /INDEXNOW_KEY = "([0-9a-f]{32})"/.exec(readFileSync(join(process.cwd(), "lib/server/indexnow.ts"), "utf8"))?.[1];
    assert.ok(key);
    assert.ok(readdirSync(join(process.cwd(), "public")).includes(`${key}.txt`));
    assert.equal(readFileSync(join(process.cwd(), "public", `${key}.txt`), "utf8").trim(), key);
  });
});
