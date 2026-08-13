export type TSortBy = "street" | "distance";
export type TSortDir = "asc" | "desc";
export type TRadius = 2 | 5 | 10;

export interface IStationsQueryParams {
  lat?: number;
  lon?: number;
  radius?: TRadius;
  search?: string;
  sortBy?: TSortBy;
  sortDir?: TSortDir;
}

export interface IStationResult {
  objectid: number;
  street: string;
  rawAddress: string;
  lat: number;
  lon: number;
  // Only present when lat/lon (a search center) was given.
  distance?: number;
}
