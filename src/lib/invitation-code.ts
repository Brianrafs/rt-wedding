import "server-only";
import { randomInt } from "node:crypto";
import type { PrismaClient } from "@/generated/prisma/client";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInvitationCode() {
  return Array.from({ length: 8 }, () => alphabet[randomInt(alphabet.length)]).join("");
}

export async function generateUniqueInvitationCode(db: PrismaClient) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateInvitationCode();
    if (!await db.invitation.findUnique({ where: { code }, select: { id: true } })) return code;
  }
  throw new Error("Could not allocate an invitation code.");
}

// The DB unique constraint is still authoritative. Future invitation creation
// must retry a P2002 collision: this function checks, but does not reserve codes.
