import type { IStationResult, IStationsQueryParams } from "@packages/types";
import type { ICenterPoint } from "./generalTypes";

export interface IAppStoreStates {
  isLoading: boolean;
  error: string | null;
}

export interface IAppStoreActions {
  setIsLoading: (
    a_Value: IAppStoreStates["isLoading"] | ((a_Prev: IAppStoreStates["isLoading"]) => IAppStoreStates["isLoading"]),
  ) => void;
  setError: (
    a_Value: IAppStoreStates["error"] | ((a_Prev: IAppStoreStates["error"]) => IAppStoreStates["error"]),
  ) => void;
}

export interface IStationStoreStates {
  stations: IStationResult[];
  filters: IStationsQueryParams;
  selectedStationId: number | null;
}

export interface IStationStoreActions {
  setStations: (
    a_Value: IStationStoreStates["stations"] | ((a_Prev: IStationStoreStates["stations"]) => IStationStoreStates["stations"]),
  ) => void;
  setFilters: (
    a_Value: IStationStoreStates["filters"] | ((a_Prev: IStationStoreStates["filters"]) => IStationStoreStates["filters"]),
  ) => void;
  setSelectedStationId: (
    a_Value:
      | IStationStoreStates["selectedStationId"]
      | ((a_Prev: IStationStoreStates["selectedStationId"]) => IStationStoreStates["selectedStationId"]),
  ) => void;
}

export interface IMapStoreStates {
  centerPoint: ICenterPoint | null;
  isPickingCenter: boolean
}

export interface IMapStoreActions {
  setCenterPoint: (
    a_Value: IMapStoreStates["centerPoint"] | ((a_Prev: IMapStoreStates["centerPoint"]) => IMapStoreStates["centerPoint"]),
  ) => void;
  setIsPickingCenter: (
    a_Value: IMapStoreStates["isPickingCenter"] | ((a_Prev: IMapStoreStates["isPickingCenter"]) => IMapStoreStates["isPickingCenter"]),
  ) => void;
}
