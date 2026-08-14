import { describe, it, expect, jest, beforeEach } from "@jest/globals";

jest.mock("@/utils/apiUtils", () => ({
  useStationsAPI: jest.fn(),
}));
jest.mock("@/db/queries", () => ({
  upsertStations: jest.fn(),
  startSyncRun: jest.fn(),
  completeSyncRun: jest.fn(),
}));
jest.mock("@/utils/generalUtils", () => ({
  backend_log: jest.fn(),
}));

import { useStationsAPI } from "@/utils/apiUtils";
import { upsertStations, startSyncRun, completeSyncRun } from "@/db/queries";
import { runSync } from "@/sync/runSync";
import type { IStation } from "@/types";

const mockedUseStationsAPI = useStationsAPI as jest.MockedFunction<
  typeof useStationsAPI
>;
const mockedUpsertStations = upsertStations as jest.MockedFunction<
  typeof upsertStations
>;
const mockedStartSyncRun = startSyncRun as jest.MockedFunction<
  typeof startSyncRun
>;
const mockedCompleteSyncRun = completeSyncRun as jest.MockedFunction<
  typeof completeSyncRun
>;

const sampleStations: IStation[] = [
  {
    attributes: { objectid: 1, adresse: "Test Str. 1 (12345 Testort)" },
    geometry: { x: 6.9, y: 50.9 },
  },
];

describe("runSync", () => {
  beforeEach(() => {
    mockedUseStationsAPI.mockReset();
    mockedUpsertStations.mockReset();
    mockedStartSyncRun.mockReset();
    mockedCompleteSyncRun.mockReset();
    mockedStartSyncRun.mockReturnValue(42);
  });

  it("returns_a_success_result_and_completes_the_run_when_fetch_and_upsert_succeed", async () => {
    mockedUseStationsAPI.mockResolvedValue(sampleStations);
    mockedUpsertStations.mockReturnValue({
      upserted: 1,
      skipped: 0,
      deactivated: 0,
    });

    const result = await runSync();

    expect(result).toEqual({
      id: 42,
      status: "success",
      recordsFetched: 1,
      recordsUpserted: 1,
      recordsDeactivated: 0,
    });
    expect(mockedCompleteSyncRun).toHaveBeenCalledWith(result);
  });

  it("returns_a_failed_result_when_the_fetch_returns_undefined", async () => {
    mockedUseStationsAPI.mockResolvedValue(undefined);

    const result = await runSync();

    expect(result).toEqual({
      id: 42,
      status: "failed",
      recordsFetched: 0,
      recordsUpserted: 0,
      recordsDeactivated: 0,
      error: "Failed to fetch stations from source API",
    });
    expect(mockedUpsertStations).not.toHaveBeenCalled();
  });

  it("returns_a_failed_result_and_still_completes_the_run_if_upsertStations_throws", async () => {
    mockedUseStationsAPI.mockResolvedValue(sampleStations);
    mockedUpsertStations.mockImplementation(() => {
      throw new Error("db exploded");
    });

    const result = await runSync();

    expect(result.status).toBe("failed");
    expect(result.error).toContain("db exploded");
    expect(mockedCompleteSyncRun).toHaveBeenCalledTimes(1);
  });
});
