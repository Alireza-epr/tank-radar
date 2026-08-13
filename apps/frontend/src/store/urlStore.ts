import { createStore } from "zustand/vanilla";
import { combine } from "zustand/middleware";
import type { IUrlStoreActions, IUrlStoreStates } from "@/types/storeTypes";

const readParamsFromLocation = (): IUrlStoreStates["params"] =>
  Object.fromEntries(new URLSearchParams(window.location.search).entries());

const writeParamsToLocation = (a_Params: IUrlStoreStates["params"]) => {
  const query = new URLSearchParams(a_Params).toString();
  const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
  window.history.replaceState(null, "", newUrl);
};

export const useUrlStore = createStore<IUrlStoreStates & IUrlStoreActions>()(
  combine(
    {
      params: readParamsFromLocation(),
    },
    (set) => ({
      setParams: (a_Value) =>
        set((state) => {
          const params = typeof a_Value === "function" ? a_Value(state.params) : a_Value;
          writeParamsToLocation(params);
          return { params };
        }),
    }),
  ),
);

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    useUrlStore.setState({ params: readParamsFromLocation() });
  });
}
