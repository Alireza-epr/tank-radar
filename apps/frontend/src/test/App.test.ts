import { describe, it, expect } from "@jest/globals";
import { mount } from "@vue/test-utils";
import App from "@/App.vue";

describe("App", () => {
  it("composes_header_sidebar_map_and_footer", () => {
    const wrapper = mount(App, {
      global: { stubs: { MapWrapper: true } },
    });

    expect(wrapper.text()).toContain("Tank Radar");
    expect(wrapper.findComponent({ name: "Sidebar" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "Footer" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "MapWrapper" }).exists()).toBe(true);
  });
});
