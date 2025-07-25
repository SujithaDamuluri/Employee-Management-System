// backend/seedUser.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

async function seedUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing users (optional, for fresh start)
    // await User.deleteMany();

    // Create sample users
    const passwordHash = await bcrypt.hash("123456", 10);

    const hrUser = await User.create({
      name: "HR Admin",
      email: "hr@company.com",
      password: passwordHash,
      role: "HR",
    });

    const employeeUser = await User.create({
      name: "John Employee",
      email: "john@company.com",
      password: passwordHash,
      role: "EMPLOYEE",
    });

    console.log("Seeded users:", hrUser.email, employeeUser.email);
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedUser();
