import { Router } from "express";
import healthRouter from "@/modules/health/health.routes";
import syncRouter from "@/modules/sync/sync.routes";

const router = Router();

router.use(healthRouter);
router.use(syncRouter);

export default router;
