import { IDefaultEnv } from "../types";

export const DEFAULT_ENV: IDefaultEnv = {
  PORT: 1370,
  ENABLE_CONSOLE_LOG: 0,
  NODE_ENV: "production",
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
