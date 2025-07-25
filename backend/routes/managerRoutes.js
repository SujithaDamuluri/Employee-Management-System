import express from "express";
import Employee from "../models/Employee.js";
import Department from "../models/Department.js";
import User from "../models/User.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

/* ----------------------------
   MANAGER INSIGHTS DATA
---------------------------- */
router.get("/insights", verifyToken, async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const totalManagers = await User.countDocuments({ role: "HR" });

    // For demo: top 5 employees by salary
    const topEmployees = await Employee.find()
      .sort({ salary: -1 })
      .limit(5)
      .select("name department salary");

    res.json({
      totalEmployees,
      totalDepartments,
      totalManagers,
      topEmployees,
    });
  } catch (err) {
    console.error("INSIGHTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch manager insights" });
  }
});

export default router;
