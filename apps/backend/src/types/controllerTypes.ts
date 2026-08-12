import { TResponseError } from "@packages/types";
import { IStationsQueryParams } from "./stationsTypes";

export interface IResponse<T> {
    success?: boolean;
    error?: (TResponseError | string)[];
    entries?: T[];
    length?: number
}

export type TParseStationsQueryResult =
  | { success: true; data: IStationsQueryParams }
  | { success: false; error: string };