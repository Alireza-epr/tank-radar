import { createStore } from "zustand/vanilla";
import { combine, persist } from "zustand/middleware";
import type { IMapStoreActions, IMapStoreStates } from "@/types/storeTypes";

export const useMapStore = createStore<IMapStoreStates & IMapStoreActions>()(
  persist(
    combine(
      {
        centerPoint: null as IMapStoreStates["centerPoint"],
        isPickingCenter: false as IMapStoreStates["isPickingCenter"],
      },
      (set) => ({
        setCenterPoint: (a_Value) =>
          set((state) => ({
            centerPoint:
              typeof a_Value === "function"
                ? a_Value(state.centerPoint)
                : a_Value,
          })),
        setIsPickingCenter: (a_Value) =>
          set((state) => ({
            isPickingCenter:
              typeof a_Value === "function"
                ? a_Value(state.isPickingCenter)
                : a_Value,
          })),
      }),
    ),
    {
      name: "station-center-point",
      partialize: (s) => ({ centerPoint: s.centerPoint }),
    },
  ),
);
