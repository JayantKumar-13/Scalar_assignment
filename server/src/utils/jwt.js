import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "flipkart-clone-secret";

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    secret,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, secret);
}

