import express from "express";
import { requestLogger, responseLogger } from "@/middlewares/loggerMiddleware";
import routes from "./routes";

export const app = express();

app.use(express.json());

// --- Middlewares ---
// Log every incoming request
app.use(requestLogger);
// Logs all responses automatically
app.use(responseLogger);

// --- Routes ---
app.use(routes);
