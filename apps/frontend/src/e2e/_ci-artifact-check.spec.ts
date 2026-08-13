import { test, expect } from "@playwright/test";

test("intentionally_fails_to_trigger_the_playwright_report_upload", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Tank Radar" })).toHaveText(
    "intentional failure",
  );
});
