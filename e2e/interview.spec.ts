import { test, expect } from "@playwright/test";

test.describe("Mock Interview", () => {
  test("interview page loads and Start practice is visible", async ({ page }) => {
    await page.goto("/interview");
    await expect(page.getByRole("heading", { name: /practice interview/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /start practice/i })).toBeVisible();
  });

  test("interview flow with mocked API: sends message and shows typing then reply", async ({
    page,
  }) => {
    let callCount = 0;
    await page.route("**/api/openai", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      const body = route.request().postDataJSON();
      if (body?.type !== "interview") return route.continue();
      callCount += 1;
      const reply =
        callCount === 1
          ? "Great to meet you! Here's your first question: Tell me about a time when you had to work with a difficult team member. How did you handle it?"
          : callCount === 2
            ? "That's a solid example. Thanks! Next: Describe a situation where you had to meet a tight deadline. What was your approach?"
            : callCount === 3
              ? "Nice. Last one: Tell me about a time you had to learn something new quickly. How did you go about it?"
              : "You did great! You've earned the Communication badge. BADGE_UNLOCKED Check your Badges page to share it.";
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ reply }),
      });
    });

    await page.goto("/interview");
    await page.getByRole("button", { name: /start practice/i }).click();

    await expect(page.getByText(/great to meet you|first question|difficult team member/i)).toBeVisible({
      timeout: 15000,
    });

    const input = page.getByPlaceholder(/type your answer/i);
    await expect(input).toBeVisible();
    await input.fill("I had a teammate who missed deadlines. I set up a quick sync and we agreed on clear due dates.");
    await page.getByRole("button", { name: /send/i }).click();

    await expect(page.getByText(/interviewer is typing/i)).toBeVisible({ timeout: 3000 });
    await expect(page.getByText(/that's a solid example|next|tight deadline/i)).toBeVisible({
      timeout: 15000,
    });
  });
});
