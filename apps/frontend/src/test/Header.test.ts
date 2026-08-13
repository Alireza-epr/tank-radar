import { describe, it, expect } from "@jest/globals";
import { mount } from "@vue/test-utils";
import Header from "@/components/TheHeader.vue";

describe("Header", () => {
  it("renders_the_app_name", () => {
    const wrapper = mount(Header);
    expect(wrapper.text()).toContain("Tank Radar");
  });

  it("has_a_sync_button", () => {
    const wrapper = mount(Header);
    expect(wrapper.find("button").text()).toBe("Sync");
  });
});
