import express from "express";
import { corsMiddleware } from "@/middlewares/corsMiddleware";
import { requestLogger, responseLogger } from "@/middlewares/loggerMiddleware";
import routes from "./routes";

export const app = express();

app.use(express.json());

// --- Middlewares ---
// Allow the frontend origin to call this API
app.use(corsMiddleware);
// Log every incoming request
app.use(requestLogger);
// Logs all responses automatically
app.use(responseLogger);

// --- Routes ---
app.use(routes);
