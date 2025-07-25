// backend/routes/dashboard.js
import express from "express";
import Employee from "../models/Employee.js";
import Project from "../models/Project.js";
import Notification from "../models/Notification.js";
import Attendance from "../models/Attendance.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Summary counts for dashboard cards + project status breakdown.
 */
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const [totalEmployees, totalProjects, totalNotifications] = await Promise.all([
      Employee.countDocuments(),
      Project.countDocuments(),
      Notification.countDocuments(),
    ]);

    // Attendance percent = employees who have ANY attendance record today / total employees
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendanceMarkedToday = await Attendance.countDocuments({
      date: { $gte: today },
      status: "PRESENT", // change to remove filter if you want any status to count
    });
    const attendancePercent = totalEmployees
      ? Math.round((attendanceMarkedToday / totalEmployees) * 100)
      : 0;

    // Project status breakdown (for pie chart)
    const projAgg = await Project.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    const projectBreakdown = ["Completed", "Ongoing", "Pending"].map((label) => {
      const found = projAgg.find((p) => p._id === label);
      return { name: label, value: found ? found.count : 0 };
    });

    res.json({
      employees: totalEmployees,
      projects: totalProjects,
      notifications: totalNotifications,
      attendancePercent,
      projectBreakdown,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

export default router;
