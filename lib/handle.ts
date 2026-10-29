import { moderate } from "./moderation";

export const HANDLE_PATTERN = /^[a-z0-9_]{3,20}$/;

/** Route names, brand terms and roles nobody should be able to impersonate. */
const RESERVED = new Set([
  "admin", "administrator", "api", "app", "demo", "help", "inbox", "login", "logout",
  "moderator", "mod", "official", "pledge", "poocho", "privacy", "root", "settings",
  "signup", "start", "support", "staff", "team", "terms", "trust", "safety", "you",
  "grievance", "legal", "security", "system", "null", "undefined",
]);

export type HandleCheck =
  | { ok: true; handle: string }
  | { ok: false; reason: "invalid" | "reserved"; handle: string };

export function cleanHandle(input: string): string {
  return input.trim().replace(/^@+/, "").toLowerCase().replace(/[\s.-]+/g, "_").replace(/[^a-z0-9_]/g, "");
}

export function checkHandle(input: string): HandleCheck {
  const handle = cleanHandle(input);
  if (!HANDLE_PATTERN.test(handle)) return { ok: false, reason: "invalid", handle };
  if (RESERVED.has(handle)) return { ok: false, reason: "reserved", handle };
  // Offensive handles are blocked with the same filter used on questions.
  if (moderate(handle.replace(/_/g, " "), { level: "strict" }).flagged) {
    return { ok: false, reason: "reserved", handle };
  }
  return { ok: true, handle };
}
