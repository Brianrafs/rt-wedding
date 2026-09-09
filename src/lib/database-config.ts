import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ServerEnv } from "../schemas/env.schema";

// CLI and runtime both resolve relative SQLite paths from the project root.
export function localDatabaseUrl(url = "file:./prisma/dev.db") {
  if (!/^file:.+/.test(url)) {
    throw new Error("Local database configuration requires a SQLite file URL.");
  }
  const path = url.startsWith("file://") ? fileURLToPath(url) : resolve(url.slice(5));
  // Prisma's Windows schema engine expects file:C:/... rather than file:///C:/....
  return `file:${path.replaceAll("\\", "/")}`;
}

export function prismaCliDatasource(url = process.env.DATABASE_URL) {
  // Client generation does not require a datasource. When a hosting provider
  // supplies a remote DATABASE_URL, omit it so Prisma CLI cannot mistake it
  // for the local SQLite database used by migration commands.
  const configuredUrl = url?.trim();
  if (configuredUrl && !configuredUrl.startsWith("file:")) return undefined;
  return { url: localDatabaseUrl(configuredUrl || undefined) };
}

export function databaseConfig(env: ServerEnv) {
  if (env.NODE_ENV === "production") {
    // env has already passed parseEnv; never fall back to a local file here.
    return { url: env.TURSO_DATABASE_URL!, authToken: env.TURSO_AUTH_TOKEN! };
  }
  return { url: localDatabaseUrl(env.DATABASE_URL) };
}
