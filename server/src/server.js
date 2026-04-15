import app from "./app.js";
import { envPath, loadEnv } from "./config/env.js";
import { query } from "./config/db.js";

loadEnv();

const port = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    console.log("Checking DB...");
    await query("SELECT 1");

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("FULL ERROR:", error);
    process.exit(1);
  }
}

startServer();
