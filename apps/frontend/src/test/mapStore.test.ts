import { describe, it, expect, beforeEach } from "@jest/globals";
import { useMapStore } from "@/store/mapStore";

const RESET_STATE = {
  centerPoint: null,
  isPickingCenter: false,
};

describe("useMapStore", () => {
  beforeEach(() => {
    useMapStore.setState(RESET_STATE);
  });

  it("sets_the_center_point_directly", () => {
    useMapStore.getState().setCenterPoint({ lat: 50.9375, lon: 6.9603 });

    expect(useMapStore.getState().centerPoint).toEqual({ lat: 50.9375, lon: 6.9603 });
  });

  it("toggles_picking_mode_via_a_functional_update", () => {
    useMapStore.getState().setIsPickingCenter((prev) => !prev);
    expect(useMapStore.getState().isPickingCenter).toBe(true);

    useMapStore.getState().setIsPickingCenter((prev) => !prev);
    expect(useMapStore.getState().isPickingCenter).toBe(false);
  });
});
