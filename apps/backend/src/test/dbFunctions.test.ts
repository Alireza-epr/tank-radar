import { describe, it, expect } from "@jest/globals";

process.env.DB_PATH = ":memory:";

import { db } from "@/db/config";

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) =>
  (
    db
      .prepare("SELECT haversine_km(?, ?, ?, ?) AS km")
      .get(lat1, lon1, lat2, lon2) as { km: number }
  ).km;

const lowerUnicode = (value: string) =>
  (db.prepare("SELECT lower_unicode(?) AS r").get(value) as { r: string }).r;

const germanSortKey = (value: string) =>
  (db.prepare("SELECT german_sort_key(?) AS r").get(value) as { r: string }).r;

const sortByGermanKey = (values: string[]) =>
  [...values].sort((a, b) => {
    const ka = germanSortKey(a);
    const kb = germanSortKey(b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });

describe("haversine_km", () => {
  it("returns_zero_for_the_same_point", () => {
    expect(haversineKm(50.9, 6.9, 50.9, 6.9)).toBe(0);
  });

  it("matches_the_well_documented_london_to_paris_distance", () => {
    // Real-world distance is ~344 km.
    const km = haversineKm(51.5074, -0.1278, 48.8566, 2.3522);
    expect(km).toBeGreaterThan(343);
    expect(km).toBeLessThan(345);
  });

  it("is_symmetric_regardless_of_point_order", () => {
    const ab = haversineKm(
      50.916095041454554,
      6.960644911005172,
      50.923288946783785,
      6.979491940887355,
    );
    const ba = haversineKm(
      50.923288946783785,
      6.979491940887355,
      50.916095041454554,
      6.960644911005172,
    );
    expect(ab).toBeCloseTo(ba, 10);
  });
});

describe("lower_unicode", () => {
  it("lowercases_plain_ascii", () => {
    expect(lowerUnicode("BONNER STR.")).toBe("bonner str.");
  });

  it("lowercases_german_umlauts_correctly_unlike_sqlites_own_lower", () => {
    expect(lowerUnicode("HÜLCHRATHER STR.")).toBe("hülchrather str.");
    expect(lowerUnicode("BRÜHLER")).toBe("brühler");
  });
});

describe("german_sort_key", () => {
  it("sorts_a_leading_umlaut_next_to_its_base_letter_not_after_z", () => {
    // Confirmed empirically: SQLite's default binary ORDER BY shoves this
    // after "Zollstockgürtel" since "Ä" > "Z" by codepoint.
    const streets = [
      "Zollstockgürtel 39",
      "Aachener Str. 1035",
      "Äußere Kanalstr. 90",
      "Bonner Str. 98",
    ];
    expect(sortByGermanKey(streets)).toEqual([
      "Aachener Str. 1035",
      "Äußere Kanalstr. 90",
      "Bonner Str. 98",
      "Zollstockgürtel 39",
    ]);
  });

  it("treats_ss_and_eszett_as_equivalent_for_sorting", () => {
    expect(germanSortKey("Straße")).toBe(germanSortKey("Strasse"));
  });

  it("is_case_insensitive", () => {
    expect(germanSortKey("BONNER")).toBe(germanSortKey("bonner"));
  });
});
