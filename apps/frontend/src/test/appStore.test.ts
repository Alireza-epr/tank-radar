import { describe, it, expect, beforeEach } from "@jest/globals";
import { useAppStore } from "@/store/appStore";

const RESET_STATE = {
  isLoading: false,
  error: null,
};

describe("useAppStore", () => {
  beforeEach(() => {
    useAppStore.setState(RESET_STATE);
  });

  it("sets_loading_and_error_independently", () => {
    useAppStore.getState().setIsLoading(true);
    useAppStore.getState().setError("boom");

    expect(useAppStore.getState().isLoading).toBe(true);
    expect(useAppStore.getState().error).toBe("boom");
  });

  it("accepts_a_functional_update_based_on_the_previous_value", () => {
    useAppStore.getState().setIsLoading((prev) => !prev);

    expect(useAppStore.getState().isLoading).toBe(true);
  });
});
