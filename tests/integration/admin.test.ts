import { mkdir, mkdtemp, readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createClient } from "@libsql/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import {
  AdminValidationError,
  createGuest,
  createInvitation,
  deleteGuest,
  deleteInvitation,
  getDashboardStats,
  getInvitation,
  listInvitations,
  updateGuest,
  updateInvitation,
} from "@/services/admin.service";

let db: PrismaClient;

beforeAll(async () => {
  const artifactRoot = resolve("test-results/admin");
  await mkdir(artifactRoot, { recursive: true });
  const temporaryDirectory = await mkdtemp(join(artifactRoot, "run-"));
  const url = pathToFileURL(join(temporaryDirectory, "test.db")).href;
  const migrationClient = createClient({ url });
  try {
    const root = resolve("prisma/migrations");
    const migrations = (await readdir(root, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
    for (const migration of migrations) await migrationClient.executeMultiple(await readFile(join(root, migration, "migration.sql"), "utf8"));
  } finally {
    migrationClient.close();
  }
  db = new PrismaClient({ adapter: new PrismaLibSql({ url }) });
});

afterAll(async () => {
  await db?.$disconnect();
});

const emptyMetadata = { phone: "", dietaryRestriction: "", notes: "", message: "" };

describe("admin invitation management", () => {
  it("creates the invitation and initial guests atomically with a public code", async () => {
    const invitation = await createInvitation({
      name: "Família Silva",
      guests: [
        { name: "João Silva", requiresRsvp: true, ...emptyMetadata },
        { name: "Bia Silva", requiresRsvp: false, ...emptyMetadata },
      ],
    }, db);
    expect(invitation.code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/);
    await expect(getInvitation(invitation.id, db)).resolves.toMatchObject({
      name: "Família Silva",
      guests: [{ name: "João Silva", status: "PENDING" }, { name: "Bia Silva", requiresRsvp: false }],
    });

    const countBefore = await db.invitation.count();
    await expect(createInvitation({ name: "Inválido", guests: [] }, db)).rejects.toBeInstanceOf(AdminValidationError);
    await expect(db.invitation.count()).resolves.toBe(countBefore);
  });

  it("searches invitations and filters them by eligible guest status", async () => {
    const invitation = await db.invitation.findFirstOrThrow({ where: { name: "Família Silva" }, include: { guests: true } });
    await db.guest.update({ where: { id: invitation.guests[0].id }, data: { status: "CONFIRMED", respondedAt: new Date() } });
    expect(await listInvitations({ query: "João", status: "ALL" }, db)).toHaveLength(1);
    expect(await listInvitations({ query: invitation.code.toLowerCase(), status: "CONFIRMED" }, db)).toHaveLength(1);
    expect(await listInvitations({ query: "", status: "DECLINED" }, db)).toHaveLength(0);
    await expect(getDashboardStats(db)).resolves.toEqual({ totalEligible: 1, confirmed: 1, declined: 0, pending: 0 });
  });

  it("edits without changing the code and supports guest CRUD", async () => {
    const invitation = await db.invitation.findFirstOrThrow({ where: { name: "Família Silva" } });
    await updateInvitation(invitation.id, { name: "Família Silva e Souza" }, db);
    const edited = await getInvitation(invitation.id, db);
    expect(edited).toMatchObject({ name: "Família Silva e Souza", code: invitation.code });

    const guest = await createGuest(invitation.id, { name: "Ana Souza", requiresRsvp: true, ...emptyMetadata }, db);
    await expect(updateGuest(guest.id, { name: "Ana Maria Souza", requiresRsvp: true, phone: "85999999999", dietaryRestriction: "", notes: "", message: "" }, db)).resolves.toBe(invitation.id);
    await expect(db.guest.findUnique({ where: { id: guest.id } })).resolves.toMatchObject({ name: "Ana Maria Souza", phone: "85999999999" });
    await expect(deleteGuest(guest.id, db)).resolves.toBe(invitation.id);
    await expect(db.guest.findUnique({ where: { id: guest.id } })).resolves.toBeNull();
  });

  it("deletes an invitation and cascades its guests", async () => {
    const invitation = await db.invitation.findFirstOrThrow({ where: { name: "Família Silva e Souza" }, include: { guests: true } });
    await deleteInvitation(invitation.id, db);
    await expect(db.invitation.findUnique({ where: { id: invitation.id } })).resolves.toBeNull();
    await expect(db.guest.count({ where: { invitationId: invitation.id } })).resolves.toBe(0);
  });
});
