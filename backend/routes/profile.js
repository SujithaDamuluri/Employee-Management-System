// import express from "express";
// import User from "../models/User.js";
// import multer from "multer";
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from "fs";

// const router = express.Router();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Uploads folder
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadPath = path.join(__dirname, "../uploads");
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath);
//     }
//     cb(null, uploadPath);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + path.extname(file.originalname);
//     cb(null, `${file.fieldname}-${uniqueSuffix}`);
//   },
// });
// const upload = multer({ storage });

// // Get profile
// router.get("/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select("-password");
//     if (!user) return res.status(404).json({ error: "User not found" });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Update profile
// router.put("/:id", upload.single("profileImage"), async (req, res) => {
//   try {
//     const updatedFields = req.body;

//     if (req.file) {
//       updatedFields.profileImage = `/uploads/${req.file.filename}`;
//     }

//     const user = await User.findByIdAndUpdate(req.params.id, updatedFields, {
//       new: true,
//     }).select("-password");

//     if (!user) return res.status(404).json({ error: "User not found" });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;

import express from "express";
import multer from "multer";
import path from "path";
import bcrypt from "bcryptjs";
import Employee from "../models/Employee.js";
import authMiddleware from "../middleware/authMiddleware.js";

import { fileURLToPath } from "url";
import { dirname } from "path";

const router = express.Router();

// Setup for __dirname since ES module doesn't have it
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ========== Image Upload Setup ==========
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/profileImages/"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// ========== GET Profile ==========
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await Employee.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========== PUT Update Profile ==========
router.put("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const user = await Employee.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const fields = [
      "name", "email", "phone", "designation",
      "department", "address", "dob", "gender",
      "language", "theme"
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    if (req.file) {
      user.image = `/uploads/profileImages/${req.file.filename}`;
    }

    await user.save();
    const updatedUser = await Employee.findById(req.user.id).select("-password");
    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ========== PUT Change Password ==========
router.put("/profile/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await Employee.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Incorrect current password" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;


