import { test, expect } from "@playwright/test";

test.describe("Progress", () => {
  test("progress page loads and shows CTA", async ({ page }) => {
    await page.goto("/progress");
    await expect(page.getByRole("heading", { name: /my progress/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /practice another interview/i })).toBeVisible();
  });
});
