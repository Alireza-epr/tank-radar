import { test, expect } from "@playwright/test";

const GET_STATIONS_BUTTON = /^Get Stations$|^Loading…$/;
const SELECTED_MARKER_BACKGROUND = "rgb(255, 159, 64)";

test.describe("Pilot", () => {
  test("picks_a_point_submits_selects_a_result_and_confirms_the_marker_highlight_and_url_sync", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".header_status")).toHaveText("success", { timeout: 15_000 });

    // Pick a point right where the map is already centered (Köln).
    await page.getByRole("button", { name: "Pick Location on Map" }).click();
    const mapBox = await page.locator(".map-wrapper").boundingBox();
    if (!mapBox) throw new Error("map-wrapper has no bounding box");
    await page.locator(".map-wrapper").click({
      position: { x: mapBox.width / 2, y: mapBox.height / 2 },
    });
    await expect(page.locator(".sidebar_center-point")).toBeVisible();

    // Submit with just that point set - no radius, default sort.
    await page.getByRole("button", { name: GET_STATIONS_BUTTON }).click();

    const rows = page.locator(".footer_table tbody tr");
    await expect(rows.first()).not.toHaveText(/Loading stations…|No stations loaded yet\./, { timeout: 15_000 });
    expect(await rows.count()).toBeGreaterThan(0);

    // Select the first result in the list.
    await rows.first().click();
    await expect(page.locator(".footer_row--selected")).toHaveCount(1);

    // Exactly one station marker on the map now carries the bolder
    // "selected" background - every other one keeps the normal shade.
    const markerBackgrounds = await page.$$eval("[data-objectid]", (elements) =>
      elements.map((element) => (element as HTMLElement).style.backgroundColor),
    );
    expect(markerBackgrounds.length).toBeGreaterThan(1);
    expect(markerBackgrounds.filter((background) => background === SELECTED_MARKER_BACKGROUND)).toHaveLength(1);

    // The URL reflects exactly the filters that were actually applied
    const params = new URL(page.url()).searchParams;
    const lat = Number(params.get("lat"));
    const lon = Number(params.get("lon"));
    expect(lat).toBeGreaterThan(50.8);
    expect(lat).toBeLessThan(51.1);
    expect(lon).toBeGreaterThan(6.7);
    expect(lon).toBeLessThan(7.2);
    expect(params.get("sortDir")).toBe("asc");
    expect(params.get("radius")).toBeNull();
    expect(params.get("sortBy")).toBeNull();
  });
});
