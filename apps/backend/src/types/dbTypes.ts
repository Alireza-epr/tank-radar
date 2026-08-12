export interface IUpsertStationsResult {
  upserted: number;
  skipped: number;
  deactivated: number;
}

export type TSyncStatus = "success" | "failed";

export interface ISyncRunInput {
  id: number;
  status: TSyncStatus;
  recordsFetched: number;
  recordsUpserted: number;
  recordsDeactivated: number;
  error?: string;
}