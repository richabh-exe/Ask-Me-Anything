import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, it } from "node:test";
import {
  answerQuestion,
  askQuestion,
  createProfile,
  deleteQuestion,
  moveQuestion,
  purgeExpiredFiltered,
  RATE_LIMIT,
  setAnswerPublic,
  updateProfile,
} from "../lib/poocho";
import { IDEAS } from "../lib/ideas";
import { memoryStorage, readDB, setStorage } from "../lib/store";

/*
 * PRD US-6, the Real Questions guarantee: no code path inserts
 * system-generated items into the inbox.
 */

const profile = { handle: "ananya", displayName: "Ananya", prompt: "Ask me anything!", mode: "anonymous" as const, filterLevel: "standard" as const };

beforeEach(() => setStorage(memoryStorage()));

describe("the inbox only ever holds questions people typed", () => {
  it("starts empty when a link is created", () => {
    createProfile(profile);
    assert.equal(readDB().questions.length, 0);
  });

  it("is untouched by every host action, including choosing a prompt idea", () => {
    createProfile(profile);
    for (const idea of IDEAS) updateProfile({ prompt: idea.en });
    updateProfile({ paused: true });
    updateProfile({ paused: false, filterLevel: "strict", blockedWords: ["ex"] });
    purgeExpiredFiltered();
    assert.equal(readDB().questions.length, 0);
  });

  it("stores exactly the text the asker sent, and nothing else", () => {
    createProfile(profile);
    const result = askQuestion("ananya", "  What's your go-to chai order?  ");
    assert.equal(result.ok, true);
    const [only, ...rest] = readDB().questions;
    assert.equal(rest.length, 0);
    assert.equal(only.body, "What's your go-to chai order?");

    answerQuestion(only.id, { body: "Adrak, extra strong.", template: "ink", isPublic: true });
    setAnswerPublic(only.id, false);
    moveQuestion(only.id, "new");
    assert.equal(readDB().questions.length, 1);
    deleteQuestion(only.id);
    assert.equal(readDB().questions.length, 0);
  });

  it("refuses questions for links that aren't on this device, or are paused", () => {
    createProfile(profile);
    assert.deepEqual(askQuestion("someone_else", "hi"), { ok: false, reason: "unclaimed" });
    updateProfile({ paused: true });
    assert.deepEqual(askQuestion("ananya", "hi"), { ok: false, reason: "paused" });
    assert.equal(readDB().questions.length, 0);
  });

  it("rate-limits one device to five questions per host per hour", () => {
    createProfile(profile);
    const now = Date.now();
    for (let i = 0; i < RATE_LIMIT; i++) assert.equal(askQuestion("ananya", `question ${i}`, {}, now + i).ok, true);
    const blocked = askQuestion("ananya", "one more", {}, now + 10);
    assert.equal(blocked.ok, false);
    assert.equal(askQuestion("ananya", "an hour later", {}, now + 60 * 60 * 1000 + 10).ok, true);
  });

  it("only writes to the question list from askQuestion (source check)", () => {
    // Any new function that pushes into `questions` must be reviewed against US-6.
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) walk(path);
        else if (/\.(ts|tsx)$/.test(name)) files.push(path);
      }
    };
    ["lib", "components", "app"].forEach((dir) => walk(join(process.cwd(), dir)));
    const inserts = files.filter((file) => /questions:\s*\[\s*question\b/.test(readFileSync(file, "utf8")));
    assert.deepEqual(inserts.map((f) => f.replace(process.cwd() + "/", "")), ["lib/poocho.ts"]);
  });
});
