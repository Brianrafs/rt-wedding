import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import type { PrismaClient } from "@/generated/prisma/client";
import { adminSessionLifetimeSeconds } from "@/lib/session-cookie";
import { hashPassword, verifyPassword } from "@/lib/password";
import { initialAdminSchema, loginSchema } from "@/schemas/auth.schema";

export class AuthenticationError extends Error {
  constructor() {
    super("INVALID_CREDENTIALS");
  }
}

const dummyPasswordHash = `scrypt-v1$${Buffer.alloc(16).toString("base64url")}$${Buffer.alloc(64).toString("base64url")}`;

export function hashSessionToken(token: string, secret: string) {
  return createHmac("sha256", secret).update(token).digest("hex");
}

export async function ensureInitialAdmin(
  db: PrismaClient,
  input: { username?: string; password?: string },
) {
  if (!input.username && !input.password) return false;
  const parsed = initialAdminSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid initial admin configuration.");

  if (await db.adminUser.findFirst({ select: { id: true } })) return false;

  const passwordHash = await hashPassword(parsed.data.password);
  try {
    await db.adminUser.create({
      data: { username: parsed.data.username, passwordHash },
    });
    return true;
  } catch (error) {
    // Concurrent first-login requests may race. If the configured user now
    // exists, bootstrap succeeded in the other request; otherwise preserve
    // the infrastructure error for the caller.
    const existing = await db.adminUser.findUnique({
      where: { username: parsed.data.username },
      select: { id: true },
    });
    if (existing) return false;
    throw error;
  }
}

export async function authenticateAdmin(input: unknown, db: PrismaClient) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) throw new AuthenticationError();
  const admin = await db.adminUser.findUnique({
    where: { username: parsed.data.username },
    select: { id: true, username: true, passwordHash: true },
  });
  const passwordMatches = await verifyPassword(parsed.data.password, admin?.passwordHash ?? dummyPasswordHash);
  if (!admin || !passwordMatches) {
    throw new AuthenticationError();
  }
  return { id: admin.id, username: admin.username };
}

export async function createAdminSession(db: PrismaClient, userId: string, secret: string, now = new Date()) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(now.getTime() + adminSessionLifetimeSeconds * 1000);
  await db.adminSession.create({ data: { userId, tokenHash: hashSessionToken(token, secret), expiresAt } });
  return { token, expiresAt };
}

export async function findAdminBySessionToken(db: PrismaClient, token: string, secret: string, now = new Date()) {
  if (!token || token.length > 256) return null;
  const session = await db.adminSession.findUnique({
    where: { tokenHash: hashSessionToken(token, secret) },
    select: { id: true, expiresAt: true, user: { select: { id: true, username: true } } },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() <= now.getTime()) {
    await db.adminSession.deleteMany({ where: { id: session.id } });
    return null;
  }
  return session.user;
}

export async function revokeAdminSession(db: PrismaClient, token: string, secret: string) {
  if (!token || token.length > 256) return;
  await db.adminSession.deleteMany({ where: { tokenHash: hashSessionToken(token, secret) } });
}
