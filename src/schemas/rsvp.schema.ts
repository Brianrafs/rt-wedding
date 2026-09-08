import { z } from "zod";

export const invitationCodeSchema = z.string().max(32).trim().toUpperCase()
  .regex(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6,8}$/);
export const lookupInvitationSchema = z.object({ code: invitationCodeSchema }).strict();

// Omitted values preserve private data; an explicitly empty value clears it.
const privateText = (max: number) => z.string().trim().max(max).transform((value) => value || null).optional();

export const submitRsvpSchema = z.object({
  code: invitationCodeSchema,
  guests: z.array(z.object({
    guestId: z.string().min(1).max(64),
    status: z.enum(["CONFIRMED", "DECLINED"]),
    phone: privateText(40),
    dietaryRestriction: privateText(500),
    notes: privateText(1000),
    message: privateText(2000),
  }).strict()).min(1).max(100).refine(
    (guests) => new Set(guests.map((guest) => guest.guestId)).size === guests.length,
    "Cada pessoa deve aparecer uma única vez.",
  ),
}).strict();
