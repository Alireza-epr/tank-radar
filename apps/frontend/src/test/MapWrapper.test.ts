import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { mount, flushPromises, type VueWrapper } from "@vue/test-utils";
import {
  Map as MockMap,
  Marker as MockMarker,
  mockAddControl,
  mockRemove,
  mockMarkerRemove,
  mockSetLngLat,
  mockMarkerAddTo,
  mockOn,
  mockCanvasStyle,
  triggerMapClick,
} from "@/test/maplibreMock";
import MapWrapper from "@/components/MapWrapper.vue";
import { useStationStore } from "@/store/stationStore";
import { useMapStore } from "@/store/mapStore";

const STATION_A = { objectid: 1, street: "Ring", rawAddress: "Ring 1", lat: 50.9, lon: 6.9 };
const STATION_B = { objectid: 2, street: "Bahnhof", rawAddress: "Bahnhof 2", lat: 50.94, lon: 6.96 };
const RESET_STATION_STATE = { stations: [], filters: {} };
const RESET_MAP_STATE = { centerPoint: null, isPickingCenter: false };

describe("MapWrapper", () => {
  let wrapper: VueWrapper | undefined;

  beforeEach(() => {
    MockMap.mockClear();
    MockMarker.mockClear();
    mockRemove.mockClear();
    mockAddControl.mockClear();
    mockMarkerRemove.mockClear();
    mockSetLngLat.mockClear();
    mockMarkerAddTo.mockClear();
    mockOn.mockClear();
    mockCanvasStyle.cursor = "";
    useStationStore.setState(RESET_STATION_STATE);
    useMapStore.setState(RESET_MAP_STATE);
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
  });

  it("creates_a_map_centered_on_köln_on_mount", () => {
    wrapper = mount(MapWrapper);

    expect(MockMap).toHaveBeenCalledTimes(1);
    const options = MockMap.mock.calls[0]?.[0] as { center: [number, number]; zoom: number };
    expect(options.center).toEqual([6.9603, 50.9375]);
    expect(mockAddControl).toHaveBeenCalledTimes(1);
  });

  it("removes_the_map_on_unmount", () => {
    wrapper = mount(MapWrapper);
    wrapper.unmount();

    expect(mockRemove).toHaveBeenCalledTimes(1);
  });

  it("plots_a_marker_per_station_already_in_the_store_on_mount", () => {
    useStationStore.setState({ ...RESET_STATION_STATE, stations: [STATION_A, STATION_B] });

    wrapper = mount(MapWrapper);

    expect(MockMarker).toHaveBeenCalledTimes(2);
    expect(MockMarker).toHaveBeenNthCalledWith(1, expect.objectContaining({ element: expect.any(HTMLElement) }));
    expect(MockMarker).toHaveBeenNthCalledWith(2, expect.objectContaining({ element: expect.any(HTMLElement) }));
    expect(mockSetLngLat).toHaveBeenCalledWith([STATION_A.lon, STATION_A.lat]);
    expect(mockSetLngLat).toHaveBeenCalledWith([STATION_B.lon, STATION_B.lat]);
    expect(mockMarkerAddTo).toHaveBeenCalledTimes(2);
  });

  it("replots_markers_when_the_store's_stations_change", async () => {
    wrapper = mount(MapWrapper);
    expect(MockMarker).not.toHaveBeenCalled();

    useStationStore.getState().setStations([STATION_A]);
    await flushPromises();

    expect(MockMarker).toHaveBeenCalledTimes(1);

    useStationStore.getState().setStations([STATION_A, STATION_B]);
    await flushPromises();

    // Previous markers are cleared before the new set is drawn.
    expect(mockMarkerRemove).toHaveBeenCalledTimes(1);
    expect(MockMarker).toHaveBeenCalledTimes(3);
  });

  it("removes_all_markers_on_unmount", () => {
    useStationStore.setState({ ...RESET_STATION_STATE, stations: [STATION_A] });
    wrapper = mount(MapWrapper);

    wrapper.unmount();

    expect(mockMarkerRemove).toHaveBeenCalled();
  });

  it("ignores_map_clicks_when_not_in_picking_mode", () => {
    wrapper = mount(MapWrapper);

    triggerMapClick({ lat: 50.9, lng: 6.9 });

    expect(useMapStore.getState().centerPoint).toBeNull();
  });

  it("sets_the_center_point_and_leaves_picking_mode_on_a_map_click_while_picking", () => {
    useMapStore.setState({ ...RESET_MAP_STATE, isPickingCenter: true });
    wrapper = mount(MapWrapper);

    triggerMapClick({ lat: 50.91, lng: 6.92 });

    expect(useMapStore.getState().centerPoint).toEqual({ lat: 50.91, lon: 6.92 });
    expect(useMapStore.getState().isPickingCenter).toBe(false);
  });

  it("shows_a_crosshair_cursor_while_in_picking_mode", async () => {
    wrapper = mount(MapWrapper);
    expect(mockCanvasStyle.cursor).toBe("");

    useMapStore.getState().setIsPickingCenter(true);
    await flushPromises();
    expect(mockCanvasStyle.cursor).toBe("crosshair");

    useMapStore.getState().setIsPickingCenter(false);
    await flushPromises();
    expect(mockCanvasStyle.cursor).toBe("");
  });

  it("plots_a_distinct_marker_for_the_picked_center_point", async () => {
    wrapper = mount(MapWrapper);
    expect(MockMarker).not.toHaveBeenCalled();

    useMapStore.getState().setCenterPoint({ lat: 50.9375, lon: 6.9603 });
    await flushPromises();

    expect(MockMarker).toHaveBeenCalledTimes(1);
    expect(MockMarker).toHaveBeenCalledWith(expect.objectContaining({ element: expect.any(HTMLElement) }));
    expect(mockSetLngLat).toHaveBeenCalledWith([6.9603, 50.9375]);

    useMapStore.getState().setCenterPoint(null);
    await flushPromises();
    expect(mockMarkerRemove).toHaveBeenCalledTimes(1);
  });
});
