import "server-only";
import { randomUUID } from "node:crypto";

/*
 * Events captured on the server (asker events here, error reports in
 * lib/server/errors.ts), so they carry no browser ID, cookie or person: every
 * event gets a fresh random distinct_id and person processing is off. Only the
 * facts named in the playbook go out (link mode, filter reason), never the
 * question text or the host. Turn on "Discard client IP data" in the PostHog
 * project so the server's IP isn't kept either.
 */

type AskerEvent = { event: "question_sent"; mode: string } | { event: "question_filtered"; reason: string };

export async function sendServerEvent(event: string, properties: Record<string, unknown>): Promise<void> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
  try {
    await fetch(`${host}/i/v0/e/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        event,
        distinct_id: randomUUID(),
        properties: { ...properties, $process_person_profile: false, $lib: "poocho-server" },
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    /* Analytics never gets in the way of a request. */
  }
}

export async function captureAskerEvent({ event, ...properties }: AskerEvent): Promise<void> {
  await sendServerEvent(event, properties);
}
