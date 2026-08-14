import {
  parseConsoleLog,
  parseCorsOrigin,
  parseDbPath,
  parseNodeENV,
  parsePort,
  parseStationsApiUrl,
  parseSyncCronSchedule,
} from "@/utils";
import { config as loadEnv } from "@dotenvx/dotenvx";
loadEnv();

export const env = {
  nodeEnv: parseNodeENV(process.env.NODE_ENV),
  enable_console_log: parseConsoleLog(process.env.ENABLE_CONSOLE_LOG),
  port: parsePort(process.env.PORT),
  dbPath: parseDbPath(process.env.DB_PATH),
  stationsApiUrl: parseStationsApiUrl(process.env.STATIONS_API_URL),
  syncCronSchedule: parseSyncCronSchedule(process.env.SYNC_CRON_SCHEDULE),
  corsOrigin: parseCorsOrigin(process.env.CORS_ORIGIN),
};
