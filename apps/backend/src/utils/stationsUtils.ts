import { TParseStationsQueryResult } from "@/types";
import { TRadius, TSortBy, TSortDir } from "@packages/types";

const VALID_RADII: TRadius[] = [2, 5, 10];
const VALID_SORT_BY: TSortBy[] = ["street", "distance"];
const VALID_SORT_DIR: TSortDir[] = ["asc", "desc"];

// Validates and normalizes raw Express query
export const parseStationsQuery = (
  a_Query: Record<string, unknown>,
): TParseStationsQueryResult => {
  const rawLat = a_Query.lat;
  const rawLon = a_Query.lon;
  const rawRadius = a_Query.radius;
  const rawSearch = a_Query.search;
  const rawSortBy = a_Query.sortBy;
  const rawSortDir = a_Query.sortDir;

  const hasLat = rawLat !== undefined;
  const hasLon = rawLon !== undefined;

  if (hasLat !== hasLon) {
    return {
      success: false,
      error: "'lat' and 'lon' must be provided together",
    };
  }

  let lat: number | undefined;
  let lon: number | undefined;

  if (hasLat && hasLon) {
    lat = Number(rawLat);
    lon = Number(rawLon);

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      return {
        success: false,
        error: "'lat' must be a number between -90 and 90",
      };
    }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      return {
        success: false,
        error: "'lon' must be a number between -180 and 180",
      };
    }
  }

  let radius: TRadius | undefined;
  if (rawRadius !== undefined) {
    if (lat === undefined) {
      return {
        success: false,
        error: "'radius' requires 'lat' and 'lon' to also be provided",
      };
    }
    const parsedRadius = Number(rawRadius);
    if (!VALID_RADII.includes(parsedRadius as TRadius)) {
      return { success: false, error: "'radius' must be one of: 2, 5, 10" };
    }
    radius = parsedRadius as TRadius;
  }

  let search: string | undefined;
  if (rawSearch !== undefined) {
    if (typeof rawSearch !== "string") {
      return { success: false, error: "'search' must be a string" };
    }
    const trimmed = rawSearch.trim();
    search = trimmed.length > 0 ? trimmed : undefined;
  }

  let sortBy: TSortBy | undefined;
  if (rawSortBy !== undefined) {
    if (
      typeof rawSortBy !== "string" ||
      !VALID_SORT_BY.includes(rawSortBy as TSortBy)
    ) {
      return {
        success: false,
        error: "'sortBy' must be one of: street, distance",
      };
    }
    if (rawSortBy === "distance" && lat === undefined) {
      return {
        success: false,
        error: "'sortBy=distance' requires 'lat' and 'lon' to also be provided",
      };
    }
    sortBy = rawSortBy as TSortBy;
  }

  let sortDir: TSortDir = "asc";
  if (rawSortDir !== undefined) {
    if (sortBy === undefined) {
      return {
        success: false,
        error: "'sortDir' requires 'sortBy' to also be provided",
      };
    }
    if (
      typeof rawSortDir !== "string" ||
      !VALID_SORT_DIR.includes(rawSortDir as TSortDir)
    ) {
      return { success: false, error: "'sortDir' must be one of: asc, desc" };
    }
    sortDir = rawSortDir as TSortDir;
  }

  return {
    success: true,
    data: {
      lat,
      lon,
      radius,
      search,
      sortBy,
      sortDir: sortBy ? sortDir : undefined,
    },
  };
};
