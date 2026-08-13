import { EURLParams } from "@/enum/generalEnum";
import { ELogType } from "@packages/enum";
import type { TLogType } from "@packages/types";
import { formatTimestamp } from "@packages/utils";

export const frontend_log = (
  a_Message: unknown,
  a_Type: TLogType = ELogType.info,
  a_logLevel?: string,
): void => {
  const formattedMessage = `[${formatTimestamp()}]`;
  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const logLevel = params.get(EURLParams.loglevel);
  if ((logLevel && logLevel === "3") || (a_logLevel && a_logLevel === "3")) {
    switch (a_Type) {
      case ELogType.info:
        console.log(formattedMessage, a_Message);
        break;
      case ELogType.warn:
        console.warn(formattedMessage, a_Message);
        break;
      case ELogType.error:
        console.error(formattedMessage, a_Message);
        break;
    }
  }
};
