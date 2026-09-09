import { describe, expect, it } from "vitest";
import { databaseConfig, localDatabaseUrl } from "@/lib/database-config";
import { parseEnv } from "@/schemas/env.schema";
import { assertLocalSeed } from "../../prisma/seed-data";

describe("server environment", () => {
  it("supports local development without production credentials", () => {
    const env = parseEnv({ DATABASE_URL: "", TURSO_DATABASE_URL: "", SESSION_SECRET: "" });
    expect(env.NODE_ENV).toBe("development");
    expect(databaseConfig(env)).toEqual({ url: localDatabaseUrl() });
    expect(localDatabaseUrl()).toMatch(/^file:.*\/prisma\/dev\.db$/);
  });

  it("requires remote credentials in production and never falls back to SQLite", () => {
    expect(() => parseEnv({ NODE_ENV: "production", DATABASE_URL: "file:./dev.db" })).toThrow("TURSO_DATABASE_URL");
    for (const url of ["file:./dev.db", "http://example.com", "not-a-url"]) {
      expect(() => parseEnv({ NODE_ENV: "production", TURSO_DATABASE_URL: url, TURSO_AUTH_TOKEN: "test-token" })).toThrow();
    }
    expect(() => parseEnv({ NODE_ENV: "production", TURSO_DATABASE_URL: "libsql://example.turso.io", TURSO_AUTH_TOKEN: "test-token" })).toThrow("SESSION_SECRET");
    const env = parseEnv({ NODE_ENV: "production", TURSO_DATABASE_URL: "libsql://example.turso.io", TURSO_AUTH_TOKEN: "test-token", SESSION_SECRET: "a".repeat(32) });
    expect(databaseConfig(env)).toEqual({ url: "libsql://example.turso.io", authToken: "test-token" });
    expect(() => assertLocalSeed(env)).toThrow("restricted to local SQLite");
  });

  it("rejects remote development databases", () => {
    expect(() => parseEnv({ DATABASE_URL: "libsql://example.turso.io" })).toThrow("DATABASE_URL");
    expect(() => localDatabaseUrl("libsql://example.turso.io")).toThrow();
  });

  it("validates supplied future settings without leaking secret values", () => {
    const secret = "sensitive-value";
    expect(() => parseEnv({ SESSION_SECRET: secret })).toThrow("SESSION_SECRET");
    expect(() => parseEnv({ SESSION_SECRET: secret })).not.toThrow(secret);
    expect(() => parseEnv({ WEDDING_DATE: "2026-12-10" })).toThrow("WEDDING_DATE");
    expect(() => parseEnv({ RSVP_DEADLINE: "2026-12-01T00:00:00" })).toThrow("RSVP_DEADLINE");
    expect(() => parseEnv({ NEXT_PUBLIC_SITE_URL: "javascript:alert(1)" })).toThrow();
    expect(parseEnv({ WEDDING_DATE: "2026-12-10T00:00:00-03:00" }).WEDDING_DATE).toBe("2026-12-10T00:00:00-03:00");
  });
});
