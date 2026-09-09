import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";
import { loginSchema, initialAdminSchema } from "@/schemas/auth.schema";

describe("admin credentials", () => {
  it("hashes passwords with a random salt and verifies without storing plaintext", async () => {
    const first = await hashPassword("correct horse battery staple");
    const second = await hashPassword("correct horse battery staple");
    expect(first).not.toBe(second);
    expect(first).not.toContain("correct horse battery staple");
    await expect(verifyPassword("correct horse battery staple", first)).resolves.toBe(true);
    await expect(verifyPassword("wrong password", first)).resolves.toBe(false);
    await expect(verifyPassword("correct horse battery staple", "malformed")).resolves.toBe(false);
  });

  it("validates login and bootstrap input", () => {
    expect(loginSchema.parse({ username: " admin ", password: "password" })).toEqual({ username: "admin", password: "password" });
    expect(loginSchema.safeParse({ username: "", password: "password" }).success).toBe(false);
    expect(initialAdminSchema.safeParse({ username: "admin", password: "" }).success).toBe(false);
    expect(initialAdminSchema.safeParse({ username: "admin", password: "long-password" }).success).toBe(true);
  });
});
