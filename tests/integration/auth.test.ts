import { mkdir, mkdtemp, readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createClient } from "@libsql/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import {
  authenticateAdmin,
  createAdminSession,
  ensureInitialAdmin,
  findAdminBySessionToken,
  hashSessionToken,
  revokeAdminSession,
} from "@/services/auth.service";
import { seedInitialAdmin } from "../../prisma/seed-data";

let db: ReturnType<typeof getDb>;
const sessionSecret = "integration-session-secret-value";

beforeAll(async () => {
  const artifactRoot = resolve("test-results/auth");
  await mkdir(artifactRoot, { recursive: true });
  const temporaryDirectory = await mkdtemp(join(artifactRoot, "run-"));
  const url = pathToFileURL(join(temporaryDirectory, "test.db")).href;
  const migrationClient = createClient({ url });
  try {
    const root = resolve("prisma/migrations");
    const migrations = (await readdir(root, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
    for (const migration of migrations) {
      await migrationClient.executeMultiple(await readFile(join(root, migration, "migration.sql"), "utf8"));
    }
  } finally {
    migrationClient.close();
  }
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("DATABASE_URL", url);
  db = getDb();
});

afterAll(async () => {
  await db?.$disconnect();
  vi.unstubAllEnvs();
});

describe("admin authentication", () => {
  it("bootstraps a hashed admin once and authenticates with generic failures", async () => {
    await expect(ensureInitialAdmin(db, {})).resolves.toBe(false);
    await expect(ensureInitialAdmin(db, { username: "admin" })).rejects.toThrow("Invalid initial admin configuration");
    await expect(seedInitialAdmin(db, { username: "admin", password: "test-password-123" })).resolves.toBe(true);
    await expect(seedInitialAdmin(db, { username: "admin", password: "different-password" })).resolves.toBe(false);
    const stored = await db.adminUser.findUniqueOrThrow({ where: { username: "admin" } });
    expect(stored.passwordHash).not.toBe("test-password-123");
    await expect(verifyPassword("test-password-123", stored.passwordHash)).resolves.toBe(true);
    await expect(authenticateAdmin({ username: " admin ", password: "test-password-123" }, db)).resolves.toEqual({ id: stored.id, username: "admin" });
    await expect(authenticateAdmin({ username: "admin", password: "wrong" }, db)).rejects.toThrow("INVALID_CREDENTIALS");
    await expect(authenticateAdmin({ username: "missing", password: "wrong" }, db)).rejects.toThrow("INVALID_CREDENTIALS");
    await expect(authenticateAdmin({ username: "", password: "" }, db)).rejects.toThrow("INVALID_CREDENTIALS");
  });

  it("stores only a token hash, validates expiry, and revokes server-side", async () => {
    const admin = await db.adminUser.findUniqueOrThrow({ where: { username: "admin" } });
    const issuedAt = new Date("2026-09-08T12:00:00Z");
    const session = await createAdminSession(db, admin.id, sessionSecret, issuedAt);
    const stored = await db.adminSession.findUniqueOrThrow({ where: { tokenHash: hashSessionToken(session.token, sessionSecret) } });
    expect(stored.tokenHash).not.toBe(session.token);
    expect(session.token.length).toBeGreaterThanOrEqual(43);
    await expect(findAdminBySessionToken(db, session.token, sessionSecret, new Date("2026-09-15T11:59:59Z"))).resolves.toMatchObject({ id: admin.id });
    await expect(findAdminBySessionToken(db, session.token, "another-session-secret-value", issuedAt)).resolves.toBeNull();
    await expect(findAdminBySessionToken(db, session.token, sessionSecret, session.expiresAt)).resolves.toBeNull();
    await expect(db.adminSession.findUnique({ where: { id: stored.id } })).resolves.toBeNull();

    const active = await createAdminSession(db, admin.id, sessionSecret, issuedAt);
    await revokeAdminSession(db, active.token, sessionSecret);
    await expect(findAdminBySessionToken(db, active.token, sessionSecret, issuedAt)).resolves.toBeNull();
  });
});
