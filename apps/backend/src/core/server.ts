import { app } from "@/core/app";
import { env } from "@/core/config";
import { formatTimestamp } from "@packages/utils";
import { backend_log } from "@/utils/generalUtils";
import "@/core/db";

app.listen(env.port, "0.0.0.0", () => {
  if (!env.enable_console_log) {
    console.log(
      `[${formatTimestamp()}] [INFO] tank-radar API running on port ${env.port} (${env.nodeEnv})`,
    );
    console.log(`[${formatTimestamp()}] [INFO] Further logging is disabled.`);
  }
  backend_log(`tank-radar API running on port ${env.port}`);
});
