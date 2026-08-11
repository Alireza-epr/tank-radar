import { app } from "@/core/app";
import { env } from "@/core/config";
import { formatTimestamp } from "@packages/utils";
import { log } from "@/utils/generalUtils";

app.listen(env.port, "0.0.0.0", () => {
  if (!env.enable_console_log) {
    console.log(
      `[${formatTimestamp()}] [INFO] tank-radar API running on port ${env.port} (${env.nodeEnv})`,
    );
    console.log(`[${formatTimestamp()}] [INFO] Further logging is disabled.`);
  }
  log(`tank-radar API running on port ${env.port}`);
});
