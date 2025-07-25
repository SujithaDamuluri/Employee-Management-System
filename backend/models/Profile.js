// backend/routes/profile.js
import express from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import Employee from "../models/Employee.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { updatePassword } from "../controllers/profileController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// ========== Image Upload Setup ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });
router.put("/update-password", authMiddleware, updatePassword);
// ========== View Profile ==========
router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const user = await Employee.findById(userId).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// ========== Update Profile ==========
router.put("/", verifyToken, upload.single("image"), async (req, res) => {
  const userId = req.user.id;
  const updates = req.body;

  if (req.file) {
    updates.image = `/uploads/${req.file.filename}`;
  }

  const user = await Employee.findByIdAndUpdate(userId, updates, {
    new: true,
  }).select("-password");

  res.json(user);
});

// ========== Change Password ==========
router.put("/change-password", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  const user = await Employee.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.json({ message: "Password updated successfully" });
});

export default router;
