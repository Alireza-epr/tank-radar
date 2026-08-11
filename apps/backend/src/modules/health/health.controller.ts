import { Request, Response } from "express";
import { controllerResponse } from "@/utils";
import { EStatusCode } from "@packages/enum";

export const healthController = (a_Req: Request, a_Res: Response) => {
  return controllerResponse(a_Res, EStatusCode.OK_200, {
    success: true,
  });
};