import cors from "cors";
import { env } from "@/core/config";

// Allows the frontend (a different origin in dev) to call this API
export const corsMiddleware = cors({
  origin: env.corsOrigin,
});
