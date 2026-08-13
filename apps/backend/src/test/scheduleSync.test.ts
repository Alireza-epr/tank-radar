import { describe, it, expect, jest, beforeEach } from "@jest/globals";

jest.mock("node-cron", () => ({
  schedule: jest.fn(),
  validate: jest.fn(() => true),
}));
jest.mock("@/sync/runSync", () => ({
  runSync: jest.fn(),
}));

import { schedule } from "node-cron";
import { runSync } from "@/sync/runSync";
import { scheduleSync } from "@/sync/scheduleSync";
import { env } from "@/core/config";

const mockedSchedule = schedule as jest.MockedFunction<typeof schedule>;
const mockedRunSync = runSync as jest.MockedFunction<typeof runSync>;

describe("scheduleSync", () => {
  beforeEach(() => {
    mockedSchedule.mockReset();
    mockedRunSync.mockReset();
  });

  it("runs_a_sync_immediately_on_startup", () => {
    scheduleSync();
    expect(mockedRunSync).toHaveBeenCalledTimes(1);
  });

  it("schedules_recurring_syncs_using_the_configured_cron_expression", () => {
    scheduleSync();

    expect(mockedSchedule).toHaveBeenCalledTimes(1);
    expect(mockedSchedule).toHaveBeenCalledWith(env.syncCronSchedule, expect.any(Function));
  });

  it("calls_runSync_again_when_the_scheduled_callback_fires", () => {
    scheduleSync();
    mockedRunSync.mockClear(); // discard the immediate startup call

    const scheduledCallback = mockedSchedule.mock.calls[0]?.[1] as () => void;
    scheduledCallback();

    expect(mockedRunSync).toHaveBeenCalledTimes(1);
  });
});
