import { Request, Response } from "express";
import { controllerResponse } from "@/utils";
import { EStatusCode, EResponseError } from "@packages/enum";
import { parseStationsQuery } from "@/utils/stationsUtils";
import { getStations } from "@/db/queries";

export const stationsController = (a_Req: Request, a_Res: Response) => {
  const result = parseStationsQuery(a_Req.query as Record<string, unknown>);

  if (!result.success) {
    return controllerResponse(a_Res, EStatusCode.BAD_REQUEST_400, {
      success: false,
      error: [EResponseError.VALIDATION_ERROR_400, result.error],
    });
  }

  const stations = getStations(result.data);

  return controllerResponse(a_Res, EStatusCode.OK_200, {
    success: true,
    entries: stations,
    length: stations.length,
  });
};
