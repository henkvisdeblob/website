import { expect, test } from "@playwright/test";

test.describe("landing page", () => {
  test("explains the product above the fold and has one clear call to action", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Elke week een weekmenu binnen je budget.");
    const hero = page.locator("main section").first();
    await expect(hero.getByRole("button", { name: "Zet me op de wachtlijst" })).toBeVisible();
    await expect(hero.getByText("Voorbeeld van een weekmenu")).toBeVisible();
  });

  test("has no horizontal scrolling", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("shows a Dutch error for an invalid email address", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("main section").first();
    await hero.getByLabel("Je e-mailadres").fill("sanne@");
    await hero.getByRole("button", { name: "Zet me op de wachtlijst" }).click();
    await expect(hero.getByRole("alert")).toContainText("geldig e-mailadres");
    await expect(hero.getByLabel("Je e-mailadres")).toHaveAttribute("aria-invalid", "true");
  });

  test("signs up and asks to check the inbox", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("main section").first();
    const email = `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@voorbeeld.nl`;
    await hero.getByLabel("Je e-mailadres").fill(email);
    await hero.getByRole("button", { name: "Zet me op de wachtlijst" }).click();
    await expect(hero.getByRole("status")).toContainText("Check je mail");
    await expect(hero.getByRole("status")).toContainText(email);
  });

  test("the full form at the bottom accepts the optional questions", async ({ page }) => {
    await page.goto("/#wachtlijst");
    const section = page.locator("#wachtlijst");
    await section.getByLabel("Je e-mailadres").fill(`slot-${Date.now()}@voorbeeld.nl`);
    await section.getByText("Lidl", { exact: true }).click();
    await section.getByLabel(/Voor hoeveel mensen kook je/).selectOption("4");
    await section.getByRole("button", { name: "Zet me op de wachtlijst" }).click();
    await expect(section.getByRole("status")).toContainText("Check je mail");
  });

  test("FAQ answers open and close", async ({ page }) => {
    await page.goto("/");
    const question = page.getByText("Kloppen de prijzen altijd?");
    await question.click();
    await expect(page.getByText(/In de winkel kan een prijs soms afwijken/)).toBeVisible();
  });
});

test.describe("keyboard", () => {
  test.skip(({ isMobile }) => isMobile, "keyboard navigation is checked on desktop");

  test("skip link, header and form are reachable and usable with the keyboard", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Naar de inhoud" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: /naar de homepage/ })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Weekmenu maken" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Op de wachtlijst" })).toBeFocused();
    // The hero links to the planner below the form, so the email field comes first after the header.
    await page.keyboard.press("Tab");
    const email = page.locator("main section").first().getByLabel("Je e-mailadres");
    await expect(email).toBeFocused();
    await page.keyboard.type(`toetsenbord-${Date.now()}@voorbeeld.nl`);
    await page.keyboard.press("Enter");
    await expect(page.locator("main section").first().getByRole("status")).toContainText("Check je mail");
  });

  test("focus is visible on interactive elements", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement as Element).outlineStyle);
    expect(outline).not.toBe("none");
  });
});

test.describe("waitlist link pages", () => {
  test("an unknown confirmation link explains what to do", async ({ page }) => {
    await page.goto(`/wachtlijst/bevestigen?token=${"x".repeat(43)}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Deze link werkt niet (meer)");
    await expect(page.getByRole("link", { name: "Opnieuw aanmelden" })).toBeVisible();
  });

  test("unsubscribing with an unknown link shows an error", async ({ page }) => {
    await page.goto(`/wachtlijst/uitschrijven?token=${"x".repeat(43)}`);
    await page.getByRole("button", { name: "Verwijder mijn gegevens" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("Deze link werkt niet");
  });

  test("privacy statement and 404 render", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacyverklaring");
    const res = await page.goto("/bestaat-niet");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Deze pagina bestaat niet");
  });
});
