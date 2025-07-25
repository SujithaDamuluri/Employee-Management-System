// backend/routes/essRoutes.js

import express from "express";
import { getMyProfile, updateMyProfile } from "../controllers/essController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // Ensure login/auth middleware is present

const router = express.Router();

router.get("/me", verifyToken, getMyProfile);
router.put("/me", verifyToken, updateMyProfile);

export default router;
