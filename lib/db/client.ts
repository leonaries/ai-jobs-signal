import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

let client: postgres.Sql | null = null;

export function hasDatabaseConfig() {
  return Boolean(databaseUrl);
}

export function getSql() {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!client) {
    client = postgres(databaseUrl, {
      ssl: "require",
      max: 5,
      idle_timeout: 20,
      connect_timeout: 15,
      prepare: false
    });
  }

  return client;
}

export type SqlClient = postgres.Sql;
