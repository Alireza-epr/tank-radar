import { useStationsAPI } from "@/utils/apiUtils";
import { upsertStations } from "@/db/queries";
import { startSyncRun, completeSyncRun } from "@/db/queries";
import { backend_log } from "@/utils/generalUtils";
import { ELogType } from "@packages/enum";

export const runSync = async (): Promise<void> => {
  const id = startSyncRun();

  try {
    const stations = await useStationsAPI();

    if (!stations) {
      completeSyncRun({
        id,
        status: "failed",
        recordsFetched: 0,
        recordsUpserted: 0,
        recordsDeactivated: 0,
        error: "Failed to fetch stations from source API",
      });
      backend_log(`[runSync] Sync #${id} failed: could not fetch stations`, ELogType.error);
      return;
    }

    const { upserted, deactivated, skipped } = upsertStations(stations);

    completeSyncRun({
      id,
      status: "success",
      recordsFetched: stations.length,
      recordsUpserted: upserted,
      recordsDeactivated: deactivated,
    });

    backend_log(
      `[runSync] Sync #${id} completed: fetched=${stations.length} upserted=${upserted} deactivated=${deactivated} skipped=${skipped}`,
      ELogType.success,
    );
  } catch (error) {
    completeSyncRun({
      id,
      status: "failed",
      recordsFetched: 0,
      recordsUpserted: 0,
      recordsDeactivated: 0,
      error: String(error),
    });
    backend_log(`[runSync] Sync #${id} crashed: ${error}`, ELogType.error);
  }
};
