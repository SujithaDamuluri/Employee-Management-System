import express from "express";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------ */
function startEndOfDay(dateLike = new Date()) {
  const start = new Date(dateLike);
  start.setHours(0, 0, 0, 0);
  const end = new Date(dateLike);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/* ------------------------------------------------------------------
   GET /api/attendance
   Return all attendance records (populated) sorted newest first.
   <-- This is what your Attendance.jsx expects
------------------------------------------------------------------ */
router.get("/", verifyToken, async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("employee", "name department")
      .sort({ date: -1, createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error("GET /attendance error:", err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
});

/* ------------------------------------------------------------------
   POST /api/attendance
   Mark attendance for an employee for *today*. (Primary endpoint used by UI.)
   Body: { employeeId, status }
   Accepts PRESENT | ABSENT | ON_LEAVE (validate lightly)
------------------------------------------------------------------ */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { employeeId, status = "PRESENT" } = req.body;
    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required." });
    }

    // Ensure employee exists (optional but good)
    const emp = await Employee.findById(employeeId);
    if (!emp) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const allowed = ["PRESENT", "ABSENT", "ON_LEAVE"];
    const safeStatus = allowed.includes(status) ? status : "PRESENT";

    // Prevent duplicate for same day
    const { start, end } = startEndOfDay(new Date());
    const existing = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: start, $lte: end },
    });

    if (existing) {
      // If you prefer update instead of reject: uncomment below and comment out error
      // existing.status = safeStatus;
      // await existing.save();
      // return res.json(existing);
      return res
        .status(400)
        .json({ message: "Attendance already marked for today." });
    }

    const attendance = await Attendance.create({
      employee: employeeId,
      status: safeStatus,
      date: new Date(),
    });

    const populated = await attendance.populate("employee", "name department");
    res.status(201).json(populated);
  } catch (err) {
    console.error("POST /attendance error:", err);
    res.status(500).json({ message: "Failed to mark attendance" });
  }
});

/* ------------------------------------------------------------------
   POST /api/attendance/mark  (Alias)
   Same as POST /api/attendance — kept for compatibility if needed.
------------------------------------------------------------------ */
router.post("/mark", verifyToken, async (req, res) => {
  // Re-use primary handler logic by forwarding
  req.url = "/"; // trick express seldom; instead just duplicate minimal logic:
  try {
    const { employeeId, status = "PRESENT" } = req.body;
    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required." });
    }

    const emp = await Employee.findById(employeeId);
    if (!emp) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const allowed = ["PRESENT", "ABSENT", "ON_LEAVE"];
    const safeStatus = allowed.includes(status) ? status : "PRESENT";

    const { start, end } = startEndOfDay(new Date());
    const existing = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: start, $lte: end },
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Attendance already marked for today." });
    }

    const attendance = await Attendance.create({
      employee: employeeId,
      status: safeStatus,
      date: new Date(),
    });

    const populated = await attendance.populate("employee", "name department");
    res.status(201).json(populated);
  } catch (err) {
    console.error("POST /attendance/mark error:", err);
    res.status(500).json({ message: "Failed to mark attendance" });
  }
});

/* ------------------------------------------------------------------
   GET /api/attendance/stats/overview
   Monthly counts of PRESENT records.
------------------------------------------------------------------ */
router.get("/stats/overview", verifyToken, async (req, res) => {
  try {
    const stats = await Attendance.aggregate([
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          presentCount: {
            $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] },
          },
          totalMarked: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    res.json(stats);
  } catch (err) {
    console.error("GET /attendance/stats/overview error:", err);
    res.status(500).json({ message: "Failed to fetch attendance stats" });
  }
});

/* ------------------------------------------------------------------
   GET /api/attendance/stats/percentage/:employeeId
   % present for that employee (all historical records).
------------------------------------------------------------------ */
router.get("/stats/percentage/:employeeId", verifyToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const totalDays = await Attendance.countDocuments({ employee: employeeId });
    const presentDays = await Attendance.countDocuments({
      employee: employeeId,
      status: "PRESENT",
    });
    const percentage = totalDays
      ? ((presentDays / totalDays) * 100).toFixed(2)
      : "0.00";
    res.json({ employeeId, totalDays, presentDays, percentage });
  } catch (err) {
    console.error("GET /attendance/stats/percentage error:", err);
    res.status(500).json({ message: "Failed to calculate attendance %" });
  }
});

/* ------------------------------------------------------------------
   GET /api/attendance/:employeeId
   All records for a single employee.
   IMPORTANT: put AFTER /stats routes to avoid route clash.
------------------------------------------------------------------ */
router.get("/:employeeId", verifyToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const records = await Attendance.find({ employee: employeeId })
      .populate("employee", "name department")
      .sort({ date: -1, createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error("GET /attendance/:employeeId error:", err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
});

export default router;
