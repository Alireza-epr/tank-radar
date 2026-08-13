import { describe, it, expect } from "@jest/globals";
import { filtersToParams, parseFiltersFromParams } from "@/utils/urlFilters";

describe("parseFiltersFromParams", () => {
  it("reads_search_sort_and_direction", () => {
    const { filters, centerPoint } = parseFiltersFromParams({ search: "Ring", sortDir: "desc" });

    expect(filters.search).toBe("Ring");
    expect(filters.sortDir).toBe("desc");
    expect(centerPoint).toBeNull();
  });

  it("reads_a_center_point_radius_and_distance_sort_together", () => {
    const { filters, centerPoint } = parseFiltersFromParams({
      lat: "50.9375",
      lon: "6.9603",
      radius: "5",
      sortBy: "distance",
    });

    expect(centerPoint).toEqual({ lat: 50.9375, lon: 6.9603 });
    expect(filters.radius).toBe(5);
    expect(filters.sortBy).toBe("distance");
  });

  it("ignores_radius_and_a_distance_sort_without_a_center_point", () => {
    const { filters, centerPoint } = parseFiltersFromParams({ radius: "5", sortBy: "distance" });

    expect(centerPoint).toBeNull();
    expect(filters.radius).toBeUndefined();
    expect(filters.sortBy).toBe("street");
  });

  it("ignores_an_invalid_radius_or_sort_value", () => {
    const { filters } = parseFiltersFromParams({
      lat: "50.9375",
      lon: "6.9603",
      radius: "999",
      sortBy: "nonsense",
      sortDir: "nonsense",
    });

    expect(filters.radius).toBeUndefined();
    expect(filters.sortBy).toBe("street");
    expect(filters.sortDir).toBe("asc");
  });

  it("defaults_to_no_filters_for_an_empty_param_set", () => {
    const { filters, centerPoint } = parseFiltersFromParams({});

    expect(filters).toEqual({ search: undefined, radius: undefined, sortBy: "street", sortDir: "asc" });
    expect(centerPoint).toBeNull();
  });
});

describe("filtersToParams", () => {
  it("writes_search_and_the_sort_direction", () => {
    const params = filtersToParams({ search: "Ring", sortDir: "desc" }, null);

    expect(params.search).toBe("Ring");
    expect(params.sortDir).toBe("desc");
  });

  it("writes_the_center_point_radius_and_distance_sort_together", () => {
    const params = filtersToParams(
      { radius: 5, sortBy: "distance", sortDir: "asc" },
      { lat: 50.9375, lon: 6.9603 },
    );

    expect(params.lat).toBe("50.9375");
    expect(params.lon).toBe("6.9603");
    expect(params.radius).toBe("5");
    expect(params.sortBy).toBe("distance");
  });

  it("omits_radius_and_sort_by_when_there_is_no_center_point", () => {
    const params = filtersToParams({ radius: 5, sortBy: "distance", sortDir: "asc" }, null);

    expect(params.lat).toBeUndefined();
    expect(params.radius).toBeUndefined();
    expect(params.sortBy).toBeUndefined();
  });

  it("round_trips_through_parse_and_write", () => {
    const filters = { search: "Ring", radius: 10 as const, sortBy: "distance" as const, sortDir: "desc" as const };
    const centerPoint = { lat: 50.9375, lon: 6.9603 };

    const params = filtersToParams(filters, centerPoint);
    const result = parseFiltersFromParams(params);

    expect(result.filters).toEqual(filters);
    expect(result.centerPoint).toEqual(centerPoint);
  });
});
