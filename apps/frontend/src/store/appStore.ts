import { createStore } from "zustand/vanilla";
import { combine } from "zustand/middleware";
import type { IAppStoreActions, IAppStoreStates } from "@/types/storeTypes";

export const useAppStore = createStore<IAppStoreStates & IAppStoreActions>()(
  combine(
    {
      isLoading: false as IAppStoreStates["isLoading"],
      error: null as IAppStoreStates["error"],
    },
    (set) => ({
      setIsLoading: (a_Value) =>
        set((state) => ({
          isLoading: typeof a_Value === "function" ? a_Value(state.isLoading) : a_Value,
        })),
      setError: (a_Value) =>
        set((state) => ({
          error: typeof a_Value === "function" ? a_Value(state.error) : a_Value,
        })),
    }),
  ),
);
