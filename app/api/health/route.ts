import { sql } from "drizzle-orm";
import { connection } from "next/server";
import { getDb } from "@/lib/server/db";

/*
 * For the uptime monitor (playbook: Monitoring, "Uptime"). Answers 200 when
 * the app can reach Postgres and 503 when it can't, so an outage pages someone
 * before creators notice.
 */
export async function GET() {
  await connection();
  const started = Date.now();
  try {
    await Promise.race([getDb().execute(sql`select 1`), new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000))]);
    return Response.json({ ok: true, db: "up", ms: Date.now() - started }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ ok: false, db: "down", ms: Date.now() - started }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
