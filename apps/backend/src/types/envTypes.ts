export interface IDefaultEnv {
  PORT: number;
  NODE_ENV: "development" | "production";
  ENABLE_CONSOLE_LOG: 0 | 1;
  DB_PATH: string;
  STATIONS_API_URL: string;
  SYNC_CRON_SCHEDULE: string;
}
