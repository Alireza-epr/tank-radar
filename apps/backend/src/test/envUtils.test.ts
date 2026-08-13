import { describe, it, expect } from "@jest/globals";
import { parseSyncCronSchedule, parseCorsOrigin, DEFAULT_ENV } from "@/utils/envUtils";

describe("parseSyncCronSchedule", () => {
  it("accepts_a_valid_cron_expression", () => {
    expect(parseSyncCronSchedule("0 0 * * *")).toBe("0 0 * * *");
  });

  it("falls_back_to_the_default_for_an_invalid_expression", () => {
    expect(parseSyncCronSchedule("not a cron expression")).toBe(DEFAULT_ENV.SYNC_CRON_SCHEDULE);
  });

  it("falls_back_to_the_default_when_undefined", () => {
    expect(parseSyncCronSchedule(undefined)).toBe(DEFAULT_ENV.SYNC_CRON_SCHEDULE);
  });

  it("falls_back_to_the_default_for_an_empty_string", () => {
    expect(parseSyncCronSchedule("")).toBe(DEFAULT_ENV.SYNC_CRON_SCHEDULE);
  });

  it("rejects_a_cron_expression_with_an_out_of_range_field", () => {
    // Minute field only allows 0-59.
    expect(parseSyncCronSchedule("70 * * * *")).toBe(DEFAULT_ENV.SYNC_CRON_SCHEDULE);
  });
});

describe("parseCorsOrigin", () => {
  it("accepts_a_configured_origin", () => {
    expect(parseCorsOrigin("http://example.com")).toBe("http://example.com");
  });

  it("falls_back_to_the_default_when_undefined", () => {
    expect(parseCorsOrigin(undefined)).toBe(DEFAULT_ENV.CORS_ORIGIN);
  });

  it("falls_back_to_the_default_for_an_empty_string", () => {
    expect(parseCorsOrigin("")).toBe(DEFAULT_ENV.CORS_ORIGIN);
  });
});
