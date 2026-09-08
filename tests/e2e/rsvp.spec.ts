import { expect, test } from "@playwright/test";

test("guest can recover from an invalid code, save individual answers, and reopen them", async ({ page }) => {
  await page.goto("/#rsvp");
  const code = page.getByLabel("Código do convite");
  await expect(code).toBeVisible();

  await code.fill("ABC234");
  await page.getByRole("button", { name: "Confirmar convite" }).click();
  await expect(page.locator("#rsvp-code-error")).toContainText("Não encontramos um convite");
  await expect(code).toHaveAttribute("aria-invalid", "true");

  await code.fill("7kpx4m");
  await expect(code).toHaveAttribute("aria-invalid", "false");
  await page.getByRole("button", { name: "Confirmar convite" }).click();
  await expect(page.getByRole("heading", { name: "Família Teste" })).toBeFocused();

  const guests = page.locator(".rsvp-guest");
  await guests.nth(0).getByRole("radio", { name: /^Confirmarei presença/ }).check();
  await guests.nth(0).getByText("Informações opcionais").click();
  await guests.nth(0).getByLabel("Telefone (opcional)").fill("83 99999-0000");
  await guests.nth(1).getByRole("radio", { name: /^Não poderei comparecer/ }).check();
  await page.getByRole("button", { name: "Confirmar respostas" }).click();

  await expect(page.getByRole("heading", { name: "Que alegria ter vocês conosco." })).toBeFocused();
  await page.getByRole("button", { name: "Alterar respostas" }).click();
  await expect(guests.nth(0).getByRole("radio", { name: /^Confirmarei presença/ })).toBeChecked();
  await expect(guests.nth(1).getByRole("radio", { name: /^Não poderei comparecer/ })).toBeChecked();
  await guests.nth(0).getByText("Informações opcionais").click();
  await expect(guests.nth(0).getByLabel("Telefone (opcional)")).toHaveValue("83 99999-0000");
});
