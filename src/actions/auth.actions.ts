"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { adminSessionCookie } from "@/lib/session-cookie";
import { getSessionSecret } from "@/lib/session-secret";
import { getServerEnv } from "@/lib/env";
import {
  authenticateAdmin,
  AuthenticationError,
  createAdminSession,
  ensureInitialAdmin,
  revokeAdminSession,
} from "@/services/auth.service";

export type LoginState = { error?: string };

const invalidCredentials = "Usuário ou senha inválidos.";
const unavailable = "Não foi possível entrar agora. Tente novamente em alguns instantes.";

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  let session: Awaited<ReturnType<typeof createAdminSession>>;
  try {
    const db = getDb();
    const env = getServerEnv();
    await ensureInitialAdmin(db, {
      username: env.ADMIN_INITIAL_USERNAME,
      password: env.ADMIN_INITIAL_PASSWORD,
    });
    const admin = await authenticateAdmin({
      username: formData.get("username"),
      password: formData.get("password"),
    }, db);
    session = await createAdminSession(db, admin.id, getSessionSecret());
  } catch (error) {
    if (error instanceof AuthenticationError) return { error: invalidCredentials };
    console.error("Admin login failed.");
    return { error: unavailable };
  }

  (await cookies()).set(adminSessionCookie, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt,
    priority: "high",
  });
  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminSessionCookie)?.value;
  if (token) {
    try {
      await revokeAdminSession(getDb(), token, getSessionSecret());
    } catch {
      console.error("Admin logout failed to revoke the server session.");
      return;
    }
  }
  cookieStore.delete(adminSessionCookie);
  redirect("/admin/login");
}
