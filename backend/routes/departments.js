import express from "express";
import Department from "../models/Department.js";
import Employee from "../models/Employee.js"; // We'll count employees here
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

/* ----------------------------
   GET ALL DEPARTMENTS
---------------------------- */
router.get("/", verifyToken, async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    console.error("GET /departments error:", err);
    res.status(500).json({ message: "Failed to fetch departments" });
  }
});

/* ----------------------------
   CREATE A DEPARTMENT
---------------------------- */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, manager } = req.body;

    const dept = await Department.create({
      name,
      manager,
      employeesCount: 0, // Start with 0
    });

    res.status(201).json(dept);
  } catch (err) {
    console.error("POST /departments error:", err);
    res.status(500).json({ message: "Failed to create department" });
  }
});

/* ----------------------------
   UPDATE A DEPARTMENT
---------------------------- */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { name, manager } = req.body;

    const dept = await Department.findByIdAndUpdate(
      req.params.id,
      { name, manager },
      { new: true }
    );

    res.json(dept);
  } catch (err) {
    console.error("PUT /departments/:id error:", err);
    res.status(500).json({ message: "Failed to update department" });
  }
});

/* ----------------------------
   DELETE A DEPARTMENT
---------------------------- */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: "Department deleted" });
  } catch (err) {
    console.error("DELETE /departments/:id error:", err);
    res.status(500).json({ message: "Failed to delete department" });
  }
});

/* ----------------------------
   REFRESH EMPLOYEE COUNTS
---------------------------- */
router.get("/refresh-counts", verifyToken, async (req, res) => {
  try {
    const departments = await Department.find();

    for (const dept of departments) {
      const count = await Employee.countDocuments({ department: dept._id }); // Count by ObjectId
      dept.employeesCount = count;
      await dept.save();
    }

    res.json({ message: "Employee counts refreshed successfully" });
  } catch (err) {
    console.error("REFRESH /departments error:", err);
    res.status(500).json({ message: "Failed to refresh employee counts" });
  }
});

/* --------------------------------
   DEPARTMENT STATS (for charts)
---------------------------------- */
router.get("/stats", verifyToken, async (req, res) => {
  try {
    // Fetch all departments and count employees for each
    const stats = await Department.aggregate([
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "department",
          as: "employees",
        },
      },
      {
        $project: {
          name: 1,
          manager: 1,
          employeesCount: { $size: "$employees" },
        },
      },
    ]);

    res.json(stats);
  } catch (err) {
    console.error("GET /departments/stats error:", err);
    res.status(500).json({ message: "Failed to fetch department stats" });
  }
});


export default router;
