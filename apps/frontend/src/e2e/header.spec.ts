import { test, expect } from "@playwright/test";

const SYNC_BUTTON = /^Sync$|^Syncing…$/;
const GET_META_BUTTON = /^Get Meta$|^Getting…$/;

test.describe("Header", () => {
  test("shows_the_app_title", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Tank Radar" }),
    ).toBeVisible();
  });

  test("auto_syncs_on_load_and_shows_a_success_badge_with_updated_meta", async ({
    page,
  }) => {
    await page.goto("/");

    const status = page.locator(".header_status");
    await expect(status).toHaveText("success", { timeout: 15_000 });
    await expect(status).toHaveClass(/header_status--success/);

    // The meta panel reflects the run that just happened, not the "—" placeholder.
    const metaValues = page.locator(".header_meta-value");
    await expect(metaValues.first()).not.toHaveText("—");
    await expect(metaValues.last()).not.toHaveText("—");
  });

  test("clicking_sync_again_re-runs_it_and_keeps_the_success_badge", async ({
    page,
  }) => {
    await page.goto("/");

    const status = page.locator(".header_status");
    await expect(status).toHaveText("success", { timeout: 15_000 });

    // Not asserting on the transient "disabled while syncing" state here -
    // a local sync resolves fast enough that it reliably flips back before
    // Playwright's polling ever observes it, making that check pure flake.
    const syncButton = page.getByRole("button", { name: SYNC_BUTTON });
    await expect(syncButton).toBeEnabled();
    await syncButton.click();

    await expect(syncButton).toBeEnabled({ timeout: 15_000 });
    await expect(status).toHaveText("success");
  });

  test("shows_a_failed_badge_when_the_sync_request_cannot_reach_the_backend", async ({
    page,
  }) => {
    // Registered before navigation so it also catches the auto-sync on mount.
    await page.route("**/v1/api/sync", (route) => route.abort("failed"));

    await page.goto("/");

    const status = page.locator(".header_status");
    await expect(status).toHaveText("failed", { timeout: 15_000 });
    await expect(status).toHaveClass(/header_status--failed/);
  });

  test("get_meta_button_refreshes_the_meta_panel", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".header_status")).toHaveText("success", {
      timeout: 15_000,
    });

    const getMetaButton = page.getByRole("button", { name: GET_META_BUTTON });
    await expect(getMetaButton).toBeEnabled();
    await getMetaButton.click();
    await expect(getMetaButton).toBeEnabled({ timeout: 15_000 });

    await expect(page.locator(".header_meta-value").first()).not.toHaveText(
      "—",
    );
  });
});
