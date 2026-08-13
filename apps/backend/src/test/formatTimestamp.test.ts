import { describe, it, expect } from "@jest/globals";
import { formatTimestamp } from "@packages/utils";

describe("formatTimestamp", () => {
  it("formats_a_given_date_as_real_iso_8601_utc", () => {
    const date = new Date(Date.UTC(2026, 7, 13, 10, 34, 49, 483));
    expect(formatTimestamp(date)).toBe("2026-08-13T10:34:49.483Z");
  });

  it("defaults_to_the_current_time_when_no_date_is_given", () => {
    const before = Date.now();
    const formatted = formatTimestamp();
    const after = Date.now();

    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    const parsed = new Date(formatted).getTime();
    expect(parsed).toBeGreaterThanOrEqual(before);
    expect(parsed).toBeLessThanOrEqual(after);
  });
});
