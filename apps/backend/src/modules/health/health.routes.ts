import express from "express";
import { healthController } from "./health.controller";
import { ERoutes } from "@packages/enum";
const router = express.Router();

router.get(ERoutes.health, healthController);
export default router;
