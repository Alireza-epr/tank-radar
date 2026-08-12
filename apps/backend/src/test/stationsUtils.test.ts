import { describe, it, expect } from "@jest/globals";
import { parseStationsQuery } from "@/utils/stationsUtils";

// Small helpers so each test doesn't have to narrow result.success itself.
const expectError = (query: Record<string, unknown>) => {
  const result = parseStationsQuery(query);
  if (result.success) throw new Error("expected a validation error, got success");
  return result.error;
};

const expectData = (query: Record<string, unknown>) => {
  const result = parseStationsQuery(query);
  if (!result.success) throw new Error(`expected success, got error: ${result.error}`);
  return result.data;
};

describe("parseStationsQuery", () => {
  it("returns_all_undefined_fields_for_an_empty_query", () => {
    expect(expectData({})).toEqual({
      lat: undefined,
      lon: undefined,
      radius: undefined,
      search: undefined,
      sortBy: undefined,
      sortDir: undefined,
    });
  });

  it("accepts_a_valid_lat_lon_pair", () => {
    const data = expectData({ lat: "50.9377", lon: "6.9603" });
    expect(data.lat).toBeCloseTo(50.9377);
    expect(data.lon).toBeCloseTo(6.9603);
  });

  it("rejects_lat_without_lon", () => {
    expect(expectError({ lat: "50.9" })).toMatch(/lat.*lon.*together/);
  });

  it("rejects_lon_without_lat", () => {
    expect(expectError({ lon: "6.9" })).toMatch(/lat.*lon.*together/);
  });

  it("rejects_a_non_numeric_lat", () => {
    expect(expectError({ lat: "not-a-number", lon: "6.9" })).toMatch(/lat/);
  });

  it("rejects_a_lat_out_of_range", () => {
    expect(expectError({ lat: "999", lon: "6.9" })).toMatch(/lat/);
  });

  it("rejects_a_lon_out_of_range", () => {
    expect(expectError({ lat: "50.9", lon: "999" })).toMatch(/lon/);
  });

  it("rejects_radius_without_lat_lon", () => {
    expect(expectError({ radius: "5" })).toMatch(/radius.*lat.*lon/);
  });

  it("rejects_a_radius_value_not_in_2_5_10", () => {
    expect(expectError({ lat: "50.9", lon: "6.9", radius: "7" })).toMatch(/radius/);
  });

  it.each([2, 5, 10])("accepts_radius_%i_with_lat_lon", (radius) => {
    const data = expectData({ lat: "50.9", lon: "6.9", radius: String(radius) });
    expect(data.radius).toBe(radius);
  });

  it("treats_an_empty_search_string_as_no_search_rather_than_an_error", () => {
    expect(expectData({ search: "   " }).search).toBeUndefined();
  });

  it("trims_a_valid_search_string", () => {
    expect(expectData({ search: "  Bonner  " }).search).toBe("Bonner");
  });

  it("rejects_a_non_string_search_value", () => {
    expect(expectError({ search: ["a", "b"] })).toMatch(/search/);
  });

  it("rejects_an_invalid_sortBy_value", () => {
    expect(expectError({ sortBy: "nonsense" })).toMatch(/sortBy/);
  });

  it("accepts_sortBy_street_without_lat_lon", () => {
    const data = expectData({ sortBy: "street" });
    expect(data.sortBy).toBe("street");
    expect(data.sortDir).toBe("asc");
  });

  it("rejects_sortBy_distance_without_lat_lon", () => {
    expect(expectError({ sortBy: "distance" })).toMatch(/distance.*lat.*lon/);
  });

  it("accepts_sortBy_distance_with_lat_lon", () => {
    expect(expectData({ lat: "50.9", lon: "6.9", sortBy: "distance" }).sortBy).toBe("distance");
  });

  it("rejects_sortDir_without_sortBy", () => {
    expect(expectError({ sortDir: "asc" })).toMatch(/sortDir.*sortBy/);
  });

  it("rejects_an_invalid_sortDir_value", () => {
    expect(expectError({ sortBy: "street", sortDir: "sideways" })).toMatch(/sortDir/);
  });

  it("accepts_a_fully_specified_valid_query", () => {
    const data = expectData({
      lat: "50.9377",
      lon: "6.9603",
      radius: "5",
      search: "Bonner",
      sortBy: "distance",
      sortDir: "desc",
    });
    expect(data).toMatchObject({
      radius: 5,
      search: "Bonner",
      sortBy: "distance",
      sortDir: "desc",
    });
  });
});
