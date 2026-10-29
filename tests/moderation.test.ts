import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkHandle } from "../lib/handle";
import { moderate } from "../lib/moderation";

describe("moderate", () => {
  it("lets kind and curious questions through at every level", () => {
    for (const text of [
      "What's a song you've had on repeat all week?",
      "Chai or coffee? Defend your answer.",
      "आपकी पसंदीदा किताब कौन-सी है?",
      "Any tips for fat loss that actually worked for you?",
      "Top 5 movies of all time?",
      "mera kutta bahut cute hai, aapka pet kaun sa hai?",
    ]) {
      for (const level of ["relaxed", "standard", "strict"] as const) {
        assert.equal(moderate(text, { level }).flagged, false, `${level}: ${text}`);
      }
    }
  });

  it("filters directed insults at standard strictness", () => {
    assert.equal(moderate("you're so ugly lol").flagged, true);
    assert.equal(moderate("Everyone hates you").flagged, true);
    assert.equal(moderate("ur so f4t").flagged, true, "leetspeak");
    assert.equal(moderate("you are uglyyyyy").flagged, true, "stretched letters");
  });

  it("catches Hinglish and Devanagari abuse", () => {
    assert.equal(moderate("tu chutiya hai").flagged, true);
    assert.equal(moderate("कमीना कहीं का").flagged, true);
  });

  it("treats mild teasing differently by level", () => {
    assert.equal(moderate("that reel was cringe", { level: "standard" }).flagged, false);
    assert.equal(moderate("that reel was cringe", { level: "strict" }).flagged, true);
  });

  it("always filters threats and personal details, even when relaxed", () => {
    assert.equal(moderate("I know where you live", { level: "relaxed" }).flagged, true);
    assert.equal(moderate("call me on 98765 43210", { level: "relaxed" }).flagged, true);
    assert.equal(moderate("mail me at someone@example.com", { level: "relaxed" }).flagged, true);
  });

  it("raises the support card for self-harm", () => {
    const result = moderate("sometimes I want to die");
    assert.equal(result.flagged, true);
    assert.equal(result.supportCard, true);
  });

  it("applies the host's blocked words", () => {
    assert.equal(moderate("what about your ex?", { blockedWords: ["ex"] }).flagged, true);
    assert.equal(moderate("what about your exams?", { blockedWords: ["ex"] }).flagged, false);
  });
});

describe("checkHandle", () => {
  it("accepts simple handles and cleans input", () => {
    assert.deepEqual(checkHandle("@Ananya.Verma"), { ok: true, handle: "ananya_verma" });
  });
  it("rejects reserved and offensive handles", () => {
    assert.equal(checkHandle("admin").ok, false);
    assert.equal(checkHandle("chutiya").ok, false);
    assert.equal(checkHandle("ab").ok, false);
  });
});
