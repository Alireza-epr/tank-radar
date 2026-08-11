
import { parseConsoleLog, parseNodeENV, parsePort } from "@/utils";
import { config as loadEnv } from "@dotenvx/dotenvx";
loadEnv();

export const env = {
  nodeEnv: parseNodeENV(process.env.NODE_ENV ),
  enable_console_log: parseConsoleLog(process.env.ENABLE_CONSOLE_LOG),
  port: parsePort(process.env.PORT),
};
