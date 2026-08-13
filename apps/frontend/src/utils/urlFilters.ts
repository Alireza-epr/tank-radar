import type { ICenterPoint } from "@/types/generalTypes";
import type { IStationsQueryParams, TRadius, TSortBy, TSortDir } from "@packages/types";

const VALID_RADII: TRadius[] = [2, 5, 10];
const VALID_SORT_BY: TSortBy[] = ["street", "distance"];
const VALID_SORT_DIR: TSortDir[] = ["asc", "desc"];

export interface IUrlFilterState {
  filters: IStationsQueryParams;
  centerPoint: ICenterPoint | null;
}

export const parseFiltersFromParams = (a_Params: Record<string, string>): IUrlFilterState => {
  const rawLat = a_Params.lat;
  const rawLon = a_Params.lon;
  const lat = rawLat !== undefined ? Number(rawLat) : undefined;
  const lon = rawLon !== undefined ? Number(rawLon) : undefined;
  const centerPoint =
    lat !== undefined && lon !== undefined && Number.isFinite(lat) && Number.isFinite(lon)
      ? { lat, lon }
      : null;

  const parsedRadius = a_Params.radius !== undefined ? (Number(a_Params.radius) as TRadius) : undefined;
  // Radius and a distance sort are only meaningful with a center point -
  // an untrusted URL could set one without the other.
  const radius =
    centerPoint && parsedRadius !== undefined && VALID_RADII.includes(parsedRadius) ? parsedRadius : undefined;

  const sortBy: TSortBy =
    centerPoint && a_Params.sortBy !== undefined && VALID_SORT_BY.includes(a_Params.sortBy as TSortBy)
      ? (a_Params.sortBy as TSortBy)
      : "street";

  const sortDir: TSortDir =
    a_Params.sortDir !== undefined && VALID_SORT_DIR.includes(a_Params.sortDir as TSortDir)
      ? (a_Params.sortDir as TSortDir)
      : "asc";

  const search = a_Params.search !== undefined && a_Params.search.trim().length > 0 ? a_Params.search : undefined;

  return {
    filters: { search, radius, sortBy, sortDir },
    centerPoint,
  };
};

// Converts filter/center-point state into the plain param dictionary
// useUrlStore's setParams expects.
export const filtersToParams = (
  a_Filters: IStationsQueryParams,
  a_CenterPoint: ICenterPoint | null,
): Record<string, string> => {
  const params: Record<string, string> = {};

  if (a_Filters.search) params.search = a_Filters.search;

  if (a_CenterPoint) {
    params.lat = String(a_CenterPoint.lat);
    params.lon = String(a_CenterPoint.lon);
    if (a_Filters.radius !== undefined) params.radius = String(a_Filters.radius);
    if (a_Filters.sortBy === "distance") params.sortBy = a_Filters.sortBy;
  }

  if (a_Filters.sortDir) params.sortDir = a_Filters.sortDir;

  return params;
};
