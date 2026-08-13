import { describe, it, expect } from "@jest/globals";
import { formatLocalDateTime } from "@packages/utils";

describe("formatLocalDateTime", () => {
  it("converts_a_utc_iso_string_to_the_runtime_locale_and_timezone", () => {
    const utcIso = "2026-08-13T10:34:49.483Z";
    const expected = new Date(utcIso).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "medium",
    });

    expect(formatLocalDateTime(utcIso)).toBe(expected);
  });

  it("accepts_a_date_instance_directly", () => {
    const date = new Date(Date.UTC(2026, 0, 1, 0, 0, 0));
    const expected = date.toLocaleString(undefined, { dateStyle: "short", timeStyle: "medium" });

    expect(formatLocalDateTime(date)).toBe(expected);
  });
});
