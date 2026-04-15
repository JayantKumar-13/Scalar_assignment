import { query } from "../config/db.js";
import { hashPassword, verifyPassword } from "../utils/crypto.js";
import { signToken } from "../utils/jwt.js";

function buildAuthPayload(user) {
  return {
    token: signToken(user),
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  };
}

async function findUserByEmail(email) {
  const rows = await query("SELECT * FROM users WHERE email = ? LIMIT 1", [email.toLowerCase()]);
  return rows[0];
}

async function ensureDemoUser() {
  const demoEmail = (process.env.DEMO_USER_EMAIL || "demo@flipkartclone.dev").toLowerCase();
  const demoPassword = process.env.DEMO_USER_PASSWORD || "password123";
  let user = await findUserByEmail(demoEmail);

  if (!user) {
    const result = await query(
      "INSERT INTO users (full_name, email, password_hash, phone) VALUES (?, ?, ?, ?)",
      ["Demo Shopper", demoEmail, hashPassword(demoPassword), "9876543210"]
    );

    const rows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [result.insertId]);
    user = rows[0];
  }

  return user;
}

export async function register(req, res) {
  const { fullName, email, password, phone } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Full name, email, and password are required" });
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return res.status(409).json({ message: "An account with this email already exists" });
  }

  const result = await query(
    "INSERT INTO users (full_name, email, password_hash, phone) VALUES (?, ?, ?, ?)",
    [fullName, email.toLowerCase(), hashPassword(password), phone || null]
  );

  const rows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [result.insertId]);
  res.status(201).json(buildAuthPayload(rows[0]));
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await findUserByEmail(email);

  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json(buildAuthPayload(user));
}

export async function demoLogin(req, res) {
  const user = await ensureDemoUser();
  res.json({
    ...buildAuthPayload(user),
    isDemo: true
  });
}

export async function getMe(req, res) {
  res.json({
    user: {
      id: req.user.id,
      fullName: req.user.full_name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role
    }
  });
}

