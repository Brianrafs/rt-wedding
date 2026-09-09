import { z } from "zod";

const optionalText = z.preprocess(
  (value) => value === "" ? undefined : value,
  z.string().min(1).optional(),
);
const optionalDate = z.preprocess(
  (value) => value === "" ? undefined : value,
  z.iso.datetime({ offset: true }).optional(),
);

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: optionalText,
  TURSO_DATABASE_URL: optionalText,
  TURSO_AUTH_TOKEN: optionalText,
  SESSION_SECRET: z.preprocess(
    (value) => value === "" ? undefined : value,
    z.string().min(32).optional(),
  ),
  ADMIN_INITIAL_USERNAME: optionalText,
  ADMIN_INITIAL_PASSWORD: optionalText,
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    (value) => value === "" ? undefined : value,
    z.url({ protocol: /^https?$/ }).optional(),
  ),
  WEDDING_DATE: optionalDate,
  RSVP_DEADLINE: optionalDate,
}).superRefine((env, ctx) => {
  if (env.NODE_ENV === "production") {
    const url = z.url({ protocol: /^(libsql|https)$/ }).safeParse(env.TURSO_DATABASE_URL);
    if (!url.success) {
      ctx.addIssue({ code: "custom", path: ["TURSO_DATABASE_URL"], message: "A remote Turso URL is required." });
    }
    if (!env.TURSO_AUTH_TOKEN?.trim()) {
      ctx.addIssue({ code: "custom", path: ["TURSO_AUTH_TOKEN"], message: "A Turso token is required." });
    }
    if (!env.SESSION_SECRET) {
      ctx.addIssue({ code: "custom", path: ["SESSION_SECRET"], message: "A session secret is required." });
    }
  } else if (env.DATABASE_URL && !/^file:.+/.test(env.DATABASE_URL)) {
    ctx.addIssue({ code: "custom", path: ["DATABASE_URL"], message: "Use a local SQLite file URL." });
  }
});

export type ServerEnv = z.infer<typeof envSchema>;

export function parseEnv(input: Record<string, string | undefined>): ServerEnv {
  const result = envSchema.safeParse(input);
  if (!result.success) {
    const fields = [...new Set(result.error.issues.map((issue) => issue.path.join(".")))];
    // Report field names, never supplied values or Zod's raw error payload.
    throw new Error(`Invalid server configuration: ${fields.join(", ")}`);
  }
  return result.data;
}
