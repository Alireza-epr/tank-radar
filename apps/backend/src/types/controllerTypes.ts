import { TResponseError } from "@packages/types";

export interface IResponse<T> {
    success?: boolean;
    error?: (TResponseError | string)[];
    entries?: T[];
}