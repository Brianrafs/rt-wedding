import { mkdir, mkdtemp, readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createClient } from "@libsql/client";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { getDb } from "@/lib/db";
import { seedDevelopmentData } from "../../prisma/seed-data";

let db: ReturnType<typeof getDb>;

beforeAll(async () => {
  // Retain test artifacts: native SQLite handles can outlive close() on Windows.
  const artifactRoot = resolve("test-results/database");
  await mkdir(artifactRoot, { recursive: true });
  const temporaryDirectory = await mkdtemp(join(artifactRoot, "run-"));
  const url = pathToFileURL(join(temporaryDirectory, "test.db")).href;
  const migrationClient = createClient({ url });
  try {
    const root = resolve("prisma/migrations");
    const migrations = (await readdir(root, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
    expect(migrations.length).toBeGreaterThan(0);
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

it("reuses the development client", () => {
  expect(getDb()).toBe(db);
});

it("seeds two guests once and preserves existing data on rerun", async () => {
  await seedDevelopmentData(db);
  const invitation = await db.invitation.findUniqueOrThrow({ where: { id: "development-invitation" }, include: { guests: true } });
  expect(invitation.guests.map((guest) => guest.name).sort()).toEqual(["João Teste", "Maria Teste"]);
  expect(invitation.guests.every((guest) => guest.requiresRsvp && guest.status === "PENDING")).toBe(true);
  expect(invitation.guests.every((guest) => guest.respondedAt === null)).toBe(true);
  await db.guest.update({ where: { id: invitation.guests[0].id }, data: { notes: "Preserve fixture edits" } });
  await seedDevelopmentData(db);
  expect(await db.invitation.count()).toBe(1);
  expect(await db.guest.count()).toBe(2);
  expect((await db.guest.findUniqueOrThrow({ where: { id: invitation.guests[0].id } })).notes).toBe("Preserve fixture edits");
});

it("enforces invitation code uniqueness, ownership references, and guest cascades", async () => {
  const invitation = await db.invitation.create({ data: { name: "Constraint fixture", code: "M4Q8LA", guests: { create: { name: "Test child", requiresRsvp: false } } }, include: { guests: true } });
  await expect(db.invitation.create({ data: { name: "Duplicate", code: "M4Q8LA" } })).rejects.toMatchObject({ code: "P2002" });
  await expect(db.guest.create({ data: { name: "Orphan", invitationId: "missing" } })).rejects.toMatchObject({ code: "P2003" });
  await db.invitation.delete({ where: { id: invitation.id } });
  expect(await db.guest.count({ where: { invitationId: invitation.id } })).toBe(0);
});

it("persists the administrative schema and cascades sessions without implementing authentication", async () => {
  const admin = await db.adminUser.create({ data: { username: "schema-fixture", passwordHash: "non-login-test-hash", sessions: { create: { tokenHash: "non-login-test-token-hash", expiresAt: new Date("2026-12-10T00:00:00Z") } } }, include: { sessions: true } });
  expect(admin.sessions).toHaveLength(1);
  await db.adminUser.delete({ where: { id: admin.id } });
  expect(await db.adminSession.count({ where: { userId: admin.id } })).toBe(0);
});
