import { createStore } from "zustand/vanilla";
import { combine, persist } from "zustand/middleware";
import type {
  IStationStoreActions,
  IStationStoreStates,
} from "@/types/storeTypes";

export const useStationStore = createStore<
  IStationStoreStates & IStationStoreActions
>()(
  persist(
    combine(
      {
        stations: [] as IStationStoreStates["stations"],
        filters: {} as IStationStoreStates["filters"],
        selectedStationId: null as IStationStoreStates["selectedStationId"],
      },
      (set) => ({
        setStations: (a_Value) =>
          set((state) => ({
            stations:
              typeof a_Value === "function" ? a_Value(state.stations) : a_Value,
          })),
        setFilters: (a_Value) =>
          set((state) => ({
            filters:
              typeof a_Value === "function" ? a_Value(state.filters) : a_Value,
          })),
        setSelectedStationId: (a_Value) =>
          set((state) => ({
            selectedStationId:
              typeof a_Value === "function"
                ? a_Value(state.selectedStationId)
                : a_Value,
          })),
      }),
    ),
    {
      name: "station-filters",
      partialize: (s) => ({ filters: s.filters }),
    },
  ),
);
