// backend/middleware/requireHR.js
export function requireHR(req, res, next) {
  if (!req.user?.role) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.user.role !== "HR") {
    return res.status(403).json({ message: "HR role required" });
  }
  next();
}

export default requireHR;
