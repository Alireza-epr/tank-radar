import { describe, it, expect, beforeEach } from "@jest/globals";
import fixture from "./fixtures/stationsQueryResponse.json";
import type { IStation } from "@/types";

// Must be set BEFORE @/db/config so this test suite runs against throwaway in-memory
// SQLite database instead of the real dev database file.
process.env.DB_PATH = ":memory:";

import { db } from "@/db/config";
import {
  upsertStations,
  startSyncRun,
  completeSyncRun,
  getSyncMeta,
  getStations,
} from "@/db/queries";

const stations = fixture.features as IStation[];

interface IStationRow {
  objectid: number;
  is_active: number;
  import_date: string;
  update_date: string;
}

const activeCount = () =>
  (
    db
      .prepare("SELECT COUNT(*) AS n FROM stations WHERE is_active = 1")
      .get() as { n: number }
  ).n;

const totalCount = () =>
  (db.prepare("SELECT COUNT(*) AS n FROM stations").get() as { n: number }).n;

const getStation = (a_Objectid: number) =>
  db.prepare("SELECT * FROM stations WHERE objectid = ?").get(a_Objectid) as
    IStationRow | undefined;

describe("upsertStations", () => {
  beforeEach(() => {
    db.exec("DELETE FROM stations");
  });

  it("inserts_every_station_on_a_fresh_sync", () => {
    const result = upsertStations(stations);

    expect(result).toEqual({
      upserted: stations.length,
      skipped: 0,
      deactivated: 0,
    });
    expect(activeCount()).toBe(stations.length);
  });

  it("keeps_import_date_fixed_and_advances_update_date_on_a_repeat_sync", () => {
    upsertStations(stations);
    const before = getStation(98);
    expect(before).toBeDefined();

    upsertStations(stations);
    const after = getStation(98);

    expect(after?.import_date).toBe(before?.import_date);
    expect(after && before && after.update_date >= before.update_date).toBe(
      true,
    );
  });

  it("deactivates_a_station_missing_from_the_latest_fetch_even_run_back_to_back", () => {
    upsertStations(stations);

    const withoutStation98 = stations.filter(
      (s) => s.attributes.objectid !== 98,
    );
    const result = upsertStations(withoutStation98);

    expect(result).toEqual({
      upserted: withoutStation98.length,
      skipped: 0,
      deactivated: 1,
    });
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
      attributes: {
        objectid: 9998,
        adresse: "Bad Coords St. 1 (00000 Nowhere)",
      },
      geometry: { x: "not-a-number", y: 50.9 },
    } as unknown as IStation;

    const result = upsertStations([badStation]);

    expect(result).toEqual({ upserted: 0, skipped: 1, deactivated: 0 });
    expect(totalCount()).toBe(0);
  });
});

describe("getSyncMeta", () => {
  beforeEach(() => {
    db.exec("DELETE FROM sync_runs");
  });

  it("returns_null_for_both_when_no_sync_has_ever_run", () => {
    expect(getSyncMeta()).toEqual({ latest: null, lastSuccess: null });
  });

  it("reports_status_running_for_a_row_that_was_started_but_never_completed", () => {
    startSyncRun();

    const meta = getSyncMeta();

    expect(meta.latest?.status).toBe("running");
    expect(meta.latest?.finishedAt).toBeNull();
    expect(meta.lastSuccess).toBeNull();
  });

  it("returns_the_same_run_as_both_latest_and_lastSuccess_when_it_succeeded", () => {
    const id = startSyncRun();
    completeSyncRun({
      id,
      status: "success",
      recordsFetched: 122,
      recordsUpserted: 122,
      recordsDeactivated: 0,
    });

    const meta = getSyncMeta();

    expect(meta.latest?.id).toBe(id);
    expect(meta.latest?.status).toBe("success");
    expect(meta.lastSuccess?.id).toBe(id);
  });

  it("returns_null_lastSuccess_when_the_only_run_failed", () => {
    const id = startSyncRun();
    completeSyncRun({
      id,
      status: "failed",
      recordsFetched: 0,
      recordsUpserted: 0,
      recordsDeactivated: 0,
      error: "network down",
    });

    const meta = getSyncMeta();

    expect(meta.latest?.status).toBe("failed");
    expect(meta.latest?.error).toBe("network down");
    expect(meta.lastSuccess).toBeNull();
  });

  it("keeps_lastSuccess_pointing_at_an_earlier_run_when_the_most_recent_one_failed", () => {
    const successId = startSyncRun();
    completeSyncRun({
      id: successId,
      status: "success",
      recordsFetched: 122,
      recordsUpserted: 122,
      recordsDeactivated: 0,
    });

    const failedId = startSyncRun();
    completeSyncRun({
      id: failedId,
      status: "failed",
      recordsFetched: 0,
      recordsUpserted: 0,
      recordsDeactivated: 0,
      error: "network down",
    });

    const meta = getSyncMeta();

    expect(meta.latest?.id).toBe(failedId);
    expect(meta.latest?.status).toBe("failed");
    expect(meta.lastSuccess?.id).toBe(successId);
    expect(meta.lastSuccess?.status).toBe("success");
  });
});

