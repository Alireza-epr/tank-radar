import { IStationsQueryParams } from "./stationsTypes";

export type TParseStationsQueryResult =
  | { success: true; data: IStationsQueryParams }
  | { success: false; error: string };