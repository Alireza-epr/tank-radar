import { describe, it, expect, beforeEach } from "@jest/globals";
import { useUrlStore } from "@/store/urlStore";

const setUrl = (a_Search: string) => {
  window.history.pushState(null, "", `/${a_Search}`);
};

describe("useUrlStore", () => {
  beforeEach(() => {
    setUrl("");
  });

  it("setParams_updates_both_the_store_and_the_real_browser_url", () => {
    useUrlStore.getState().setParams({ search: "Ring" });

    expect(useUrlStore.getState().params).toEqual({ search: "Ring" });
    expect(window.location.search).toBe("?search=Ring");
  });

  it("accepts_a_functional_update_based_on_the_previous_params", () => {
    useUrlStore.getState().setParams({ search: "Ring" });
    useUrlStore.getState().setParams((prev) => ({ ...prev, sortDir: "desc" }));

    expect(useUrlStore.getState().params).toEqual({ search: "Ring", sortDir: "desc" });
    expect(window.location.search).toContain("search=Ring");
    expect(window.location.search).toContain("sortDir=desc");
  });

  it("clears_the_query_string_when_set_to_an_empty_object", () => {
    useUrlStore.getState().setParams({ search: "Ring" });
    useUrlStore.getState().setParams({});

    expect(window.location.search).toBe("");
  });

  it("picks_up_params_already_in_the_url_when_the_store_is_read_fresh", () => {
    setUrl("?search=Ring&sortDir=desc");

    const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
    expect(params).toEqual({ search: "Ring", sortDir: "desc" });
  });

  it("updates_its_state_on_a_popstate_event_from_browser_navigation", () => {
    useUrlStore.getState().setParams({ search: "Ring" });

    // Simulate the browser moving back to a different URL.
    window.history.pushState(null, "", "/?search=Bahnhof");
    window.dispatchEvent(new PopStateEvent("popstate"));

    expect(useUrlStore.getState().params).toEqual({ search: "Bahnhof" });
  });
});
