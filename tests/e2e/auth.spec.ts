import { expect, test } from "@playwright/test";

test("invalid or absent sessions cannot access the protected admin", async ({ context, page, baseURL }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);

  await context.addCookies([{ name: "rt_admin_session", value: "forged-session", url: baseURL! }]);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "Acesso administrativo" })).toBeVisible();
});

test("admin signs in with stored credentials and logout invalidates the session", async ({ context, page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Usuário").fill("admin-e2e");
  await page.getByLabel("Senha").fill("incorrect-password");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.locator("#login-error")).toHaveText("Usuário ou senha inválidos.");
  await expect(page.getByLabel("Usuário")).toHaveValue("admin-e2e");

  await page.getByLabel("Senha").fill("test-password-123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Resumo dos convidados" })).toBeVisible();

  const cookie = (await context.cookies()).find((item) => item.name === "rt_admin_session");
  expect(cookie).toMatchObject({ httpOnly: true, secure: false, sameSite: "Lax", path: "/" });
  expect(cookie?.value.length).toBeGreaterThanOrEqual(43);
  await page.goto("/admin/login");
  await expect(page).toHaveURL(/\/admin$/);

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect((await context.cookies()).some((item) => item.name === "rt_admin_session")).toBe(false);
  await context.addCookies([{ name: "rt_admin_session", value: cookie!.value, url: page.url() }]);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
});
