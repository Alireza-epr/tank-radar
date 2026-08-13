import { useStationsAPI } from "@/utils/apiUtils";
import { upsertStations } from "@/db/queries";
import { startSyncRun, completeSyncRun } from "@/db/queries";
import { backend_log } from "@/utils/generalUtils";
import { ELogType } from "@packages/enum";
import { ISyncRunInput } from "@packages/types";

export const runSync = async (): Promise<ISyncRunInput> => {
  const id = startSyncRun();

  try {
    const stations = await useStationsAPI();

    if (!stations) {
      const result: ISyncRunInput = {
        id,
        status: "failed",
        recordsFetched: 0,
        recordsUpserted: 0,
        recordsDeactivated: 0,
        error: "Failed to fetch stations from source API",
      };
      completeSyncRun(result);
      backend_log(`[runSync] Sync #${id} failed: could not fetch stations`, ELogType.error);
      return result;
    }

    const { upserted, deactivated, skipped } = upsertStations(stations);

    const result: ISyncRunInput = {
      id,
      status: "success",
      recordsFetched: stations.length,
      recordsUpserted: upserted,
      recordsDeactivated: deactivated,
    };
    completeSyncRun(result);

    backend_log(
      `[runSync] Sync #${id} completed: fetched=${stations.length} upserted=${upserted} deactivated=${deactivated} skipped=${skipped}`,
      ELogType.success,
    );
    return result;
  } catch (error) {
    const result: ISyncRunInput = {
      id,
      status: "failed",
      recordsFetched: 0,
      recordsUpserted: 0,
      recordsDeactivated: 0,
      error: String(error),
    };
    completeSyncRun(result);
    backend_log(`[runSync] Sync #${id} crashed: ${error}`, ELogType.error);
    return result;
  }
};
