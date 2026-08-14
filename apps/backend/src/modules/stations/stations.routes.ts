import express from "express";
import { stationsController } from "./stations.controller";
import { ERoutes } from "@packages/enum";
const router = express.Router();

router.get(ERoutes.stations, stationsController);
export default router;
