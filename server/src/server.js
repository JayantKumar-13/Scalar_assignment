import app from "./app.js";
import { envPath, loadEnv } from "./config/env.js";
import { query } from "./config/db.js";

loadEnv();

const port = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await query("SELECT 1");
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    const envHint =
      error.code === "ER_ACCESS_DENIED_ERROR"
        ? ` Check DB_USER and DB_PASSWORD in ${envPath}.`
        : "";
    console.error(`Failed to start server: ${error.message}.${envHint}`);
    process.exit(1);
  }
}

startServer();
