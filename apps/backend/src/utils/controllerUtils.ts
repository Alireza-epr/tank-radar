import { Response } from 'express';
import {deepSortObject} from "@packages/utils";
import { IResponse } from '@/types/controllerTypes';
import { TStatusCode } from '@packages/types';

export const controllerResponse = <T>(
  a_Res: Response,
  a_StatusCode: TStatusCode,
  a_Json: IResponse<T>,
) => {
  a_Res.status(a_StatusCode).json(deepSortObject(a_Json));
};