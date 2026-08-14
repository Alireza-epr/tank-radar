import express from "express";
import { syncController, syncMetaController } from "./sync.controller";
import { ERoutes } from "@packages/enum";
const router = express.Router();

router.post(ERoutes.sync, syncController);
router.get(ERoutes.syncMeta, syncMetaController);
export default router;
