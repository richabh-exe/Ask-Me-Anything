import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ErrorTracking } from "@posthog/core";
import { scrubExceptionEvent, scrubExceptionList, scrubMessage, stripQuery } from "../lib/error-scrub";

// Stand-ins for a question someone typed. None of them may survive a scrub.
const QUESTION = "kya tum mujhse shaadi karoge";
const HINDI = "आपकी पसंदीदा किताब कौन-सी है";

// The two builders PostHog uses: the browser one (posthog-js) and the Node one (lib/server/errors.ts).
const coercers = () => [
  new ErrorTracking.ErrorCoercer(),
  new ErrorTracking.ObjectCoercer(),
  new ErrorTracking.StringCoercer(),
  new ErrorTracking.PrimitiveCoercer(),
];
const browser = new ErrorTracking.ErrorPropertiesBuilder(coercers(), ErrorTracking.createDefaultStackParser());
const server = new ErrorTracking.ErrorPropertiesBuilder(
  coercers(),
  ErrorTracking.createStackParser("node:javascript", ErrorTracking.nodeStackLineParser),
);

function thrown(fn: () => unknown): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error("expected a throw");
}

function assertClean(payload: unknown) {
  const json = JSON.stringify(payload);
  for (const secret of [QUESTION, HINDI, "shaadi", "किताब"]) assert.ok(!json.includes(secret), `"${secret}" leaked: ${json}`);
}

describe("scrubMessage", () => {
  it("cuts the input snippet out of JSON.parse errors", () => {
    const error = thrown(() => JSON.parse(QUESTION)) as Error;
    assert.ok(error.message.includes("kya"), "the raw message really does quote the input");
    const message = scrubMessage(error.message);
    assertClean(message);
    assert.match(message, /is not valid JSON|JSON/);
  });

  it("keeps only the first line, where a failed query's parameters can't follow", () => {
    const message = scrubMessage(`Failed query: insert into "questions" ("body") values ($1)\nparams: ${QUESTION}`);
    assert.equal(message, "Failed query: insert into [redacted] ([redacted]) values ($1)");
  });

  it("drops URL queries, which is where React's minified errors put text", () => {
    const message = scrubMessage(
      `Minified React error #418; visit https://react.dev/errors/418?args[]=${encodeURIComponent(QUESTION)}&args[]= for the full message`,
    );
    assert.equal(message, "Minified React error #418; visit https://react.dev/errors/418 for the full message");
  });

  it("redacts quoted strings but leaves apostrophes inside words", () => {
    assert.equal(scrubMessage("Cannot read properties of undefined (reading 'body')"), "Cannot read properties of undefined (reading [redacted])");
    assert.equal(scrubMessage("The inbox didn't load (error 500)."), "The inbox didn't load (error 500).");
    assert.equal(scrubMessage(`JSON Parse error: Unexpected identifier "${QUESTION}`), "JSON Parse error: Unexpected identifier [redacted]");
    assert.equal(scrubMessage(`Unexpected token ‘${QUESTION}’`), "Unexpected token [redacted]");
  });

  it("redacts Hindi and other non-ASCII text, and email addresses", () => {
    assert.equal(scrubMessage(`Bad input ${HINDI}`), "Bad input [redacted]");
    assert.equal(scrubMessage("No account for asha@example.com"), "No account for [redacted]");
  });

  it("caps long messages", () => {
    assert.ok(scrubMessage("x".repeat(1000)).length <= 203);
  });
});

describe("scrubExceptionList", () => {
  it("rebuilds browser exceptions from safe fields only", () => {
    const error = thrown(() => JSON.parse(QUESTION));
    const { $exception_list } = browser.buildFromUnknown(error, { mechanism: { handled: false } });
    // Fields the builder may add on other platforms: none of them may pass.
    const frames = $exception_list[0].stacktrace?.frames ?? [];
    frames.push({ platform: "web:javascript", filename: `https://poocho.app/@demo?q=${QUESTION}`, context_line: QUESTION, vars: { body: QUESTION } });
    const scrubbed = scrubExceptionList($exception_list);
    assertClean(scrubbed);
    assert.equal(scrubbed[0].type, "SyntaxError");
    assert.equal(scrubbed[0].mechanism?.handled, false);
    const last = scrubbed[0].stacktrace?.frames.at(-1);
    assert.equal(last?.filename, "https://poocho.app/@demo");
    assert.deepEqual(Object.keys(last ?? {}).filter((key) => last?.[key as keyof typeof last] !== undefined), ["platform", "filename"]);
  });

  it("scrubs every link of a server error's cause chain", () => {
    const query = new Error(`Failed query: insert into "questions" ("body") values ($1)\nparams: ${QUESTION}`);
    query.cause = new Error(`invalid input syntax for type uuid: "${QUESTION}"`);
    const scrubbed = scrubExceptionList(server.buildFromUnknown(query, { mechanism: { handled: false } }).$exception_list);
    assertClean(scrubbed);
    assert.equal(scrubbed.length, 2);
    assert.equal(scrubbed[1].value, "invalid input syntax for type uuid: [redacted]");
    assert.ok(scrubbed[0].stacktrace?.frames.some((frame) => frame.filename?.endsWith("error-scrub.test.ts")));
  });

  it("drops the whole message when the thrown value wasn't an Error", () => {
    for (const value of [QUESTION, `TypeError: ${QUESTION}`, { body: QUESTION }, 42]) {
      const scrubbed = scrubExceptionList(browser.buildFromUnknown(value).$exception_list);
      assertClean(scrubbed);
      assert.match(scrubbed[0].value, /details removed/);
      assert.equal(scrubbed[0].type, value === `TypeError: ${QUESTION}` ? "TypeError" : "Error");
    }
  });

  it("keeps browser noise recognisable so it can be muted", () => {
    const [scrubbed] = scrubExceptionList([{ type: "Error", value: "Script error.", mechanism: { synthetic: true } }]);
    assert.equal(scrubbed.value, "Script error.");
  });

  it("refuses exception types that aren't identifiers", () => {
    const [scrubbed] = scrubExceptionList([{ type: QUESTION, value: "x" }]);
    assert.equal(scrubbed.type, "Error");
  });
});

describe("scrubExceptionEvent", () => {
  it("strips URL queries and drops breadcrumbs and free-text exception properties", () => {
    const properties = scrubExceptionEvent({
      $exception_list: [{ type: "Error", value: `oops "${QUESTION}"` }],
      $exception_level: "error",
      $exception_steps: [{ $message: QUESTION }],
      $exception_fingerprint: QUESTION,
      $issue_name: QUESTION,
      $current_url: `https://poocho.app/@demo?q=${QUESTION}#${QUESTION}`,
      $referrer: `https://www.google.com/search?q=${QUESTION}`,
      $session_entry_url: `https://poocho.app/start?prompt=${QUESTION}`,
      $pathname: "/@demo",
      $browser: "Chrome",
    });
    assertClean(properties);
    assert.deepEqual(properties, {
      $exception_list: [{ type: "Error", value: "oops [redacted]" }],
      $exception_level: "error",
      $current_url: "https://poocho.app/@demo",
      $referrer: "https://www.google.com/search",
      $session_entry_url: "https://poocho.app/start",
      $pathname: "/@demo",
      $browser: "Chrome",
    });
  });

  it("keeps stripQuery to the address alone", () => {
    assert.equal(stripQuery("/chai/e/?ip=0#x"), "/chai/e/");
  });
});
