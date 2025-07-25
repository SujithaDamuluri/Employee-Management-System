// backend/controllers/essController.js

import Employee from "../models/Employee.js";

// 🔍 Get Logged-in Employee's Profile
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const employee = await Employee.findOne({ userRef: userId });

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✏️ Update Own Profile
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const employee = await Employee.findOne({ userRef: userId });

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    const allowedFields = [
      "phone",
      "address",
      "avatarUrl",
      "dob",
      "gender",
      "emergencyContact",
      "profileSummary",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        employee[field] = req.body[field];
      }
    });

    employee.updatedBy = userId;

    await employee.save();

    res.status(200).json({ message: "Profile updated successfully", employee });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
