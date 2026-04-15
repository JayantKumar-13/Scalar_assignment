import { query } from "../config/db.js";
import { verifyToken } from "../utils/jwt.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    const rows = await query(
      "SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ? LIMIT 1",
      [payload.sub]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid session" });
    }

    req.user = rows[0];
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

