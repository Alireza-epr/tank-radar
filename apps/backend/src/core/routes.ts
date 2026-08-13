import { Router } from "express";
import healthRouter from "@/modules/health/health.routes";
import syncRouter from "@/modules/sync/sync.routes";
import stationsRouter from "@/modules/stations/stations.routes";

const router = Router();

router.use(healthRouter);
router.use(syncRouter);
router.use(stationsRouter);

export default router;
