import "server-only";
import { parseEnv } from "@neon/env";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import neonConfig from "@/neon";
import * as schema from "./schema";

/*
 * Neon recommends node-postgres on Vercel: with Fluid compute one function
 * instance serves many requests, so a small pool is reused across them, and
 * attachDatabasePool closes idle clients before the instance is suspended.
 * DATABASE_URL is Neon's pooled (-pooler) connection string.
 */

let db: NodePgDatabase<typeof schema> | undefined;

/*
 * pg 8 already verifies the certificate for Neon's sslmode=require and warns
 * that pg 9 will stop doing so. Naming verify-full keeps today's behaviour
 * and silences the warning. URLs without sslmode (local Postgres) are untouched.
 */
function verifiedSsl(connectionString: string): string {
  const url = new URL(connectionString);
  const mode = url.searchParams.get("sslmode");
  if (mode === "prefer" || mode === "require" || mode === "verify-ca") url.searchParams.set("sslmode", "verify-full");
  return url.toString();
}

export function getDb(): NodePgDatabase<typeof schema> {
  if (db) return db;
  const { postgres } = parseEnv(neonConfig, ["DATABASE_URL"]);
  const pool = new Pool({
    connectionString: verifiedSsl(postgres.databaseUrl),
    max: 5,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 10_000,
  });
  attachDatabasePool(pool);
  db = drizzle({ client: pool, schema });
  return db;
}
