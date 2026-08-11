import type { ELogType } from "@packages/enum";

export type TLogType = (typeof ELogType)[keyof typeof ELogType]