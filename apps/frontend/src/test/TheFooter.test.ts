import { describe, it, expect, beforeEach } from "@jest/globals";
import { mount } from "@vue/test-utils";
import Footer from "@/components/TheFooter.vue";
import { useStationStore } from "@/store/stationStore";
import { useAppStore } from "@/store/appStore";

const STATION = { objectid: 1, street: "Ring", rawAddress: "Ring 1 (50667 Köln)", lat: 50.9375, lon: 6.9603, distance: 1.234 };

describe("Footer", () => {
  beforeEach(() => {
    useStationStore.setState({ stations: [], filters: {} });
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

  it("lists_every_station_from_the_store_with_its_distance", () => {
    useStationStore.setState({ stations: [STATION], filters: {} });
    const wrapper = mount(Footer);

    const row = wrapper.find("tbody tr");
    expect(row.text()).toContain("Ring");
    expect(row.text()).toContain("Ring 1 (50667 Köln)");
    expect(row.text()).toContain("1.23 km");
    expect(row.text()).toContain("50.93750");
    expect(row.text()).toContain("6.96030");
  });

  it("shows_a_dash_for_distance_when_no_center_point_was_used", () => {
    const { distance, ...stationWithoutDistance } = STATION;
    void distance;
    useStationStore.setState({ stations: [stationWithoutDistance], filters: {} });
    const wrapper = mount(Footer);

    expect(wrapper.find("tbody tr").text()).toContain("—");
  });
});
