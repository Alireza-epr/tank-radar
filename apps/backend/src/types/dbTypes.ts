export interface IUpsertStationsResult {
  upserted: number;
  skipped: number;
  deactivated: number;
}

export type TSyncStatus = "success" | "failed" | "running";

export interface ISyncRunInput {
  id: number;
  status: TSyncStatus;
  recordsFetched: number;
  recordsUpserted: number;
  recordsDeactivated: number;
  error?: string;
}

export interface ISyncRun {
  id: number;
  startedAt: string;
  finishedAt: string | null;
  status: TSyncStatus;
  recordsFetched: number;
  recordsUpserted: number;
  recordsDeactivated: number;
  error: string | null;
}

export interface ISyncMeta {
  latest: ISyncRun | null;
  lastSuccess: ISyncRun | null;
}