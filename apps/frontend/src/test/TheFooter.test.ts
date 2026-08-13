import { describe, it, expect, beforeEach } from "@jest/globals";
import { mount } from "@vue/test-utils";
import Footer from "@/components/TheFooter.vue";
import { useStationStore } from "@/store/stationStore";
import { useAppStore } from "@/store/appStore";

const STATION = { objectid: 1, street: "Ring", rawAddress: "Ring 1 (50667 Köln)", lat: 50.9375, lon: 6.9603, distance: 1.234 };
const STATION_B = { objectid: 2, street: "Bahnhof", rawAddress: "Bahnhof 2 (50667 Köln)", lat: 50.94, lon: 6.96 };

describe("Footer", () => {
  beforeEach(() => {
    useStationStore.setState({ stations: [], filters: {}, selectedStationId: null });
    useAppStore.setState({ isLoading: false, error: null });
  });

  it("shows_the_placeholder_when_no_stations_have_been_loaded", () => {
    const wrapper = mount(Footer);
    expect(wrapper.text()).toContain("No stations loaded yet.");
  });

  it("shows_a_loading_message_while_a_request_is_in_flight", () => {
    useAppStore.setState({ isLoading: true, error: null });
    const wrapper = mount(Footer);
    expect(wrapper.text()).toContain("Loading stations…");
  });

  it("shows_the_error_message_when_the_last_request_failed", () => {
    useAppStore.setState({ isLoading: false, error: "Failed to load stations." });
    const wrapper = mount(Footer);
    expect(wrapper.text()).toContain("Failed to load stations.");
  });

  it("shows_how_many_stations_were_received", () => {
    useStationStore.setState({ stations: [STATION, STATION_B], filters: {}, selectedStationId: null });
    const wrapper = mount(Footer);

    expect(wrapper.text()).toContain("2 stations");
  });

  it("uses_the_singular_form_for_exactly_one_station", () => {
    useStationStore.setState({ stations: [STATION], filters: {}, selectedStationId: null });
    const wrapper = mount(Footer);

    expect(wrapper.text()).toContain("1 station");
    expect(wrapper.text()).not.toContain("1 stations");
  });

  it("lists_every_station_from_the_store_with_its_distance_but_not_its_address", () => {
    useStationStore.setState({ stations: [STATION], filters: {}, selectedStationId: null });
    const wrapper = mount(Footer);

    const row = wrapper.find("tbody tr");
    expect(row.text()).toContain("Ring");
    expect(row.text()).not.toContain("Ring 1 (50667 Köln)");
    expect(row.text()).toContain("1.23 km");
    expect(row.text()).toContain("50.94");
    expect(row.text()).toContain("6.96");
    expect(wrapper.find("thead").text()).not.toContain("Address");
  });

  it("shows_a_dash_for_distance_when_no_center_point_was_used", () => {
    const { distance, ...stationWithoutDistance } = STATION;
    void distance;
    useStationStore.setState({ stations: [stationWithoutDistance], filters: {}, selectedStationId: null });
    const wrapper = mount(Footer);

    expect(wrapper.find("tbody tr").text()).toContain("—");
  });

  it("selects_a_station_on_row_click_and_deselects_it_on_a_second_click", async () => {
    useStationStore.setState({ stations: [STATION, STATION_B], filters: {}, selectedStationId: null });
    const wrapper = mount(Footer);

    const rows = wrapper.findAll("tbody tr");
    await rows[0]?.trigger("click");
    expect(useStationStore.getState().selectedStationId).toBe(STATION.objectid);
    expect(rows[0]?.classes()).toContain("footer_row--selected");
    expect(rows[1]?.classes()).not.toContain("footer_row--selected");

    await rows[0]?.trigger("click");
    expect(useStationStore.getState().selectedStationId).toBeNull();
  });

  it("selecting_a_different_station_moves_the_selection", async () => {
    useStationStore.setState({ stations: [STATION, STATION_B], filters: {}, selectedStationId: STATION.objectid });
    const wrapper = mount(Footer);

    const rows = wrapper.findAll("tbody tr");
    await rows[1]?.trigger("click");

    expect(useStationStore.getState().selectedStationId).toBe(STATION_B.objectid);
  });
});
