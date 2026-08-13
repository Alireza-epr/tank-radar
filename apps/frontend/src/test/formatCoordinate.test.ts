import { describe, it, expect } from "@jest/globals";
import { formatCoordinate } from "@packages/utils";

describe("formatCoordinate", () => {
  it("rounds_to_2_decimals_by_default", () => {
    expect(formatCoordinate(50.9375)).toBe("50.94");
    expect(formatCoordinate(6.9603)).toBe("6.96");
  });

  it("accepts_a_custom_decimal_count", () => {
    expect(formatCoordinate(50.9375, 4)).toBe("50.9375");
    expect(formatCoordinate(50.9375, 0)).toBe("51");
  });

  it("pads_with_trailing_zeros_when_needed", () => {
    expect(formatCoordinate(50, 2)).toBe("50.00");
  });
});
