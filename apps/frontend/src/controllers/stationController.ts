import apiConfig from "@/config/api.json";
import { frontend_log } from "@/utils/generalUtils";
import { ELogType, ERoutes } from "@packages/enum";
import type { IResponse, IStationResult, IStationsQueryParams } from "@packages/types";
import { fetchWithRetry } from "@packages/utils";

const buildStationsQuery = (a_Params: IStationsQueryParams): string => {
  const query = new URLSearchParams();

  if (a_Params.lat !== undefined) query.set("lat", String(a_Params.lat));
  if (a_Params.lon !== undefined) query.set("lon", String(a_Params.lon));
  if (a_Params.radius !== undefined) query.set("radius", String(a_Params.radius));
  if (a_Params.search !== undefined) query.set("search", a_Params.search);
  if (a_Params.sortBy !== undefined) query.set("sortBy", a_Params.sortBy);
  if (a_Params.sortDir !== undefined) query.set("sortDir", a_Params.sortDir);

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

export const useStationsController = async (
  a_Params: IStationsQueryParams,
): Promise<IResponse<IStationResult> | undefined> => {
  try {
    const resp = await fetchWithRetry(
      `${apiConfig.baseURL}${ERoutes.stations}${buildStationsQuery(a_Params)}`,
      { method: "GET" },
      5,
      200,
    );

    const json = (await resp.json()) as IResponse<IStationResult>;

    return json;
  } catch (error) {
    frontend_log(`[useStationsController] ${error}`, ELogType.error, "3");
  }
};
