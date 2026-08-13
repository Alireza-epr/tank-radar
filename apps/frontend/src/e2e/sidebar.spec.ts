import { test, expect } from "@playwright/test";

const GET_STATIONS_BUTTON = /^Get Stations$|^Loading…$/;
const MAP_CLICK_POSITION = { x: 300, y: 300 };

test.describe("Sidebar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for the header's auto-sync so the DB actually has stations to query.
    await expect(page.locator(".header_status")).toHaveText("success", { timeout: 15_000 });
  });

  test("shows_every_filter_field_and_the_submit_button", async ({ page }) => {
    await expect(page.locator("#search")).toBeVisible();
    await expect(page.locator("#radius")).toBeVisible();
    await expect(page.locator("#sortBy")).toBeVisible();
    await expect(page.locator("#sortDir")).toBeVisible();
    await expect(page.getByRole("button", { name: GET_STATIONS_BUTTON })).toBeVisible();
  });

  test("fetching_stations_lists_them_in_the_footer_and_plots_markers_on_the_map", async ({ page }) => {
    const rows = page.locator(".footer_table tbody tr");
    await expect(rows.first()).toContainText("No stations loaded yet.");

    await page.getByRole("button", { name: GET_STATIONS_BUTTON }).click();

    await expect(rows.first()).not.toContainText("No stations loaded yet.", { timeout: 15_000 });
    expect(await rows.count()).toBeGreaterThan(0);

    const markers = page.locator(".maplibregl-marker");
    await expect(markers.first()).toBeVisible();
    expect(await markers.count()).toBeGreaterThan(0);
  });

  test("filtering_by_search_narrows_the_footer_results_to_matching_streets", async ({ page }) => {
    await page.getByRole("button", { name: GET_STATIONS_BUTTON }).click();
    const firstStreetCell = page.locator(".footer_table tbody tr td").first();
    await expect(firstStreetCell).not.toHaveText(/Loading stations…|No stations loaded yet\./, {
      timeout: 15_000,
    });
    const streetName = (await firstStreetCell.textContent())?.trim() ?? "";
    expect(streetName.length).toBeGreaterThan(0);

    await page.fill("#search", streetName);
    await page.getByRole("button", { name: GET_STATIONS_BUTTON }).click();

    const rows = page.locator(".footer_table tbody tr");
    await expect(rows.first()).not.toHaveText(/Loading stations…/, { timeout: 15_000 });
    const texts = await rows.allTextContents();
    expect(texts.length).toBeGreaterThan(0);
    for (const text of texts) {
      expect(text.toLowerCase()).toContain(streetName.toLowerCase());
    }
  });

  test("radius_is_disabled_until_a_location_is_picked_on_the_map", async ({ page }) => {
    await expect(page.locator("#radius")).toBeDisabled();
    await expect(page.locator("option[value='distance']")).toBeDisabled();

    // A plain map click (no picking mode) must not count as a pick.
    await page.locator(".map-wrapper").click({ position: MAP_CLICK_POSITION });
    await expect(page.locator("#radius")).toBeDisabled();
    await expect(page.locator(".sidebar_center-point")).toHaveCount(0);
  });

  test("picking_a_map_location_enables_and_applies_the_radius_filter", async ({ page }) => {
    await page.getByRole("button", { name: "Pick Location on Map" }).click();
    await expect(page.getByRole("button", { name: "Click the map…" })).toBeVisible();

    await page.locator(".map-wrapper").click({ position: MAP_CLICK_POSITION });

    await expect(page.locator(".sidebar_center-point")).toBeVisible();
    await expect(page.locator("#radius")).toBeEnabled();
    // The picked point itself renders as a marker too.
    await expect(page.locator(".maplibregl-marker").first()).toBeVisible();

    await page.selectOption("#radius", "10");
    await page.getByRole("button", { name: GET_STATIONS_BUTTON }).click();

    await expect(page.locator(".sidebar_error")).toHaveCount(0, { timeout: 15_000 });
    await expect(page.locator(".footer_table tbody tr").first()).not.toContainText(
      "No stations loaded yet.",
    );
  });

  test("picking_a_location_shows_real_distances_even_without_a_radius_filter", async ({ page }) => {
    // A picked point alone (no radius) should still make the backend
    // compute and return a real distance for every station.
    await page.getByRole("button", { name: "Pick Location on Map" }).click();
    await page.locator(".map-wrapper").click({ position: MAP_CLICK_POSITION });
    await expect(page.locator(".sidebar_center-point")).toBeVisible();
    await expect(page.locator("#radius")).toHaveValue("");

    await page.getByRole("button", { name: GET_STATIONS_BUTTON }).click();

    const distanceCell = page.locator(".footer_table tbody tr td:nth-child(3)").first();
    await expect(distanceCell).toBeVisible({ timeout: 15_000 });
    await expect(distanceCell).not.toHaveText("—");
    await expect(distanceCell).toContainText("km");
  });

  test("clearing_the_picked_point_disables_the_radius_filter_again", async ({ page }) => {
    await page.getByRole("button", { name: "Pick Location on Map" }).click();
    await page.locator(".map-wrapper").click({ position: MAP_CLICK_POSITION });
    await expect(page.locator("#radius")).toBeEnabled();

    await page.getByRole("button", { name: "Clear" }).click();

    await expect(page.locator("#radius")).toBeDisabled();
    await expect(page.locator(".sidebar_center-point")).toHaveCount(0);
  });

  test("shows_an_error_message_when_the_stations_request_fails", async ({ page }) => {
    await page.route("**/v1/api/stations*", (route) => route.abort("failed"));

    await page.getByRole("button", { name: GET_STATIONS_BUTTON }).click();

    await expect(page.locator(".sidebar_error")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(".footer_table tbody tr").first()).toContainText(
      "Failed to load stations.",
    );
  });
});
