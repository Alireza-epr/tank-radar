import type { EStatusCode, EResponseError } from "@packages/enum";

export type TStatusCode = (typeof EStatusCode)[keyof typeof EStatusCode];

export type TResponseError =
  (typeof EResponseError)[keyof typeof EResponseError];
export interface IResponse<T> {
  success?: boolean;
  error?: (TResponseError | string)[];
  entries?: T[];
  length?: number;
}
