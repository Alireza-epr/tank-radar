import { schedule } from "node-cron";
import { env } from "@/core/config";
import { runSync } from "@/sync/runSync";

export const scheduleSync = (): void => {
  void runSync();

  schedule(env.syncCronSchedule, () => {
    void runSync();
  });
};
