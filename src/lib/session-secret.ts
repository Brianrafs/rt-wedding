import "server-only";
import { getServerEnv } from "@/lib/env";

export function getSessionSecret() {
  const secret = getServerEnv().SESSION_SECRET;
  if (!secret) throw new Error("Missing session configuration.");
  return secret;
}
