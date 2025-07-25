// backend/middleware/requireRole.js
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `Access denied. Allowed roles: ${allowedRoles.join(", ")}` });
    }

    next();
  };
}

export default requireRole;
