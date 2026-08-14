import { describe, it, expect, jest, beforeEach } from "@jest/globals";

jest.mock("@packages/utils", () => ({
  fetchWithRetry: jest.fn(),
  formatTimestamp: jest.fn(() => "2026-01-01 00:00:00.000"),
}));

import { fetchWithRetry } from "@packages/utils";
import { useStationsController } from "@/controllers/stationController";

const mockedFetchWithRetry = fetchWithRetry as jest.MockedFunction<
  typeof fetchWithRetry
>;

const jsonResponse = (a_Body: unknown) =>
  ({ json: () => Promise.resolve(a_Body) }) as Response;

describe("useStationsController", () => {
  beforeEach(() => {
    mockedFetchWithRetry.mockReset();
  });

  it("requests_the_stations_endpoint_as_a_get", async () => {
    mockedFetchWithRetry.mockResolvedValue(
      jsonResponse({ success: true, entries: [], length: 0 }),
    );

    await useStationsController({});

    expect(mockedFetchWithRetry).toHaveBeenCalledTimes(1);
    const [url, init, retries, delay] = mockedFetchWithRetry.mock.calls[0] as [
      string,
      RequestInit,
      number,
      number,
    ];
    expect(url).toContain("/v1/api/stations");
    expect(init).toEqual({ method: "GET" });
    expect(retries).toBe(5);
    expect(delay).toBe(200);
  });

  it("encodes_every_given_filter_into_the_query_string", async () => {
    mockedFetchWithRetry.mockResolvedValue(
      jsonResponse({ success: true, entries: [], length: 0 }),
    );

    await useStationsController({
      lat: 50.9375,
      lon: 6.9603,
      radius: 5,
      search: "Ring",
      sortBy: "distance",
      sortDir: "desc",
    });

    const [url] = mockedFetchWithRetry.mock.calls[0] as [
      string,
      RequestInit,
      number,
      number,
    ];
    expect(url).toContain("lat=50.9375");
    expect(url).toContain("lon=6.9603");
    expect(url).toContain("radius=5");
    expect(url).toContain("search=Ring");
    expect(url).toContain("sortBy=distance");
    expect(url).toContain("sortDir=desc");
  });

  it("omits_unset_filters_from_the_query_string", async () => {
    mockedFetchWithRetry.mockResolvedValue(
      jsonResponse({ success: true, entries: [], length: 0 }),
    );

    await useStationsController({});

    const [url] = mockedFetchWithRetry.mock.calls[0] as [
      string,
      RequestInit,
      number,
      number,
    ];
    expect(url).not.toContain("?");
  });

  it("returns_the_parsed_json_response_on_success", async () => {
    const body = {
      success: true,
      entries: [
        { objectid: 1, street: "Ring", rawAddress: "Ring 1", lat: 1, lon: 2 },
      ],
      length: 1,
    };
    mockedFetchWithRetry.mockResolvedValue(jsonResponse(body));

    const result = await useStationsController({});
    expect(result).toEqual(body);
  });

  it("logs_and_resolves_undefined_when_the_request_fails", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockedFetchWithRetry.mockRejectedValue(new Error("network down"));

    const result = await useStationsController({});
    expect(result).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining("network down"),
    );
    consoleErrorSpy.mockRestore();
  });
});
