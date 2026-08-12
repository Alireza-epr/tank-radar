import { db } from "@/db/config";
import { IStation, IUpsertStationsResult } from "@/types";
import { isValidStation, parseStreetFromAddress } from "@/utils/apiUtils";
import { backend_log } from "@/utils/generalUtils";
import { ELogType } from "@packages/enum";
import { formatTimestamp } from "@packages/utils";

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
