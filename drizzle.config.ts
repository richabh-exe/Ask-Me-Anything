import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// `neon env pull` writes .env.local (or .env when it exists). Earlier files win.
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/server/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    // Migrations need a direct connection: PgBouncer's transaction pooling drops session state.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
