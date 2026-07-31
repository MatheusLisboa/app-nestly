import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getServerEnv } from "@/config/env";
import * as schema from "./schema";

/**
 * Server-only Drizzle client.
 * Prefer using the authenticated Supabase client for user-scoped reads when RLS matters.
 * Use this for migrations, seeds, and trusted server jobs with service role / direct URL.
 */
const globalForDb = globalThis as unknown as {
  postgresClient: ReturnType<typeof postgres> | undefined;
};

export function getDb() {
  const { DATABASE_URL } = getServerEnv();

  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const client =
    globalForDb.postgresClient ??
    postgres(DATABASE_URL, {
      prepare: false,
      max: 10,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.postgresClient = client;
  }

  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof getDb>;
