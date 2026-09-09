import type { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";
import { initialAdminSchema } from "../src/schemas/auth.schema";
import type { ServerEnv } from "../src/schemas/env.schema";

export function assertLocalSeed(env: ServerEnv) {
  if (env.NODE_ENV === "production" || (env.DATABASE_URL && !env.DATABASE_URL.startsWith("file:"))) {
    throw new Error("Development seed is restricted to local SQLite outside production.");
  }
}

export async function seedDevelopmentData(db: PrismaClient) {
  // Fixed fixture identity/code is development-only and keeps manual RSVP checks repeatable.
  await db.invitation.upsert({
    where: { id: "development-invitation" },
    update: {},
    create: {
      id: "development-invitation",
      name: "Família Teste",
      code: "7KPX4M",
      guests: {
        create: [{ name: "João Teste" }, { name: "Maria Teste" }],
      },
    },
  });
}

export async function seedInitialAdmin(
  db: PrismaClient,
  input: { username?: string; password?: string },
) {
  if (!input.username && !input.password) return false;
  const parsed = initialAdminSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid initial admin configuration.");
  const existing = await db.adminUser.findUnique({
    where: { username: parsed.data.username },
    select: { id: true },
  });
  if (existing) return false;
  await db.adminUser.create({
    data: {
      username: parsed.data.username,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });
  return true;
}
