import * as authService from "./auth.service.js";

export async function signup(req, res) {
  try {
    const user = await authService.signup(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req, res) {
  try {
    const user = await authService.login(req.body);
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

export async function me(req, res) {
  res.json(req.user);
}
