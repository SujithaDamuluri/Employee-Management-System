// import express from "express";
// import User from "../models/User.js";
// import jwt from "jsonwebtoken";

// const router = express.Router();

// // Middleware to authenticate
// const authMiddleware = (req, res, next) => {
//   const token = req.cookies?.token;
//   if (!token) return res.status(401).json({ message: "Not authenticated" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.userId = decoded.id;
//     next();
//   } catch {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

// // Get logged-in employee profile
// router.get("/me", async (req, res) => {
//   try {
//     const token = req.cookies.token;
//     if (!token) return res.status(401).json({ message: "Not authenticated" });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id).select("-password");
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // Update employee profile
// router.put("/update", authMiddleware, async (req, res) => {
//   try {
//     const { name, phone, address, department } = req.body;
//     const updatedUser = await User.findByIdAndUpdate(
//       req.userId,
//       { name, phone, address, department },
//       { new: true }
//     ).select("-password");

//     res.json({ message: "Profile updated successfully", user: updatedUser });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// });

// export default router;
// backend/routes/employee.js
// import express from "express";
// import User from "../models/User.js";
// import { verifyToken } from "../middleware/authMiddleware.js";  // <-- fixed import
// import Employee from "../models/Employee.js";

// const router = express.Router();

// /**
//  * GET /api/employee/profile
//  * Return current logged-in user (minus password).
//  */
// router.get("/profile", verifyToken, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");
//     if (!user) return res.status(404).json({ message: "User not found" });
//     res.json(user);
//   } catch (error) {
//     console.error("PROFILE GET error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /**
//  * PUT /api/employee/profile
//  * Update current user's name/email/department/phone/address.
//  */

// router.post("/", verifyToken, async (req, res) => {
//   try {
//     const { name, email, department, jobTitle, salary } = req.body;
//     if (!name || !email) {
//       return res.status(400).json({ message: "Name and Email are required" });
//     }
//     const employee = new Employee({ name, email, department, jobTitle, salary });
//     await employee.save();
//     res.status(201).json({ message: "Employee added successfully", employee });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// }); 
// router.get("/", verifyToken, async (req, res) => {
//   try {
//     const employees = await Employee.find();
//     res.json(employees);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });
// router.put("/profile", verifyToken, async (req, res) => {
//   try {
//     const { name, email, department, phone, address } = req.body;

//     // Only update provided fields
//     const update = {};
//     if (name !== undefined) update.name = name;
//     if (email !== undefined) update.email = email.toLowerCase();
//     if (department !== undefined) update.department = department;
//     if (phone !== undefined) update.phone = phone;
//     if (address !== undefined) update.address = address;

//     const updated = await User.findByIdAndUpdate(req.user.id, update, {
//       new: true,
//       runValidators: true,
//     }).select("-password");

//     if (!updated) return res.status(404).json({ message: "User not found" });

//     res.json(updated);
//   } catch (error) {
//     console.error("PROFILE PUT error:", error);
//     res.status(500).json({ message: "Failed to update profile" });
//   }
// });

// export default router;

// backend/routes/employee.js
import express from "express";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/employee/profile
 * Get logged-in user's own profile (User document).
 */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("PROFILE GET error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/employee/profile
 * Update own profile fields.
 */
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, email, department, phone, address } = req.body;

    const update = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email.toLowerCase();
    if (department !== undefined) update.department = department;
    if (phone !== undefined) update.phone = phone;
    if (address !== undefined) update.address = address;

    const updated = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json(updated);
  } catch (error) {
    console.error("PROFILE PUT error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;


