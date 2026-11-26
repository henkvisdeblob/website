import { expect, test } from "@playwright/test";

// The test server runs with DEALS_SOURCE=sample (fictional deals), see playwright.config.ts.

test.describe("weekmenu planner", () => {
  test("makes a week menu with a shopping list", async ({ page }) => {
    await page.goto("/weekmenu");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("weekmenu");
    await page.getByRole("button", { name: "Maak mijn weekmenu" }).click();

    await expect(page.getByRole("heading", { name: "Wat eten we?" })).toBeVisible();
    await expect(page.getByText("Testmodus")).toBeVisible();
    const meals = page.getByRole("list", { name: "Avondmaaltijden" }).locator(":scope > li");
    await expect(meals).toHaveCount(5);
    await expect(page.getByRole("heading", { name: "Boodschappenlijst" })).toBeVisible();
    await expect(page.getByText(/binnen je budget van|boven je budget van/)).toBeVisible();
  });

  test("shows the recipe with steps", async ({ page }) => {
    await page.goto("/weekmenu");
    await page.getByRole("button", { name: "Maak mijn weekmenu" }).click();
    await page.getByText("Recept bekijken").first().click();
    await expect(page.getByText("Bereiding").first()).toBeVisible();
  });

  test("vegan menus contain no animal products on the list", async ({ page }) => {
    await page.goto("/weekmenu");
    await page.getByLabel("Dieet").selectOption("vegan");
    await page.getByRole("button", { name: "Maak mijn weekmenu" }).click();
    const list = page.getByRole("region", { name: "Boodschappenlijst" });
    await expect(list.getByRole("checkbox").first()).toBeVisible();
    const text = await list.innerText();
    for (const word of ["Rundergehakt", "Kipfilet", "Zalmfilet", "Rookworst", "Eieren", "Melk", "kaas"]) {
      expect(text).not.toContain(word);
    }
  });

  test("checking off items updates the counter", async ({ page }) => {
    await page.goto("/weekmenu");
    await page.getByRole("button", { name: "Maak mijn weekmenu" }).click();
    const first = page.getByRole("region", { name: "Boodschappenlijst" }).getByRole("checkbox").first();
    await first.check();
    await expect(page.getByText(/^1 van \d+ in je mandje$/)).toBeVisible();
  });

  test("'Ander menu' makes a new menu and keeps the visitor's choices", async ({ page }) => {
    await page.goto("/weekmenu");
    await page.getByText("Lidl", { exact: true }).click();
    await page.getByLabel("Dieet").selectOption("vegetarian");
    await page.getByRole("button", { name: "Maak mijn weekmenu" }).click();
    await expect(page.getByRole("heading", { name: "Wat eten we?" })).toBeVisible();
    for (const expected of ["1", "2"]) {
      await page.getByRole("button", { name: "Ander menu" }).click();
      await expect(page.locator("input[name=variant]")).toHaveValue(expected);
    }
    await expect(page.getByText(/Weekmenu · Lidl/)).toBeVisible();
    await expect(page.getByLabel("Dieet")).toHaveValue("vegetarian");
    await expect(page.getByRole("radio", { name: "Lidl" })).toBeChecked();
  });

  test("has no horizontal scrolling with results", async ({ page }) => {
    await page.goto("/weekmenu");
    await page.getByRole("button", { name: "Maak mijn weekmenu" }).click();
    await expect(page.getByRole("heading", { name: "Wat eten we?" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("the landing page links to the planner", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /maak een weekmenu met de aanbiedingen/ }).click();
    await expect(page).toHaveURL(/\/weekmenu$/);
  });
});
