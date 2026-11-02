/*
 * Error reports for PostHog, scrubbed before they leave (pledge: no question
 * or answer text in analytics, ever). The browser runs every $exception event
 * through scrubExceptionEvent (lib/analytics.ts) and the server builds its own
 * through scrubExceptionList (lib/server/errors.ts).
 *
 * The message is the risk. JSON.parse quotes the text it choked on, a failed
 * database query lists its parameters on the second line, React's minified
 * errors carry text in their URL, and a thrown string is all text. So:
 * - a message keeps only its first line, with quoted strings, URL queries,
 *   email addresses and anything outside ASCII (Hindi included) cut out;
 * - a value that wasn't an Error (a thrown string, a rejected object) loses
 *   its message entirely;
 * - stack frames keep file, function, line and column, nothing else, and
 *   every URL loses its query string and fragment;
 * - breadcrumbs and any other free-text $exception_ property are dropped.
 */

export interface ScrubbedFrame {
  platform?: string;
  filename?: string;
  abs_path?: string;
  function?: string;
  module?: string;
  lineno?: number;
  colno?: number;
  in_app?: boolean;
  chunk_id?: string;
}

export interface ScrubbedException {
  type: string;
  value: string;
  mechanism?: {
    type?: string;
    source?: string;
    handled?: boolean;
    synthetic?: boolean;
    exception_id?: number;
    parent_id?: number;
  };
  stacktrace?: { type: "raw"; frames: ScrubbedFrame[] };
}

const REDACTED = "[redacted]";
const MAX_MESSAGE = 200;
const MAX_FRAMES = 100;
const LEVELS = ["fatal", "error", "warning", "log", "info", "debug"];

// Browser messages worth keeping even when no Error came with them, so they can be told apart and muted.
const BROWSER_NOISE = /^(?:Script error\.?|ResizeObserver loop .{0,80})$/;
const QUOTED = /"[^"]*"|“[^”]*”|‘[^’]*’|«[^»]*»|`[^`]*`/g;
// An apostrophe inside a word ("didn't") isn't a quote; one after a space or bracket is.
const SINGLE_QUOTED = /(^|[^A-Za-z0-9])'[^']*'(?![A-Za-z0-9])/g;
const UNCLOSED_QUOTE = /(^|[^A-Za-z0-9])'.*$|["“‘«`].*$/;
const URL_TAIL = /((?:[a-z][\w+.-]*:\/\/|\/)[^\s?#]*)[?#]\S*/gi;
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const NON_ASCII = /[^\x20-\x7e]+/g;
const REDACTED_RUN = /\[redacted\](?:[\s-]+\[redacted\])+/g;
const IDENTIFIER = /^[A-Za-z_$][\w$.]{0,79}$/;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const str = (value: unknown, max = MAX_MESSAGE) => (typeof value === "string" ? value.slice(0, max) : undefined);
const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : undefined);
const bool = (value: unknown) => (typeof value === "boolean" ? value : undefined);
const identifier = (value: unknown) => (typeof value === "string" && IDENTIFIER.test(value) ? value : undefined);

/** A URL or path without its query string and fragment, where user text could ride along. */
export function stripQuery(url: string): string {
  return url.split(/[?#]/, 1)[0];
}

/** The first line of an exception message, with anything that could be someone's text cut out. */
export function scrubMessage(message: unknown): string {
  if (typeof message !== "string") return "";
  let text = message.split(/[\r\n\u2028\u2029]/, 1)[0];
  text = text.replace(URL_TAIL, "$1").replace(EMAIL, REDACTED);
  text = text.replace(QUOTED, REDACTED).replace(SINGLE_QUOTED, `$1${REDACTED}`).replace(UNCLOSED_QUOTE, `$1${REDACTED}`);
  // One marker per run, so the shape of a sentence (its word count) doesn't show either.
  text = text.replace(NON_ASCII, REDACTED).replace(REDACTED_RUN, REDACTED).trim();
  return text.length > MAX_MESSAGE ? `${text.slice(0, MAX_MESSAGE)}...` : text;
}

function scrubFrame(frame: Record<string, unknown>): ScrubbedFrame {
  const filename = str(frame.filename, 500);
  const absPath = str(frame.abs_path, 500);
  return {
    platform: str(frame.platform, 40),
    filename: filename && stripQuery(filename),
    abs_path: absPath && stripQuery(absPath),
    function: str(frame.function),
    module: str(frame.module),
    lineno: num(frame.lineno),
    colno: num(frame.colno),
    in_app: bool(frame.in_app),
    chunk_id: str(frame.chunk_id, 100),
  };
}

function scrubException(exception: Record<string, unknown>): ScrubbedException {
  const mechanism = isRecord(exception.mechanism) ? exception.mechanism : undefined;
  // Synthetic means the thrown value wasn't an Error, so its "message" is the value itself.
  const synthetic = mechanism?.synthetic === true;
  const message = scrubMessage(exception.value);
  const type = identifier(exception.type);
  const scrubbed: ScrubbedException = {
    type: type && (!synthetic || /^(?:Error|[A-Z]\w*(?:Error|Exception|Rejection|Event))$/.test(type)) ? type : "Error",
    value: !synthetic || BROWSER_NOISE.test(message) ? message : "A value that isn't an Error was thrown (details removed)",
  };
  if (mechanism) {
    scrubbed.mechanism = {
      type: identifier(mechanism.type),
      source: identifier(mechanism.source),
      handled: bool(mechanism.handled),
      synthetic: bool(mechanism.synthetic),
      exception_id: num(mechanism.exception_id),
      parent_id: num(mechanism.parent_id),
    };
  }
  const frames = isRecord(exception.stacktrace) ? exception.stacktrace.frames : undefined;
  if (Array.isArray(frames)) {
    scrubbed.stacktrace = { type: "raw", frames: frames.filter(isRecord).slice(-MAX_FRAMES).map(scrubFrame) };
  }
  return scrubbed;
}

/** Rebuilds an $exception_list from known-safe fields only. */
export function scrubExceptionList(list: unknown): ScrubbedException[] {
  return Array.isArray(list) ? list.filter(isRecord).map(scrubException) : [];
}

/** The properties of a browser $exception event, ready to send. */
export function scrubExceptionEvent(properties: Record<string, unknown>): Record<string, unknown> {
  const scrubbed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (key === "$exception_list") scrubbed[key] = scrubExceptionList(value);
    else if (key === "$exception_level") scrubbed[key] = typeof value === "string" && LEVELS.includes(value) ? value : "error";
    // Breadcrumbs ($exception_steps), custom fingerprints and issue names are free text.
    else if (key.startsWith("$exception_") || key.startsWith("$issue_")) continue;
    else if (typeof value === "string" && /(?:url|referrer)$/i.test(key)) scrubbed[key] = stripQuery(value);
    else scrubbed[key] = value;
  }
  return scrubbed;
}
