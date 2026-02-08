export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

export const moderatorOnly = (req, res, next) => {
  if (req.user.role !== "moderator") {
    return res.status(403).json({ message: "Access denied: Moderators only" });
  }
  next();
};