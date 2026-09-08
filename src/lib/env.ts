import "server-only";
import { parseEnv } from "@/schemas/env.schema";

// Validate when server infrastructure is used; static builds need no DB secrets.
export function getServerEnv() {
  return parseEnv(process.env);
}
