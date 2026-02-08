import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET;

export async function signup({ username, email, password }) {
  const hash = await bcrypt.hash(password, 10);

  const { rows } = await db.query(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1,$2,$3)
     RETURNING id, username, email`,
    [username, email, hash]
  );

  return rows[0];
}

export async function login({ email, password }) {
  const { rows } = await db.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  const user = rows[0];
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user.id },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  };
}
