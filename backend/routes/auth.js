// backend/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
 import jwt from "jsonwebtoken";
import User from "../models/User.js";
// const User = require("../models/User"); // Note: No .js here, and it's 'User' (capital U) as per your model file name
const router = express.Router();
const ALLOWED_ROLES = ["HR", "EMPLOYEE", "ADMIN"]; // include ADMIN

/* ------------------- REGISTER ------------------- */
router.post("/register", async (req, res) => {
  try {
    let { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    email = email.trim().toLowerCase();
    name = name.trim();
    role = role ? role.toUpperCase() : "EMPLOYEE";
    if (!ALLOWED_ROLES.includes(role)) role = "EMPLOYEE";

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hashing done manually here (model will also hash on save; double-hash risk if we do both)
    // Because your schema has a pre-save hash hook, *do not* double hash.
    // Either:
    //   A) Let schema hash -> pass plain password here; or
    //   B) Remove schema hook & hash here.
    //
    // We'll do A) -> pass plain password; schema hashes.
    const user = await User.create({ name, email, password, role });

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    res.status(201).json({
      message: "User registered successfully.",
      user: safeUser,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res
      .status(500)
      .json({ message: "Server error during registration." });
  }
});

/* ------------------- LOGIN ------------------- */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password required." });
    }

    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Compare using bcryptjs
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // httpOnly cookie
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false, // true in prod + https
        sameSite: "Lax",
        path: "/",
      })
      .json({
        message: "Login successful.",
        token, // front-end should store this
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res
      .status(500)
      .json({ message: "Server error during login." });
  }
});

/* ------------------- CHECK AUTH (/me) ------------------- */
router.get("/me", async (req, res) => {
  try {
    // Accept cookie or Bearer header
    let token = null;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select(
      "name email role phone department createdAt updatedAt"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("ME ERROR:", error);
    res.status(401).json({ message: "Invalid token." });
  }
});

export default router;
