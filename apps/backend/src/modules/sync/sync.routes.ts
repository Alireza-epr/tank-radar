import express from 'express';
import { syncController } from "./sync.controller";
import { ERoutes } from '@packages/enum';
const router = express.Router();

router.post(ERoutes.sync, syncController);
export default router;
