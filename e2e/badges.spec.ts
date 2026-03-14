import { test, expect } from "@playwright/test";

test.describe("Badges", () => {
  test("badges page loads and shows unlock CTA when no badge", async ({ page }) => {
    await page.goto("/badges");
    await expect(page.getByRole("heading", { name: /my badges/i })).toBeVisible();
    const interviewLink = page.getByRole("link", { name: /complete the mock interview/i });
    await expect(interviewLink).toBeVisible();
    await expect(interviewLink).toHaveAttribute("href", "/interview");
  });

  test("badges page shows export buttons when badge unlocked", async ({
    page,
    context,
  }) => {
    await context.addInitScript(() => {
      localStorage.setItem("aptitude_badge_unlocked", "true");
    });
    await page.goto("/badges");
    await expect(page.getByRole("button", { name: /copy achievement text/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /download badge image/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /share to linkedin/i })).toBeVisible();
  });
});
