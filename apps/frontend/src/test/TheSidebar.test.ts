import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { mount, flushPromises } from "@vue/test-utils";

jest.mock("@/controllers/stationController", () => ({
  useStationsController: jest.fn(),
}));

import { useStationsController } from "@/controllers/stationController";
import { useStationStore } from "@/store/stationStore";
import { useAppStore } from "@/store/appStore";
import { useMapStore } from "@/store/mapStore";
import { useUrlStore } from "@/store/urlStore";
import Sidebar from "@/components/TheSidebar.vue";

const mockedUseStationsController = useStationsController as jest.MockedFunction<typeof useStationsController>;

const STATION = { objectid: 1, street: "Ring", rawAddress: "Ring 1 (50667 Köln)", lat: 50.9, lon: 6.9 };

describe("Sidebar", () => {
  beforeEach(() => {
    mockedUseStationsController.mockReset();
    useStationStore.setState({ stations: [], filters: {} });
    useAppStore.setState({ isLoading: false, error: null });
    useMapStore.setState({ centerPoint: null, isPickingCenter: false });
    useUrlStore.getState().setParams({});
  });

  it("renders_every_filter_field_and_the_submit_button", () => {
    const wrapper = mount(Sidebar);

    expect(wrapper.find("#search").exists()).toBe(true);
    expect(wrapper.find("#radius").exists()).toBe(true);
    expect(wrapper.find("#sortBy").exists()).toBe(true);
    expect(wrapper.find("#sortDir").exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe("Get Stations");
  });

  it("submits_the_current_filters_and_stores_the_returned_stations", async () => {
    mockedUseStationsController.mockResolvedValue({ success: true, entries: [STATION], length: 1 });

    const wrapper = mount(Sidebar);
    await wrapper.find("#search").setValue("Ring");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(mockedUseStationsController).toHaveBeenCalledWith(
      expect.objectContaining({ search: "Ring", sortBy: "street", sortDir: "asc" }),
    );
    expect(useStationStore.getState().stations).toEqual([STATION]);
    expect(useAppStore.getState().error).toBeNull();
  });

  it("disables_the_radius_select_until_a_center_point_is_picked", async () => {
    const wrapper = mount(Sidebar);
    expect(wrapper.find("#radius").attributes("disabled")).toBeDefined();

    useMapStore.getState().setCenterPoint({ lat: 50.9375, lon: 6.9603 });
    await flushPromises();

    expect(wrapper.find("#radius").attributes("disabled")).toBeUndefined();
  });

  it("toggles_picking_mode_via_the_pick_location_button", async () => {
    const wrapper = mount(Sidebar);
    const pickButton = wrapper.findAll("button").find((b) => b.text().includes("Pick Location"));

    await pickButton?.trigger("click");
    expect(useMapStore.getState().isPickingCenter).toBe(true);
    expect(wrapper.text()).toContain("Click the map…");

    await wrapper.findAll("button").find((b) => b.text().includes("Click the map"))?.trigger("click");
    expect(useMapStore.getState().isPickingCenter).toBe(false);
  });

  it("ignores_a_persisted_radius_or_distance_sort_left_over_without_a_center_point", async () => {
    // Regression test: a stale "radius" (or "sortBy: distance") can survive
    // in localStorage from before a center point was picked, or from an
    // older version of the filter shape. It must never reach the API
    // without lat/lon, which the backend rejects outright.
    mockedUseStationsController.mockResolvedValue({ success: true, entries: [], length: 0 });
    useStationStore.setState({ stations: [], filters: { radius: 5, sortBy: "distance", sortDir: "asc" } });

    const wrapper = mount(Sidebar);
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    const params = mockedUseStationsController.mock.calls[0]?.[0];
    expect(params?.lat).toBeUndefined();
    expect(params?.lon).toBeUndefined();
    expect(params?.radius).toBeUndefined();
    expect(params?.sortBy).toBe("street");
  });

  it("sends_the_center_point_as_soon_as_one_is_picked_even_without_a_radius", async () => {
    // A picked point always enables the backend's distance calculation for
    // every station - radius only additionally filters which ones return.
    mockedUseStationsController.mockResolvedValue({ success: true, entries: [], length: 0 });
    useMapStore.getState().setCenterPoint({ lat: 50.9375, lon: 6.9603 });

    const wrapper = mount(Sidebar);
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    let params = mockedUseStationsController.mock.calls[0]?.[0];
    expect(params?.lat).toBe(50.9375);
    expect(params?.lon).toBe(6.9603);
    expect(params?.radius).toBeUndefined();

    await wrapper.find("#radius").setValue("5");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    params = mockedUseStationsController.mock.calls[1]?.[0];
    expect(params?.lat).toBe(50.9375);
    expect(params?.lon).toBe(6.9603);
    expect(params?.radius).toBe(5);
  });

  it("never_sends_a_center_point_without_one_having_been_picked", async () => {
    mockedUseStationsController.mockResolvedValue({ success: true, entries: [], length: 0 });

    const wrapper = mount(Sidebar);
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    const params = mockedUseStationsController.mock.calls[0]?.[0];
    expect(params?.lat).toBeUndefined();
    expect(params?.lon).toBeUndefined();
  });

  it("clearing_the_center_point_resets_radius_and_a_distance_sort", async () => {
    useMapStore.getState().setCenterPoint({ lat: 50.9375, lon: 6.9603 });
    const wrapper = mount(Sidebar);

    await wrapper.find("#radius").setValue("5");
    await wrapper.find("#sortBy").setValue("distance");

    await wrapper.findAll("button").find((b) => b.text() === "Clear")?.trigger("click");
    await flushPromises();

    expect(useMapStore.getState().centerPoint).toBeNull();
    expect((wrapper.find("#radius").element as HTMLSelectElement).value).toBe("");
    expect((wrapper.find("#sortBy").element as HTMLSelectElement).value).toBe("street");
  });

  it("shows_an_error_and_clears_stations_when_the_request_fails", async () => {
    mockedUseStationsController.mockResolvedValue(undefined);

    const wrapper = mount(Sidebar);
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();

    expect(useAppStore.getState().error).toBe("Failed to load stations.");
    expect(useStationStore.getState().stations).toEqual([]);
    expect(wrapper.find(".sidebar_error").exists()).toBe(true);
  });

  it("prefills_the_form_from_the_urls_query_string", () => {
    useUrlStore.getState().setParams({ search: "Ring", sortDir: "desc", lat: "50.9375", lon: "6.9603", radius: "5" });

    const wrapper = mount(Sidebar);

    expect((wrapper.find("#search").element as HTMLInputElement).value).toBe("Ring");
    expect((wrapper.find("#sortDir").element as HTMLSelectElement).value).toBe("desc");
    expect((wrapper.find("#radius").element as HTMLSelectElement).value).toBe("5");
    expect(useMapStore.getState().centerPoint).toEqual({ lat: 50.9375, lon: 6.9603 });
  });

  it("auto_fetches_on_mount_when_the_url_carries_a_search", async () => {
    useUrlStore.getState().setParams({ search: "Ring" });
    mockedUseStationsController.mockResolvedValue({ success: true, entries: [STATION], length: 1 });

    mount(Sidebar);
    await flushPromises();

    expect(mockedUseStationsController).toHaveBeenCalledWith(expect.objectContaining({ search: "Ring" }));
    expect(useStationStore.getState().stations).toEqual([STATION]);
  });

  it("does_not_auto_fetch_when_the_url_has_no_query_string", async () => {
    mount(Sidebar);
    await flushPromises();

    expect(mockedUseStationsController).not.toHaveBeenCalled();
  });

  it("writes_a_filter_change_to_the_url_immediately_without_submitting", async () => {
    const wrapper = mount(Sidebar);

    await wrapper.find("#search").setValue("Ring");

    expect(mockedUseStationsController).not.toHaveBeenCalled();
    expect(new URLSearchParams(window.location.search).get("search")).toBe("Ring");
  });

  it("writes_the_center_point_and_radius_to_the_url_as_soon_as_theyre_set", async () => {
    const wrapper = mount(Sidebar);

    useMapStore.getState().setCenterPoint({ lat: 50.9375, lon: 6.9603 });
    await wrapper.vm.$nextTick();
    await wrapper.find("#radius").setValue("5");

    const params = new URLSearchParams(window.location.search);
    expect(params.get("lat")).toBe("50.9375");
    expect(params.get("lon")).toBe("6.9603");
    expect(params.get("radius")).toBe("5");
  });

  it("disables_the_submit_button_while_loading", async () => {
    let resolveRequest: (a_Value: Awaited<ReturnType<typeof useStationsController>>) => void = () => {};
    mockedUseStationsController.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );

    const wrapper = mount(Sidebar);
    const submitPromise = wrapper.find("form").trigger("submit.prevent");
    await wrapper.vm.$nextTick();

    expect(wrapper.find('button[type="submit"]').attributes("disabled")).toBeDefined();

    resolveRequest({ success: true, entries: [], length: 0 });
    await submitPromise;
    await flushPromises();

    expect(wrapper.find('button[type="submit"]').attributes("disabled")).toBeUndefined();
  });
});
