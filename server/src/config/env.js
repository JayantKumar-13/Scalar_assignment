import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const envPath = path.resolve(__dirname, "..", "..", ".env");

let loaded = false;

export function loadEnv() {
  if (loaded) {
    return envPath;
  }

  dotenv.config({ path: envPath });
  loaded = true;
  return envPath;
}

