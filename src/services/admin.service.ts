import "server-only";
import type { Prisma, PrismaClient, RSVPStatus } from "@/generated/prisma/client";
import type { ZodSafeParseResult } from "zod";
import { generateUniqueInvitationCode } from "@/lib/invitation-code";
import {
  adminIdSchema,
  createGuestSchema,
  createInvitationSchema,
  invitationListQuerySchema,
  updateGuestSchema,
  updateInvitationSchema,
} from "@/schemas/admin.schema";
import type { DashboardStats } from "@/types/admin";

export class AdminValidationError extends Error {
  constructor(public readonly fieldErrors: Record<string, string[]>) {
    super("INVALID_ADMIN_INPUT");
  }
}

export class AdminRecordNotFoundError extends Error {
  constructor() {
    super("ADMIN_RECORD_NOT_FOUND");
  }
}

function parseOrThrow<T>(result: ZodSafeParseResult<T>) {
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const field = issue.path.length ? String(issue.path[0]) : "_form";
      (fieldErrors[field] ??= []).push(issue.message);
    }
    throw new AdminValidationError(fieldErrors);
  }
  return result.data;
}

function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export function calculateDashboardStats(guests: Array<{ requiresRsvp: boolean; status: RSVPStatus }>): DashboardStats {
  return guests.reduce<DashboardStats>((stats, guest) => {
    if (!guest.requiresRsvp) return stats;
    stats.totalEligible += 1;
    if (guest.status === "CONFIRMED") stats.confirmed += 1;
    else if (guest.status === "DECLINED") stats.declined += 1;
    else stats.pending += 1;
    return stats;
  }, { totalEligible: 0, confirmed: 0, declined: 0, pending: 0 });
}

export async function getDashboardStats(db: PrismaClient) {
  const guests = await db.guest.findMany({ select: { requiresRsvp: true, status: true } });
  return calculateDashboardStats(guests);
}

export async function listInvitations(input: unknown, db: PrismaClient) {
  const parsed = invitationListQuerySchema.safeParse(input);
  const filters = parsed.success ? parsed.data : { query: "", status: "ALL" as const };
  const where: Prisma.InvitationWhereInput = {
    AND: [
      filters.query ? {
        OR: [
          { name: { contains: filters.query } },
          { code: { contains: filters.query.toUpperCase() } },
          { guests: { some: { name: { contains: filters.query } } } },
        ],
      } : {},
      filters.status !== "ALL" ? {
        guests: { some: { requiresRsvp: true, status: filters.status } },
      } : {},
    ],
  };
  const invitations = await db.invitation.findMany({
    where,
    orderBy: [{ name: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      code: true,
      guests: { select: { requiresRsvp: true, status: true } },
    },
  });
  return invitations.map(({ guests, ...invitation }) => ({
    ...invitation,
    guestCount: guests.length,
    ...calculateDashboardStats(guests),
  }));
}

export async function getInvitation(id: unknown, db: PrismaClient) {
  const parsedId = adminIdSchema.safeParse(id);
  if (!parsedId.success) return null;
  return db.invitation.findUnique({
    where: { id: parsedId.data },
    select: {
      id: true,
      name: true,
      code: true,
      createdAt: true,
      guests: {
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: {
          id: true,
          name: true,
          requiresRsvp: true,
          status: true,
          phone: true,
          dietaryRestriction: true,
          notes: true,
          message: true,
          respondedAt: true,
        },
      },
    },
  });
}

export async function createInvitation(input: unknown, db: PrismaClient) {
  const data = parseOrThrow(createInvitationSchema.safeParse(input));
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = await generateUniqueInvitationCode(db);
    try {
      return await db.invitation.create({
        data: { name: data.name, code, guests: { create: data.guests } },
        select: { id: true, code: true },
      });
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;
    }
  }
  throw new Error("Could not create an invitation with a unique code.");
}

export async function updateInvitation(id: unknown, input: unknown, db: PrismaClient) {
  const parsedId = parseOrThrow(adminIdSchema.safeParse(id));
  const data = parseOrThrow(updateInvitationSchema.safeParse(input));
  const updated = await db.invitation.updateMany({ where: { id: parsedId }, data });
  if (updated.count !== 1) throw new AdminRecordNotFoundError();
}

export async function deleteInvitation(id: unknown, db: PrismaClient) {
  const parsedId = parseOrThrow(adminIdSchema.safeParse(id));
  const deleted = await db.invitation.deleteMany({ where: { id: parsedId } });
  if (deleted.count !== 1) throw new AdminRecordNotFoundError();
}

export async function createGuest(invitationId: unknown, input: unknown, db: PrismaClient) {
  const parsedInvitationId = parseOrThrow(adminIdSchema.safeParse(invitationId));
  const data = parseOrThrow(createGuestSchema.safeParse(input));
  const invitation = await db.invitation.findUnique({ where: { id: parsedInvitationId }, select: { id: true } });
  if (!invitation) throw new AdminRecordNotFoundError();
  return db.guest.create({ data: { ...data, invitationId: invitation.id }, select: { id: true } });
}

export async function updateGuest(id: unknown, input: unknown, db: PrismaClient) {
  const parsedId = parseOrThrow(adminIdSchema.safeParse(id));
  const data = parseOrThrow(updateGuestSchema.safeParse(input));
  const guest = await db.guest.findUnique({ where: { id: parsedId }, select: { invitationId: true } });
  if (!guest) throw new AdminRecordNotFoundError();
  await db.guest.update({ where: { id: parsedId }, data });
  return guest.invitationId;
}

export async function deleteGuest(id: unknown, db: PrismaClient) {
  const parsedId = parseOrThrow(adminIdSchema.safeParse(id));
  const guest = await db.guest.findUnique({ where: { id: parsedId }, select: { invitationId: true } });
  if (!guest) throw new AdminRecordNotFoundError();
  await db.guest.delete({ where: { id: parsedId } });
  return guest.invitationId;
}
