import { validate as isValidCronExpression } from "node-cron";
import { IDefaultEnv } from "../types";

export const DEFAULT_ENV: IDefaultEnv = {
  PORT: 1370,
  ENABLE_CONSOLE_LOG: 0,
  NODE_ENV: "production",
  DB_PATH: "./data/db/tank-radar.sqlite",
  STATIONS_API_URL:
    "https://geoportal.stadt-koeln.de/arcgis/rest/services/verkehr/gefahrgutstrecken/MapServer/0/query?where=objectid+is+not+null&outFields=*&outSR=4326&f=pjson",
  // Every 12 hours.
  SYNC_CRON_SCHEDULE: "0 */12 * * *",
};

export const parsePort = (a_Raw: string | undefined) => {
  const parsed = Number(a_Raw);
  return a_Raw !== undefined && Number.isInteger(parsed) && parsed > 0
    ? parsed
    : DEFAULT_ENV.PORT;
};

export const parseNodeENV = (a_Raw: string | undefined) => {
  return a_Raw === "development" || a_Raw === "production"
    ? a_Raw
    : DEFAULT_ENV.NODE_ENV;
};

export const parseConsoleLog = (a_Raw: string | undefined) => {
  return a_Raw === "1" ? 1 : a_Raw === "0" ? 0 : DEFAULT_ENV.ENABLE_CONSOLE_LOG;
};

export const parseDbPath = (a_Raw: string | undefined) => {
  return a_Raw !== undefined && a_Raw.trim().length > 0
    ? a_Raw
    : DEFAULT_ENV.DB_PATH;
};

export const parseStationsApiUrl = (a_Raw: string | undefined) => {
  return a_Raw !== undefined && a_Raw.trim().length > 0
    ? a_Raw
    : DEFAULT_ENV.STATIONS_API_URL;
};

export const parseSyncCronSchedule = (a_Raw: string | undefined) => {
  return a_Raw !== undefined && isValidCronExpression(a_Raw)
    ? a_Raw
    : DEFAULT_ENV.SYNC_CRON_SCHEDULE;
};
