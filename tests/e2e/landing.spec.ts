import { expect, test } from "@playwright/test";

test.describe("landing page", () => {
  test("explains the product above the fold and has one clear call to action", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Elke week een weekmenu binnen je budget.");
    const hero = page.locator("main section").first();
    const cta = hero.getByRole("link", { name: "Maak gratis je weekmenu" });
    await expect(cta).toBeVisible();
    await expect(cta).toBeInViewport();
    await expect(hero.getByText("Voorbeeld van een weekmenu")).toBeVisible();
  });

  test("shows this week's deals per store", async ({ page }) => {
    await page.goto("/");
    const deals = page.getByRole("region", { name: "Deze week in de aanbieding" });
    await expect(deals.getByText("Albert Heijn", { exact: true })).toBeVisible();
    await expect(deals.getByText(/toppers$/).first()).toBeVisible();
    // The e2e server runs with DEALS_SOURCE=sample, which must be labelled as made-up data.
    await expect(deals.getByText("Testmodus: verzonnen voorbeeldaanbiedingen.")).toBeVisible();
  });

  test("has no horizontal scrolling", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("shows a Dutch error for an invalid email address", async ({ page }) => {
    await page.goto("/#wachtlijst");
    const section = page.locator("#wachtlijst");
    await section.getByLabel("Je e-mailadres").fill("sanne@");
    await section.getByRole("button", { name: "Zet me op de wachtlijst" }).click();
    await expect(section.getByRole("alert")).toContainText("geldig e-mailadres");
    await expect(section.getByLabel("Je e-mailadres")).toHaveAttribute("aria-invalid", "true");
  });

  test("signs up and asks to check the inbox", async ({ page }) => {
    await page.goto("/#wachtlijst");
    const section = page.locator("#wachtlijst");
    const email = `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@voorbeeld.nl`;
    await section.getByLabel("Je e-mailadres").fill(email);
    await section.getByRole("button", { name: "Zet me op de wachtlijst" }).click();
    await expect(section.getByRole("status")).toContainText("Check je mail");
    await expect(section.getByRole("status")).toContainText(email);
  });

  test("the waitlist form accepts the optional questions", async ({ page }) => {
    await page.goto("/#wachtlijst");
    const section = page.locator("#wachtlijst");
    await section.getByLabel("Je e-mailadres").fill(`slot-${Date.now()}@voorbeeld.nl`);
    await section.getByText("Lidl", { exact: true }).click();
    await section.getByLabel(/Voor hoeveel mensen kook je/).selectOption("4");
    await section.getByRole("button", { name: "Zet me op de wachtlijst" }).click();
    await expect(section.getByRole("status")).toContainText("Check je mail");
  });

  test("the hero links to the waitlist", async ({ page }) => {
    await page.goto("/");
    await page.locator("main section").first().getByRole("link", { name: "Zet je op de wachtlijst" }).click();
    await expect(page).toHaveURL(/#wachtlijst$/);
    await expect(page.locator("#wachtlijst").getByLabel("Je e-mailadres")).toBeInViewport();
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

  test("skip link, header and hero are reachable in a logical order", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Naar de inhoud" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: /naar de homepage/ })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("banner").getByRole("link", { name: "Wachtlijst" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("banner").getByRole("link", { name: "Weekmenu maken" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Maak gratis je weekmenu" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Zet je op de wachtlijst" })).toBeFocused();
  });

  test("the waitlist can be reached and submitted with the keyboard", async ({ page }) => {
    await page.goto("/");
    const heroLink = page.getByRole("link", { name: "Zet je op de wachtlijst" });
    await heroLink.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#wachtlijst$/);
    // Following an in-page link moves the focus starting point, so the next Tab lands in the form.
    await page.keyboard.press("Tab");
    const section = page.locator("#wachtlijst");
    await expect(section.getByLabel("Je e-mailadres")).toBeFocused();
    await page.keyboard.type(`toetsenbord-${Date.now()}@voorbeeld.nl`);
    await page.keyboard.press("Enter");
    await expect(section.getByRole("status")).toContainText("Check je mail");
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
