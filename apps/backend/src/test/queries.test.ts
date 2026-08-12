import { describe, it, expect, beforeEach } from "@jest/globals";
import fixture from "./fixtures/stationsQueryResponse.json";
import type { IStation } from "@/types";

// Must be set BEFORE @/db/config so this test suite runs against throwaway in-memory
// SQLite database instead of the real dev database file.
process.env.DB_PATH = ":memory:";

import { db } from "@/db/config";
import { upsertStations } from "@/db/queries";

const stations = fixture.features as IStation[];

interface IStationRow {
  objectid: number;
  is_active: number;
  import_date: string;
  update_date: string;
}

const activeCount = () =>
  (db.prepare("SELECT COUNT(*) AS n FROM stations WHERE is_active = 1").get() as { n: number }).n;

const totalCount = () =>
  (db.prepare("SELECT COUNT(*) AS n FROM stations").get() as { n: number }).n;

const getStation = (a_Objectid: number) =>
  db.prepare("SELECT * FROM stations WHERE objectid = ?").get(a_Objectid) as
    | IStationRow
    | undefined;

describe("upsertStations", () => {
  beforeEach(() => {
    db.exec("DELETE FROM stations");
  });

  it("inserts_every_station_on_a_fresh_sync", () => {
    const result = upsertStations(stations);

    expect(result).toEqual({ upserted: stations.length, skipped: 0, deactivated: 0 });
    expect(activeCount()).toBe(stations.length);
  });

  it("keeps_import_date_fixed_and_advances_update_date_on_a_repeat_sync", () => {
    upsertStations(stations);
    const before = getStation(98);
    expect(before).toBeDefined();

    upsertStations(stations);
    const after = getStation(98);

    expect(after?.import_date).toBe(before?.import_date);
    expect(after && before && after.update_date >= before.update_date).toBe(true);
  });

  it("deactivates_a_station_missing_from_the_latest_fetch_even_run_back_to_back", () => {
    upsertStations(stations);

    const withoutStation98 = stations.filter((s) => s.attributes.objectid !== 98);
    const result = upsertStations(withoutStation98);

    expect(result).toEqual({ upserted: withoutStation98.length, skipped: 0, deactivated: 1 });
    expect(getStation(98)?.is_active).toBe(0);
    expect(activeCount()).toBe(stations.length - 1);
  });

  it("reactivates_a_station_that_reappears_in_a_later_fetch", () => {
    upsertStations(stations);
    upsertStations(stations.filter((s) => s.attributes.objectid !== 98));

    const result = upsertStations(stations);

    expect(result.deactivated).toBe(0);
    expect(getStation(98)?.is_active).toBe(1);
    expect(activeCount()).toBe(stations.length);
  });

  it("skips_a_station_missing_adresse_without_affecting_the_rest_of_the_batch", () => {
    const badStation = {
      attributes: { objectid: 9999 },
      geometry: { x: 6.9, y: 50.9 },
    } as unknown as IStation;

    const result = upsertStations([stations[0]!, badStation]);

    expect(result).toEqual({ upserted: 1, skipped: 1, deactivated: 0 });
    expect(getStation(stations[0]!.attributes.objectid)).toBeDefined();
    expect(getStation(9999)).toBeUndefined();
  });

  it("skips_a_station_missing_objectid_instead_of_inserting_a_phantom_row", () => {
    const badStation = {
      attributes: { adresse: "Ghost St. 1 (00000 Nowhere)" },
      geometry: { x: 6.9, y: 50.9 },
    } as unknown as IStation;

    const result = upsertStations([badStation]);

    expect(result).toEqual({ upserted: 0, skipped: 1, deactivated: 0 });
    expect(totalCount()).toBe(0);
  });

  it("skips_a_station_with_non_numeric_coordinates", () => {
    const badStation = {
      attributes: { objectid: 9998, adresse: "Bad Coords St. 1 (00000 Nowhere)" },
      geometry: { x: "not-a-number", y: 50.9 },
    } as unknown as IStation;

    const result = upsertStations([badStation]);

    expect(result).toEqual({ upserted: 0, skipped: 1, deactivated: 0 });
    expect(totalCount()).toBe(0);
  });
});
