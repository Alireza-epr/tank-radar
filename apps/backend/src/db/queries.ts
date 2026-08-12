import { db } from "@/db/config";
import {
  ISyncMeta,
  ISyncRun,
  IStation,
  ISyncRunInput,
  IStationResult,
  IStationsQueryParams,
  IUpsertStationsResult,
} from "@/types";
import { isValidStation, parseStreetFromAddress } from "@/utils/apiUtils";
import { backend_log } from "@/utils/generalUtils";
import { ELogType } from "@packages/enum";
import { formatTimestamp } from "@packages/utils";

/* 
  Upsert Queries
*/

// New objectid -> insert (import_date stays fixed at first import).
// Existing objectid -> overwrite street/address/coords, touch update_date,
// and reactivate it (is_active = 1) in case it had been soft-deleted.
const upsertStationStatement = db.prepare(`
  INSERT INTO stations (objectid, street, raw_address, lat, lon, import_date, update_date, is_active)
  VALUES (@objectid, @street, @rawAddress, @lat, @lon, @now, @now, 1)
  ON CONFLICT(objectid) DO UPDATE SET
    street = excluded.street,
    raw_address = excluded.raw_address,
    lat = excluded.lat,
    lon = excluded.lon,
    update_date = excluded.update_date,
    is_active = 1
`);

// Deactivate any currently-active station whose objectid was NOT part of this run's fetch.
const deactivateMissingStationsStatement = db.prepare(`
  UPDATE stations
  SET is_active = 0
  WHERE is_active = 1
    AND objectid NOT IN (SELECT value FROM json_each(@objectidsJson))
`);

// All rows commit as one atomic unit instead of one write per station.
const upsertStationsTransaction = db.transaction((a_Stations: IStation[], a_Now: string) => {
  for (const station of a_Stations) {
    upsertStationStatement.run({
      objectid: station.attributes.objectid,
      street: parseStreetFromAddress(station.attributes.adresse),
      rawAddress: station.attributes.adresse,
      // geometry.y is latitude, geometry.x is longitude.
      lat: station.geometry.y,
      lon: station.geometry.x,
      now: a_Now,
    });
  }

  const objectidsJson = JSON.stringify(a_Stations.map((s) => s.attributes.objectid));
  const { changes } = deactivateMissingStationsStatement.run({ objectidsJson });
  return { deactivated: changes };
});

export const upsertStations = (a_Stations: IStation[]): IUpsertStationsResult => {
  const validStations: IStation[] = [];

  for (const station of a_Stations) {
    if (isValidStation(station)) {
      validStations.push(station);
    } else {
      backend_log(
        `[upsertStations] Skipping malformed station: ${JSON.stringify(station)}`,
        ELogType.warn,
      );
    }
  }

  const { deactivated } = upsertStationsTransaction(validStations, formatTimestamp());
  return { upserted: validStations.length, skipped: a_Stations.length - validStations.length, deactivated };
};

/* 
  Sync Queries
*/
const insertSyncRunStatement = db.prepare(`
  INSERT INTO sync_runs (started_at, status, records_fetched, records_upserted, records_deactivated)
  VALUES (@startedAt, 'running', 0, 0, 0)
`);

const completeSyncRunStatement = db.prepare(`
  UPDATE sync_runs
  SET finished_at = @finishedAt,
      status = @status,
      records_fetched = @recordsFetched,
      records_upserted = @recordsUpserted,
      records_deactivated = @recordsDeactivated,
      error = @error
  WHERE id = @id
`);

// Inserts a "running" row and returns its id, so the caller can update the
// same row once the sync finishes (or fails).
export const startSyncRun = (): number => {
  const { lastInsertRowid } = insertSyncRunStatement.run({ startedAt: formatTimestamp() });
  return Number(lastInsertRowid);
};

export const completeSyncRun = (a_Input: ISyncRunInput): void => {
  completeSyncRunStatement.run({
    id: a_Input.id,
    finishedAt: formatTimestamp(),
    status: a_Input.status,
    recordsFetched: a_Input.recordsFetched,
    recordsUpserted: a_Input.recordsUpserted,
    recordsDeactivated: a_Input.recordsDeactivated,
    error: a_Input.error ?? null,
  });
};

/*
  Sync Meta Queries
*/
const SYNC_RUN_SELECT_COLUMNS = `
  id,
  started_at AS startedAt,
  finished_at AS finishedAt,
  status,
  records_fetched AS recordsFetched,
  records_upserted AS recordsUpserted,
  records_deactivated AS recordsDeactivated,
  error
`;

const getLatestSyncRunStatement = db.prepare(`
  SELECT ${SYNC_RUN_SELECT_COLUMNS}
  FROM sync_runs
  ORDER BY id DESC
  LIMIT 1
`);

const getLastSuccessfulSyncRunStatement = db.prepare(`
  SELECT ${SYNC_RUN_SELECT_COLUMNS}
  FROM sync_runs
  WHERE status = 'success'
  ORDER BY id DESC
  LIMIT 1
`);

export const getSyncMeta = (): ISyncMeta => {
  const latest = (getLatestSyncRunStatement.get() as ISyncRun | undefined) ?? null;
  const lastSuccess = (getLastSuccessfulSyncRunStatement.get() as ISyncRun | undefined) ?? null;
  return { latest, lastSuccess };
};

/*
  Stations List Query
*/

const DISTANCE_EXPRESSION = "haversine_km(@lat, @lon, lat, lon)";

export const getStations = (a_Params: IStationsQueryParams): IStationResult[] => {
  const hasCenter = a_Params.lat !== undefined && a_Params.lon !== undefined;

  const whereClauses = ["is_active = 1"];
  if (a_Params.search !== undefined) {
    whereClauses.push("lower_unicode(street) LIKE lower_unicode('%' || @search || '%')");
  }
  if (a_Params.radius !== undefined) {
    whereClauses.push(`${DISTANCE_EXPRESSION} <= @radius`);
  }

  const orderBy =
    a_Params.sortBy === "distance"
      ? `ORDER BY distance ${a_Params.sortDir === "desc" ? "DESC" : "ASC"}`
      : `ORDER BY german_sort_key(street) ${a_Params.sortDir === "desc" ? "DESC" : "ASC"}`;

  const sql = `
    SELECT
      objectid,
      street,
      raw_address AS rawAddress,
      lat,
      lon,
      ${hasCenter ? `${DISTANCE_EXPRESSION} AS distance` : "NULL AS distance"}
    FROM stations
    WHERE ${whereClauses.join(" AND ")}
    ${orderBy}
  `;

  const rows = db.prepare(sql).all({
    lat: a_Params.lat ?? null,
    lon: a_Params.lon ?? null,
    search: a_Params.search ?? null,
    radius: a_Params.radius ?? null,
  }) as (IStationResult & { distance: number | null })[];

  return rows.map(({ objectid, street, rawAddress, lat, lon, distance }) =>
    distance === null
      ? { objectid, street, rawAddress, lat, lon }
      : { objectid, street, rawAddress, lat, lon, distance },
  );
};