import { expect, test } from "@playwright/test";

test("admin manages an invitation and its guests without database access", async ({ context, page }, testInfo) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/admin/login");
  await page.getByLabel("Usuário").fill("admin-e2e");
  await page.getByLabel("Senha").fill("test-password-123");
  await page.getByRole("button", { name: "Entrar" }).click();

  const suffix = testInfo.project.name;
  const invitationName = `Família M5 ${suffix}`;
  await page.getByRole("link", { name: "Criar convite" }).click();
  await page.getByLabel("Nome do convite").fill(invitationName);
  await page.getByLabel("Nome do convidado 1").fill(`Convidado A ${suffix}`);
  await page.getByRole("button", { name: "Adicionar outra pessoa" }).click();
  await page.getByLabel("Nome do convidado 2").fill(`Convidado B ${suffix}`);
  await page.getByLabel("Precisa responder ao RSVP?", { exact: true }).nth(1).selectOption("false");
  await page.getByRole("button", { name: "Criar convite" }).click();

  await expect(page).toHaveURL(/\/admin\/invitations\/[a-z0-9]+$/);
  await expect(page.getByRole("heading", { name: invitationName, level: 1 })).toBeVisible();
  const code = (await page.locator(".admin-code-panel code").innerText()).trim();
  expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/);
  await page.getByRole("button", { name: "Copiar código" }).first().click();
  await expect(page.getByRole("status").filter({ hasText: "Código copiado." })).toHaveText("Código copiado.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(code);

  const firstGuest = page.locator(".admin-guest-card").filter({ hasText: `Convidado A ${suffix}` });
  await expect(firstGuest.getByText("Ainda não respondeu", { exact: true })).toBeVisible();
  await expect(page.getByText("Não precisa responder", { exact: true })).toBeVisible();

  const addGuest = page.getByRole("region", { name: "Adicionar convidado" });
  await expect(addGuest.getByLabel("Telefone")).toHaveCount(0);
  await expect(addGuest.getByLabel("Restrição alimentar")).toHaveCount(0);
  await expect(addGuest.getByLabel("Observações")).toHaveCount(0);
  await expect(addGuest.getByLabel("Mensagem aos noivos")).toHaveCount(0);
  await addGuest.getByLabel("Nome").fill(`Convidado C ${suffix}`);
  await addGuest.getByRole("button", { name: "Adicionar convidado" }).click();
  await expect(page.getByRole("heading", { name: `Convidado C ${suffix}`, level: 3 })).toBeVisible();

  const thirdGuest = page.getByRole("article").filter({ has: page.getByRole("heading", { name: `Convidado C ${suffix}` }) });
  await thirdGuest.getByRole("button", { name: "Remover convidado" }).click();
  const guestDialog = page.getByRole("dialog", { name: `Remover Convidado C ${suffix}?` });
  await expect(guestDialog).toBeVisible();
  await guestDialog.getByRole("button", { name: "Remover convidado" }).click();
  await expect(page.getByRole("heading", { name: `Convidado C ${suffix}`, level: 3 })).toHaveCount(0);

  await page.getByRole("link", { name: "Convites", exact: true }).click();
  await page.getByLabel("Buscar").fill(invitationName);
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page.locator(".admin-result-count")).toContainText("1 convite encontrado");
  const invitationEntry = suffix === "desktop"
    ? page.getByRole("row").filter({ hasText: invitationName })
    : page.locator(".admin-invitation-card").filter({ hasText: invitationName });
  await expect(invitationEntry.getByText(invitationName, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await invitationEntry.getByRole("link", { name: "Ver e editar" }).click();
  await page.getByLabel("Nome do convite").fill(`${invitationName} editado`);
  await page.getByRole("button", { name: "Salvar nome" }).click();
  await expect(page.getByRole("heading", { name: `${invitationName} editado`, level: 1 })).toBeVisible();

  await page.getByRole("button", { name: "Excluir convite" }).click();
  const invitationDialog = page.getByRole("dialog", { name: "Excluir convite?" });
  await expect(invitationDialog).toContainText("Todos os convidados vinculados também serão removidos");
  await invitationDialog.getByRole("button", { name: "Excluir convite" }).click();
  await expect(page).toHaveURL(/\/admin\/invitations$/);
});
