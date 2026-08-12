import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

type SqlClient = ReturnType<typeof postgres>;

const globalDatabase = globalThis as typeof globalThis & {
  hoabSql?: SqlClient;
};

function databaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) {
    throw new Error("DATABASE_URL is not configured. Add the Supabase PostgreSQL connection string to the environment.");
  }
  return value;
}

export function getSql(): SqlClient {
  if (!globalDatabase.hoabSql) {
    globalDatabase.hoabSql = postgres(databaseUrl(), {
      max: process.env.NODE_ENV === "production" ? 1 : 5,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return globalDatabase.hoabSql;
}

export function getDb() {
  return drizzle(getSql(), { schema });
}

export async function closeDatabase() {
  if (!globalDatabase.hoabSql) return;
  await globalDatabase.hoabSql.end({ timeout: 5 });
  globalDatabase.hoabSql = undefined;
}
