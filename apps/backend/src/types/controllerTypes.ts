import { IStationsQueryParams } from "@packages/types";

export type TParseStationsQueryResult =
  | { success: true; data: IStationsQueryParams }
  | { success: false; error: string };