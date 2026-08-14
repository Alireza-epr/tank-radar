import { describe, it, expect, beforeEach } from "@jest/globals";
import { useStationStore } from "@/store/stationStore";

const RESET_STATE = {
  stations: [],
  filters: {},
  selectedStationId: null,
};

describe("useStationStore", () => {
  beforeEach(() => {
    useStationStore.setState(RESET_STATE);
  });

  it("sets_stations_directly", () => {
    const station = {
      objectid: 1,
      street: "Ring",
      rawAddress: "Ring 1",
      lat: 1,
      lon: 2,
    };
    useStationStore.getState().setStations([station]);

    expect(useStationStore.getState().stations).toEqual([station]);
  });

  it("accepts_a_functional_update_based_on_the_previous_value", () => {
    const station = {
      objectid: 1,
      street: "Ring",
      rawAddress: "Ring 1",
      lat: 1,
      lon: 2,
    };
    useStationStore.getState().setStations([station]);

    useStationStore
      .getState()
      .setStations((prev) => [...prev, { ...station, objectid: 2 }]);

    expect(useStationStore.getState().stations).toHaveLength(2);
  });

  it("sets_filters_directly", () => {
    useStationStore
      .getState()
      .setFilters({ search: "Ring", sortBy: "street", sortDir: "asc" });

    expect(useStationStore.getState().filters).toEqual({
      search: "Ring",
      sortBy: "street",
      sortDir: "asc",
    });
  });

  it("sets_and_clears_the_selected_station_id", () => {
    useStationStore.getState().setSelectedStationId(1);
    expect(useStationStore.getState().selectedStationId).toBe(1);

    useStationStore
      .getState()
      .setSelectedStationId((prev) => (prev === 1 ? null : prev));
    expect(useStationStore.getState().selectedStationId).toBeNull();
  });
});
