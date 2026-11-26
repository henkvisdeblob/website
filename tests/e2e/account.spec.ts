import { expect, test } from "@playwright/test";

/*
 * The e2e server runs without Supabase and Stripe keys, like the site before accounts go live.
 * Then accounts and Premium are switched off and nothing about the free planner may change.
 * (The logged-in journeys are covered by unit tests and a local run against mock services.)
 */

test.describe("accounts and Premium while switched off", () => {
  test("the login page says accounts are coming", async ({ page }) => {
    await page.goto("/inloggen");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Accounts komen binnenkort");
    await expect(page.getByRole("main").getByRole("link", { name: "Maak gratis je weekmenu" })).toBeVisible();
  });

  test("/account leads to the account page, which says accounts are not available yet", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/account\/abonnement$/);
    await expect(page.getByText("Accounts komen binnenkort.")).toBeVisible();
  });

  test("the planner has no Premium limits", async ({ page }) => {
    await page.goto("/weekmenu");
    const dinners = page.getByLabel("Avonden");
    await expect(dinners).toHaveValue("5");
    await expect(dinners.locator("option", { hasText: "Premium" })).toHaveCount(0);
  });

  test("the header offers the waitlist, not an account", async ({ page }) => {
    await page.goto("/weekmenu");
    await expect(page.getByRole("banner").getByRole("link", { name: "Op de wachtlijst" })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: "Account" })).toHaveCount(0);
  });

  test("the Stripe webhook refuses requests while billing is not configured", async ({ request }) => {
    const res = await request.post("/api/stripe/webhook", { data: "{}" });
    expect(res.status()).toBe(503);
  });

  test("a login link without a working account system goes back to the login page", async ({ page }) => {
    await page.goto("/auth/confirm?token_hash=x&type=email");
    await expect(page).toHaveURL(/\/inloggen\?fout=link$/);
  });
});

test.describe("terms", () => {
  test("are linked from the footer and explain cancelling and withdrawal", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: "Voorwaarden" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Voorwaarden");
    await expect(page.getByRole("heading", { name: "4. Verlengen en opzeggen" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "5. Herroepingsrecht (bedenktijd)" })).toBeVisible();
    await expect(page.getByText("Modelformulier voor herroeping")).toBeVisible();
  });

  test("have no horizontal scrolling", async ({ page }) => {
    await page.goto("/voorwaarden");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
