import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import fixture from "./fixtures/stationsQueryResponse.json";

jest.mock("@packages/utils", () => {
  const actual = jest.requireActual("@packages/utils") as object;
  return {
    ...actual,
    fetchWithRetry: jest.fn(),
  };
});
jest.mock("@/utils/generalUtils", () => ({
  backend_log: jest.fn(),
}));

import { fetchWithRetry } from "@packages/utils";
import { backend_log } from "@/utils/generalUtils";
import {
  isValidStation,
  parseStreetFromAddress,
  useStationsAPI,
} from "@/utils/apiUtils";
import type { IStation } from "@/types";

const mockedFetchWithRetry = fetchWithRetry as jest.MockedFunction<
  typeof fetchWithRetry
>;
const mockedLog = backend_log as jest.MockedFunction<typeof backend_log>;

describe("parseStreetFromAddress", () => {
  it("extracts_the_street_from_a_normal_address", () => {
    expect(parseStreetFromAddress("Bonner Str. 98 (50677 Neustadt/Süd)")).toBe(
      "Bonner Str. 98",
    );
  });

  it("handles_an_address_with_no_postal_code_parenthesis", () => {
    expect(parseStreetFromAddress("Flughafen/Nordallee")).toBe(
      "Flughafen/Nordallee",
    );
  });

  it("trims_surrounding_whitespace_either_way", () => {
    expect(
      parseStreetFromAddress("  Riehler Str. 12  (50668 Neustadt/Nord)"),
    ).toBe("Riehler Str. 12");
  });

  it("returns_an_empty_string_for_an_empty_address_missing_field", () => {
    expect(parseStreetFromAddress("")).toBe("");
  });
});

describe("isValidStation", () => {
  const validStation: IStation = {
    attributes: {
      objectid: 98,
      adresse: "Bonner Str. 98 (50677 Neustadt/Süd)",
    },
    geometry: { x: 6.960644911005172, y: 50.916095041454554 },
  };

  it("accepts_a_well_formed_station", () => {
    expect(isValidStation(validStation)).toBe(true);
  });

  it("rejects_a_station_with_a_missing_objectid", () => {
    const station = {
      ...validStation,
      attributes: { ...validStation.attributes, objectid: undefined },
    };
    expect(isValidStation(station as unknown as IStation)).toBe(false);
  });

  it("rejects_a_station_with_a_non_integer_objectid", () => {
    const station = {
      ...validStation,
      attributes: { ...validStation.attributes, objectid: 98.5 },
    };
    expect(isValidStation(station)).toBe(false);
  });

  it("rejects_a_station_with_a_missing_adresse", () => {
    const station = {
      ...validStation,
      attributes: { ...validStation.attributes, adresse: undefined },
    };
    expect(isValidStation(station as unknown as IStation)).toBe(false);
  });

  it("rejects_a_station_with_a_blank_adresse", () => {
    const station = {
      ...validStation,
      attributes: { ...validStation.attributes, adresse: "   " },
    };
    expect(isValidStation(station)).toBe(false);
  });

  it("rejects_a_station_with_non_numeric_coordinates", () => {
    const station = {
      ...validStation,
      geometry: { x: "not-a-number", y: 50.9 },
    };
    expect(isValidStation(station as unknown as IStation)).toBe(false);
  });

  it("rejects_a_station_with_NaN_Infinity_coordinates", () => {
    const station = { ...validStation, geometry: { x: Infinity, y: NaN } };
    expect(isValidStation(station)).toBe(false);
  });

  it("rejects_a_station_missing_attributes_or_geometry_entirely", () => {
    expect(isValidStation({} as IStation)).toBe(false);
    expect(
      isValidStation({ attributes: validStation.attributes } as IStation),
    ).toBe(false);
  });
});

describe("useStationsAPI", () => {
  beforeEach(() => {
    mockedFetchWithRetry.mockReset();
    mockedLog.mockReset();
  });

  it("returns_every_parsed_feature_on_a_successful_fetch", async () => {
    mockedFetchWithRetry.mockResolvedValue({
      ok: true,
      json: async () => fixture,
    } as Response);

    const stations = await useStationsAPI();

    expect(stations).toHaveLength(fixture.features.length);
    expect(stations?.[0]).toEqual(fixture.features[0]);
    expect(mockedLog).not.toHaveBeenCalled();
  });

  it("returns_undefined_and_logs_when_the_response_is_not_ok", async () => {
    mockedFetchWithRetry.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response);

    const stations = await useStationsAPI();

    expect(stations).toBeUndefined();
    expect(mockedLog).toHaveBeenCalledTimes(1);
  });

  it("returns_undefined_and_logs_when_fetchWithRetry_rejects_network_retries_exhausted", async () => {
    mockedFetchWithRetry.mockRejectedValue(new Error("network down"));

    const stations = await useStationsAPI();

    expect(stations).toBeUndefined();
    expect(mockedLog).toHaveBeenCalledTimes(1);
  });

  // Malformed response: valid JSON, but the "features" field itself is
  // missing. This does NOT throw - json.features is just `undefined`, so
  // the function returns undefined the same as a network failure, but
  // silently (no log call). Worth having a test lock this behavior in,
  // since it's an easy thing to regress without noticing.
  it("returns_undefined_without_logging_when_features_is_missing_from_the_response", async () => {
    mockedFetchWithRetry.mockResolvedValue({
      ok: true,
      json: async () => ({ displayFieldName: "ADRESSE" }),
    } as Response);

    const stations = await useStationsAPI();

    expect(stations).toBeUndefined();
    expect(mockedLog).not.toHaveBeenCalled();
  });
});
