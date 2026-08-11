import { env } from "@/core/config";
import { ELogType } from "@packages/enum";
import { TLogType } from "@packages/types";
import { formatTimestamp, shortenText } from "@packages/utils";

export const log = (
  a_Message: string,
  a_Type: TLogType = ELogType.info,
  a_MessageLimit?: number,
): void => {
  const message = a_MessageLimit
    ? shortenText(a_Message, a_MessageLimit)
    : a_Message;
  const formattedMessage = `[${formatTimestamp()}] [${a_Type}] ${message}`;

  // Log to console if console logging is enabled
  if (env.enable_console_log) {
    console.log(formattedMessage);
  }

};