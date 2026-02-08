import jwt from "jsonwebtoken";
import { db } from "../config/db.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.sendStatus(401);

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await db.query(
      "SELECT id, username, email FROM users WHERE id=$1",
      [payload.id]
    );
    req.user = rows[0];
    next();
  } catch {
    res.sendStatus(401);
  }
}
