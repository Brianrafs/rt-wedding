import { expect, test } from "@playwright/test";

test("public page has its M2 sections, metadata, and no runtime errors or overflow", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Ryelthon & Thayna", level: 1 })).toBeVisible();
  for (const name of ["Até o nosso sim", "Nosso dia", "O local", "Com leveza, com você.", "Instantes que ficam com a gente.", "Sua presença, nosso presente."]) {
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  }
  await expect(page).toHaveTitle("Ryelthon & Thayna | 10 de dezembro de 2026");
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "pt_BR");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /10 de dezembro de 2026/);
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Como chegar/ })).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("keyboard users can skip navigation and follow section links", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Pular para o conteúdo" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await page.getByRole("link", { name: "Conheça nosso dia" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#nosso-dia$/);
  await expect(page.getByRole("heading", { name: "Nosso dia", exact: true })).toBeInViewport();
});

test("countdown updates, pauses, resumes, and handles the event date", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-12-09T03:00:00Z") });
  await page.goto("/");
  const counter = page.getByLabel("Contagem regressiva", { exact: true });
  const pause = page.getByRole("button", { name: "Pausar contagem" });
  await expect(pause).toBeVisible();
  const initial = await counter.innerText();
  await page.clock.runFor(2000);
  expect(await counter.innerText()).not.toBe(initial);
  await pause.click();
  const paused = await counter.innerText();
  await page.clock.runFor(3000);
  expect(await counter.innerText()).toBe(paused);
  await page.getByRole("button", { name: "Retomar contagem" }).click();
  await page.clock.runFor(1000);
  expect(await counter.innerText()).not.toBe(paused);
  await page.clock.fastForward(3 * 86400 * 1000);
  await expect(page.getByText("O nosso grande dia chegou.", { exact: true })).toBeVisible();
  await expect(counter).toHaveCount(0);
});

test("reduced motion and narrow text reflow preserve content", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  expect(await page.locator("html").evaluate((element) => getComputedStyle(element).scrollBehavior)).toBe("auto");
  await page.addStyleTag({ content: "html { font-size: 200%; } p { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; }" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
