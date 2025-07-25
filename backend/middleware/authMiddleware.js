// import jwt from "jsonwebtoken";
// import { User } from "../models/User.js";

// export function verifyToken(req, res, next) {
//   let token = null;

//   // 1. Prefer Authorization header: Bearer <token>
//   const authHeader = req.headers.authorization;
//   if (authHeader?.startsWith("Bearer ")) {
//     token = authHeader.split(" ")[1];
//   }

//   // 2. Fallback to httpOnly cookie named "token"
//   if (!token && req.cookies?.token) {
//     token = req.cookies.token;
//   }

//   if (!token) {
//     return res.status(401).json({ message: "Not authenticated" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = { id: decoded.id, role: decoded.role }; // Add user data to request
//     next();
//   } catch (err) {
//     console.error("verifyToken error:", err);
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// }

// export default verifyToken;

// backend/middleware/authMiddleware.js
// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  let token;

  // Prefer Authorization header
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    token = auth.split(" ")[1];
  }

  // Fallback cookie
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    console.error("verifyToken error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export default verifyToken;

