import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import type { Request, Response } from "express";

jest.mock("@/db/queries", () => ({
  getStations: jest.fn(),
}));

import { getStations } from "@/db/queries";
import { stationsController } from "@/modules/stations/stations.controller";

const mockedGetStations = getStations as jest.MockedFunction<
  typeof getStations
>;

const createMockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res) as unknown as Response["status"];
  res.json = jest.fn().mockReturnValue(res) as unknown as Response["json"];
  return res;
};

const createMockRequest = (query: Record<string, unknown>) =>
  ({ query }) as unknown as Request;

describe("stationsController", () => {
  beforeEach(() => {
    mockedGetStations.mockReset();
  });

  it("responds_200_with_the_station_list_for_a_valid_query", () => {
    const stations = [
      {
        objectid: 98,
        street: "Bonner Str. 98",
        rawAddress: "Bonner Str. 98 (50677 Neustadt/Süd)",
        lat: 50.9,
        lon: 6.9,
      },
    ];
    mockedGetStations.mockReturnValue(stations);
    const res = createMockResponse();

    stationsController(createMockRequest({}), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, entries: stations }),
    );
  });

  it("passes_the_parsed_query_through_to_getStations", () => {
    mockedGetStations.mockReturnValue([]);
    const res = createMockResponse();

    stationsController(
      createMockRequest({ lat: "50.9", lon: "6.9", radius: "5" }),
      res,
    );

    expect(mockedGetStations).toHaveBeenCalledWith(
      expect.objectContaining({ lat: 50.9, lon: 6.9, radius: 5 }),
    );
  });

  it("responds_400_with_a_validation_error_and_never_calls_getStations", () => {
    const res = createMockResponse();

    stationsController(createMockRequest({ lat: "999" }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
    );
    expect(mockedGetStations).not.toHaveBeenCalled();
  });
});
