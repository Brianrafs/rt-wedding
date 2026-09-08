import { expect, test } from "@playwright/test";

test("foundation route renders without runtime errors or overflow", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Em breve" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
