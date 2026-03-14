import { test, expect } from "@playwright/test";

test.describe("Experience Translator", () => {
  test("landing has CTAs to Translate and Interview", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /translate an experience/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /practice interview/i })).toBeVisible();
  });

  test("translate page loads and form works", async ({ page }) => {
    await page.goto("/translate");
    await expect(page.getByRole("heading", { name: /translate an experience/i })).toBeVisible();
    const textarea = page.getByPlaceholder(/paste or type anything/i);
    await expect(textarea).toBeVisible();
    await textarea.fill("I did a group project in my marketing class and presented our findings.");
    await expect(page.getByRole("button", { name: /get 3 resume bullets/i })).toBeEnabled();
  });

  test("translate flow with mocked API: shows skeleton then bullets and copy works", async ({
    page,
  }) => {
    await page.route("**/api/openai", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      const body = route.request().postDataJSON();
      if (body?.type === "resume") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            bullets: [
              "Collaborated with a team to complete a marketing research project and delivered findings in a formal presentation.",
              "Led research and analysis for a group marketing project; presented results to stakeholders.",
              "Contributed to a team based marketing project and communicated key findings in a structured presentation.",
            ],
          }),
        });
      }
      return route.continue();
    });

    await page.goto("/translate");
    const textarea = page.getByPlaceholder(/paste or type anything/i);
    await textarea.fill("Group project in marketing class, we presented our findings.");
    await page.getByRole("button", { name: /get 3 resume bullets/i }).click();

    await expect(page.getByText(/here are three ways to say it/i)).toBeVisible({ timeout: 15000 });

    const copyButtons = page.getByRole("button", { name: /copy bullet 1/i });
    await expect(copyButtons.first()).toBeVisible({ timeout: 5000 });
    await copyButtons.first().click();
    await expect(page.getByText(/collaborated with a team/i).first()).toBeVisible();
  });
});
