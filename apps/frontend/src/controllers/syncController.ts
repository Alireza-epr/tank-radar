import { API_BASE_URL } from "@/config/api";
import { frontend_log } from "@/utils/generalUtils";
import { ELogType, ERoutes } from "@packages/enum";
import type { IResponse, ISyncMeta, ISyncRunInput } from "@packages/types";
import { fetchWithRetry } from "@packages/utils";

export const useSyncController = async (): Promise<
  IResponse<ISyncRunInput> | undefined
> => {
  try {
    const resp = await fetchWithRetry(
      `${API_BASE_URL}${ERoutes.sync}`,
      { method: "POST" },
      5,
      200,
    );

    const json = (await resp.json()) as IResponse<ISyncRunInput>;

    return json;
  } catch (error) {
    frontend_log(`[useSyncController] ${error}`, ELogType.error, "3");
  }
};

export const useSyncMetaController = async (): Promise<
  IResponse<ISyncMeta> | undefined
> => {
  try {
    const resp = await fetchWithRetry(
      `${API_BASE_URL}${ERoutes.syncMeta}`,
      { method: "GET" },
      5,
      200,
    );

    const json = (await resp.json()) as IResponse<ISyncMeta>;

    return json;
  } catch (error) {
    frontend_log(`[useSyncMetaController] ${error}`, ELogType.error, "3");
  }
};
