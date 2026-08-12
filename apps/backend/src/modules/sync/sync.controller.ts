import { Request, Response } from "express";
import { controllerResponse } from "@/utils";
import { EStatusCode } from "@packages/enum";
import { runSync } from "@/sync/runSync";
import { getSyncMeta } from "@/db/queries";

export const syncController = async (a_Req: Request, a_Res: Response) => {
  const result = await runSync();

  if (result.status === "failed") {
    return controllerResponse(a_Res, EStatusCode.SERVICE_UNAVAILABLE_503, {
      success: false,
      error: [result.error ?? "Sync failed"],
      entries: [result],
    });
  }

  return controllerResponse(a_Res, EStatusCode.OK_200, {
    success: true,
    length: 1,
    entries: [result],
  });
};

export const syncMetaController = (a_Req: Request, a_Res: Response) => {
  const meta = getSyncMeta();

  return controllerResponse(a_Res, EStatusCode.OK_200, {
    success: true,
    length: 1,
    entries: [meta],
  });
};