describe("getStations", () => {
  beforeEach(() => {
    db.exec("DELETE FROM stations");
    upsertStations(stations);
  });

  it("returns_every_active_station_when_no_filters_are_given", () => {
    const result = getStations({});
    expect(result).toHaveLength(stations.length);
  });

  it("excludes_deactivated_stations", () => {
    db.prepare("UPDATE stations SET is_active = 0 WHERE objectid = 98").run();
    const result = getStations({});
    expect(result.find((s) => s.objectid === 98)).toBeUndefined();
    expect(result).toHaveLength(stations.length - 1);
  });

  it("omits_the_distance_field_entirely_when_no_search_center_is_given", () => {
    const result = getStations({});
    expect(result[0]).not.toHaveProperty("distance");
  });

  it("includes_a_numeric_distance_field_when_lat_lon_are_given", () => {
    const result = getStations({ lat: 50.9, lon: 6.9 });
    expect(typeof result[0]?.distance).toBe("number");
  });

  it("sorts_by_street_ascending_by_default", () => {
    const result = getStations({});
    const streets = result.map((s) => s.street);
    expect(streets).toEqual(
      [...streets].sort((a, b) => a.localeCompare(b, "de")),
    );
  });

  it("sorts_by_street_descending_when_requested", () => {
    const result = getStations({ sortBy: "street", sortDir: "desc" });
    const streets = result.map((s) => s.street);
    const sortedDesc = [...streets].sort((a, b) => b.localeCompare(a, "de"));
    expect(streets).toEqual(sortedDesc);
  });

  it("sorts_by_distance_ascending_from_a_given_center", () => {
    // Objectid 98's own coordinates - it should come back first (distance 0).
    const result = getStations({
      lat: 50.916095041454554,
      lon: 6.960644911005172,
      sortBy: "distance",
    });
    expect(result[0]?.objectid).toBe(98);
    const distances = result.map((s) => s.distance ?? 0);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
  });

  it("filters_by_radius_and_every_result_is_actually_within_it", () => {
    const center = { lat: 50.916095041454554, lon: 6.960644911005172 };
    const result = getStations({ ...center, radius: 2 });

    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThan(stations.length);
    for (const station of result) {
      expect(station.distance).toBeLessThanOrEqual(2);
    }
  });

  it("finds_a_street_case_insensitively_including_german_umlauts", () => {
    // objectid 99 is "Hülchrather Str. 17" - search in uppercase, with the umlaut uppercased too.
    const result = getStations({ search: "HÜLCHRATHER" });
    expect(result).toHaveLength(1);
    expect(result[0]?.objectid).toBe(99);
  });

  it("finds_a_street_by_partial_match", () => {
    const result = getStations({ search: "onner" }); // mid-word match on "Bonner"
    expect(result.some((s) => s.objectid === 98)).toBe(true);
  });

  it("returns_an_empty_array_for_a_search_with_no_matches", () => {
    expect(getStations({ search: "ZzNoSuchStreetZz" })).toEqual([]);
  });

  it("combines_search_radius_and_sort_together", () => {
    const center = { lat: 50.916095041454554, lon: 6.960644911005172 };
    const result = getStations({
      ...center,
      radius: 10,
      search: "Str",
      sortBy: "distance",
      sortDir: "asc",
    });

    for (const station of result) {
      expect(station.street.toLowerCase()).toContain("str");
      expect(station.distance).toBeLessThanOrEqual(10);
    }
    const distances = result.map((s) => s.distance ?? 0);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
  });
});
