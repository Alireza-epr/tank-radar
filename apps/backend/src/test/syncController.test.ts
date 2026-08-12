import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import type { Request, Response } from "express";

jest.mock("@/sync/runSync", () => ({
  runSync: jest.fn(),
}));
jest.mock("@/db/queries", () => ({
  getSyncMeta: jest.fn(),
}));

import { runSync } from "@/sync/runSync";
import { getSyncMeta } from "@/db/queries";
import { syncController, syncMetaController } from "@/modules/sync/sync.controller";

const mockedRunSync = runSync as jest.MockedFunction<typeof runSync>;
const mockedGetSyncMeta = getSyncMeta as jest.MockedFunction<typeof getSyncMeta>;

const createMockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res) as unknown as Response["status"];
  res.json = jest.fn().mockReturnValue(res) as unknown as Response["json"];
  return res;
};

describe("syncController", () => {
  beforeEach(() => {
    mockedRunSync.mockReset();
  });

  it("responds_200_with_the_sync_result_when_the_sync_succeeds", async () => {
    mockedRunSync.mockResolvedValue({
      id: 1,
      status: "success",
      recordsFetched: 122,
      recordsUpserted: 122,
      recordsDeactivated: 0,
    });
    const res = createMockResponse();

    await syncController({} as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("responds_503_with_the_error_when_the_sync_fails", async () => {
    mockedRunSync.mockResolvedValue({
      id: 2,
      status: "failed",
      recordsFetched: 0,
      recordsUpserted: 0,
      recordsDeactivated: 0,
      error: "Failed to fetch stations from source API",
    });
    const res = createMockResponse();

    await syncController({} as Request, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: ["Failed to fetch stations from source API"],
      }),
    );
  });
});

describe("syncMetaController", () => {
  beforeEach(() => {
    mockedGetSyncMeta.mockReset();
  });

  it("responds_200_with_latest_and_lastSuccess", () => {
    const meta = {
      latest: { id: 2, status: "failed" as const, startedAt: "t1", finishedAt: "t2", recordsFetched: 0, recordsUpserted: 0, recordsDeactivated: 0, error: "network down" },
      lastSuccess: { id: 1, status: "success" as const, startedAt: "t0", finishedAt: "t0b", recordsFetched: 122, recordsUpserted: 122, recordsDeactivated: 0, error: null },
    };
    mockedGetSyncMeta.mockReturnValue(meta);
    const res = createMockResponse();

    syncMetaController({} as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, entries: [meta] }),
    );
  });

  it("responds_200_with_nulls_when_no_sync_has_ever_run", () => {
    mockedGetSyncMeta.mockReturnValue({ latest: null, lastSuccess: null });
    const res = createMockResponse();

    syncMetaController({} as Request, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ entries: [{ latest: null, lastSuccess: null }] }),
    );
  });
});
