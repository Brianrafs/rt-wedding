import { mkdir, mkdtemp, readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createClient } from "@libsql/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { getDb } from "@/lib/db";
import { lookupInvitation, submitRsvp } from "@/services/rsvp.service";

let db: ReturnType<typeof getDb>;
const openDeadline = "2026-12-01T00:00:00-03:00";
const beforeDeadline = new Date("2026-10-01T12:00:00Z");

beforeAll(async () => {
  const artifactRoot = resolve("test-results/rsvp");
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

describe("RSVP persistence", () => {
  it("looks up only one group, saves mixed individual answers, and preloads optional fields for edits", async () => {
    const invitation = await db.invitation.create({
      data: {
        name: "Família Integração",
        code: "M4Q8LA",
        guests: {
          create: [
            { name: "Ana" },
            { name: "Beto" },
            { name: "Criança", requiresRsvp: false },
          ],
        },
      },
      include: { guests: true },
    });
    const eligible = invitation.guests.filter((guest) => guest.requiresRsvp);

    const found = await lookupInvitation({ code: " m4q8la " }, db, openDeadline, beforeDeadline);
    expect(found.name).toBe("Família Integração");
    expect(found.guests).toHaveLength(3);
    expect(found.guests[0]).not.toHaveProperty("invitationId");

    const saved = await submitRsvp({
      code: "M4Q8LA",
      guests: [
        { guestId: eligible[0].id, status: "CONFIRMED", phone: "83999990000", dietaryRestriction: "Sem lactose", message: "Até lá!" },
        { guestId: eligible[1].id, status: "DECLINED", notes: "Estarei viajando" },
      ],
    }, db, openDeadline, () => beforeDeadline);

    expect(saved.guests.map((guest) => guest.status)).toEqual(["CONFIRMED", "DECLINED", "CONFIRMED"]);
    expect(saved.guests[0]).toMatchObject({ phone: "83999990000", dietaryRestriction: "Sem lactose", message: "Até lá!" });
    expect(saved.guests[1].notes).toBe("Estarei viajando");
    expect((await db.guest.findUniqueOrThrow({ where: { id: eligible[0].id } })).respondedAt).toEqual(beforeDeadline);
    expect((await db.guest.findFirstOrThrow({ where: { invitationId: invitation.id, requiresRsvp: false } })).respondedAt).toEqual(beforeDeadline);

    const declined = await submitRsvp({
      code: "M4Q8LA",
      guests: eligible.map((guest) => ({ guestId: guest.id, status: "DECLINED" as const })),
    }, db, openDeadline, () => beforeDeadline);
    expect(declined.guests.map((guest) => guest.status)).toEqual(["DECLINED", "DECLINED", "DECLINED"]);
  });

  it("rejects foreign, omitted, and non-eligible guests without partial writes", async () => {
    const first = await db.invitation.create({ data: { name: "Grupo A", code: "ABC234", guests: { create: [{ name: "A1" }, { name: "A2" }] } }, include: { guests: true } });
    const second = await db.invitation.create({ data: { name: "Grupo B", code: "DEF567", guests: { create: { name: "B1" } } }, include: { guests: true } });

    await expect(submitRsvp({
      code: first.code,
      guests: [
        { guestId: first.guests[0].id, status: "CONFIRMED" },
        { guestId: second.guests[0].id, status: "CONFIRMED" },
      ],
    }, db, openDeadline, () => beforeDeadline)).rejects.toMatchObject({ code: "CHANGED" });

    expect(await db.guest.count({ where: { invitationId: first.id, status: "PENDING" } })).toBe(2);
  });

  it("does not mutate at or after the server-authoritative deadline", async () => {
    const invitation = await db.invitation.create({ data: { name: "Grupo Prazo", code: "GHJ678", guests: { create: { name: "Pessoa" } } }, include: { guests: true } });
    await expect(submitRsvp({
      code: invitation.code,
      guests: [{ guestId: invitation.guests[0].id, status: "CONFIRMED" }],
    }, db, openDeadline, () => new Date("2026-12-01T03:00:00Z"))).rejects.toMatchObject({ code: "CLOSED" });
    expect((await db.guest.findUniqueOrThrow({ where: { id: invitation.guests[0].id } })).status).toBe("PENDING");
  });
});
