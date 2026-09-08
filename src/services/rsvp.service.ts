import "server-only";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { assertRsvpOpen, RsvpError } from "@/lib/rsvp-deadline";
import { lookupInvitationSchema, submitRsvpSchema } from "@/schemas/rsvp.schema";
import type { PublicInvitation } from "@/types/rsvp";

const publicInvitationSelect = {
  name: true,
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
    },
  },
} satisfies Prisma.InvitationSelect;

export async function lookupInvitation(
  input: unknown, db: PrismaClient, deadline: string | undefined, now = new Date(),
): Promise<PublicInvitation> {
  assertRsvpOpen(deadline, now);
  const parsed = lookupInvitationSchema.safeParse(input);
  if (!parsed.success) throw new RsvpError("INVALID_CODE");
  const invitation = await db.invitation.findUnique({
    where: { code: parsed.data.code }, select: publicInvitationSelect,
  });
  if (!invitation) throw new RsvpError("INVALID_CODE");
  return invitation;
}

export async function submitRsvp(
  input: unknown, db: PrismaClient, deadline: string | undefined, now: () => Date = () => new Date(),
): Promise<PublicInvitation> {
  assertRsvpOpen(deadline, now());
  const parsed = submitRsvpSchema.safeParse(input);
  if (!parsed.success) throw new RsvpError("INVALID_INPUT");
  const { code, guests } = parsed.data;

  return db.$transaction(async (tx) => {
    const invitation = await tx.invitation.findUnique({
      where: { code },
      select: { id: true, guests: { select: { id: true, requiresRsvp: true } } },
    });
    if (!invitation) throw new RsvpError("INVALID_CODE");
    const eligible = new Set(invitation.guests.filter((guest) => guest.requiresRsvp).map((guest) => guest.id));
    // Require a complete current group: reject foreign IDs, children, omitted
    // people, and invitations changed after lookup before writing anything.
    if (eligible.size !== guests.length || guests.some((guest) => !eligible.has(guest.guestId))) {
      throw new RsvpError("CHANGED");
    }
    const respondedAt = now();
    assertRsvpOpen(deadline, respondedAt);
    for (const guest of guests) {
      const { guestId, ...response } = guest;
      const updated = await tx.guest.updateMany({
        where: { id: guestId, invitationId: invitation.id, requiresRsvp: true },
        data: { ...response, respondedAt },
      });
      if (updated.count !== 1) throw new RsvpError("CHANGED");
    }
    // A request that waited or crossed the deadline rolls back the whole group.
    assertRsvpOpen(deadline, now());
    return tx.invitation.findUniqueOrThrow({ where: { code }, select: publicInvitationSelect });
  });
}
