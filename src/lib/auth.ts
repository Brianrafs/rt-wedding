import "server-only";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { adminSessionCookie } from "@/lib/session-cookie";
import { getSessionSecret } from "@/lib/session-secret";
import { findAdminBySessionToken } from "@/services/auth.service";

export class UnauthorizedError extends Error {
  constructor() {
    super("UNAUTHORIZED");
  }
}

export async function getCurrentAdmin() {
  const token = (await cookies()).get(adminSessionCookie)?.value;
  if (!token) return null;
  return findAdminBySessionToken(getDb(), token, getSessionSecret());
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new UnauthorizedError();
  return admin;
}
