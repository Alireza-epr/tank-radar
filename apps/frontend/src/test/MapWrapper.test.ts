import { describe, it, expect, beforeEach } from "@jest/globals";
import { mount } from "@vue/test-utils";
import { Map as MockMap, mockAddControl, mockRemove } from "@/test/maplibreMock";
import MapWrapper from "@/components/MapWrapper.vue";

describe("MapWrapper", () => {
  beforeEach(() => {
    MockMap.mockClear();
    mockRemove.mockClear();
    mockAddControl.mockClear();
  });

  it("creates_a_map_centered_on_köln_on_mount", () => {
    mount(MapWrapper);

    expect(MockMap).toHaveBeenCalledTimes(1);
    const options = MockMap.mock.calls[0]?.[0] as { center: [number, number]; zoom: number };
    expect(options.center).toEqual([6.9603, 50.9375]);
    expect(mockAddControl).toHaveBeenCalledTimes(1);
  });

  it("removes_the_map_on_unmount", () => {
    const wrapper = mount(MapWrapper);
    wrapper.unmount();

    expect(mockRemove).toHaveBeenCalledTimes(1);
  });
});
