// import express from "express";
// import Leave from "../models/Leave.js";
// import verifyToken from "../middleware/authMiddleware.js";

// const router = express.Router();

// /* ---------- APPLY FOR LEAVE ---------- */
// router.post("/", verifyToken, async (req, res) => {
//   try {
//     const { startDate, endDate, reason } = req.body;
//     if (!startDate || !endDate || !reason) {
//       return res.status(400).json({ message: "All fields are required." });
//     }

//     const leave = await Leave.create({
//       user: req.user.id,
//       startDate,
//       endDate,
//       reason,
//     });

//     res.status(201).json({ message: "Leave applied successfully.", leave });
//   } catch (err) {
//     console.error("LEAVE CREATE ERR:", err);
//     res.status(500).json({ message: "Server error while applying leave." });
//   }
// });

// /* ---------- GET ALL LEAVES (Admin/HR) ---------- */
// router.get("/", verifyToken, async (req, res) => {
//   try {
//     const leaves = await Leave.find()
//       .populate("user", "name email")
//       .sort({ createdAt: -1 });
//     res.json(leaves);
//   } catch (err) {
//     console.error("LEAVE LIST ERR:", err);
//     res.status(500).json({ message: "Server error fetching leaves." });
//   }
// });

// /* ---------- APPROVE OR REJECT LEAVE ---------- */
// router.put("/:id/status", verifyToken, async (req, res) => {
//   try {
//     const { status } = req.body;
//     if (!["APPROVED", "REJECTED"].includes(status)) {
//       return res.status(400).json({ message: "Invalid status." });
//     }

//     const leave = await Leave.findByIdAndUpdate(
//       req.params.id,
//       { status, approvedBy: req.user.id },
//       { new: true }
//     );

//     if (!leave) return res.status(404).json({ message: "Leave not found." });

//     res.json({ message: `Leave ${status.toLowerCase()}.`, leave });
//   } catch (err) {
//     console.error("LEAVE STATUS ERR:", err);
//     res.status(500).json({ message: "Server error updating leave status." });
//   }
// });

// export default router;

import express from "express";
import Leave from "../models/Leave.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE Leave
router.post("/", verifyToken, async (req, res) => {
  try {
    const { employee, type, from, to, reason } = req.body;
    if (!employee || !from || !to) {
      return res.status(400).json({ message: "Employee, from, and to are required." });
    }

    const leave = await Leave.create({
      employee,
      type,
      from: new Date(from),
      to: new Date(to),
      reason,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    res.status(201).json({ message: "Leave request created.", leave });
  } catch (err) {
    console.error("LEAVE CREATE ERR:", err);
    res.status(500).json({ message: "Server error creating leave.", error: err.message });
  }
});

// GET All Leaves (with employee details)
router.get("/", verifyToken, async (req, res) => {
  try {
    const leaves = await Leave.find().populate("employee", "name email department");
    res.json(leaves);
  } catch (err) {
    console.error("LEAVE LIST ERR:", err);
    res.status(500).json({ message: "Error fetching leaves", error: err.message });
  }
});

// GET Single Leave
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate("employee");
    if (!leave) return res.status(404).json({ message: "Leave not found" });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leave", error: err.message });
  }
});

// UPDATE Leave
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    );
    if (!leave) return res.status(404).json({ message: "Leave not found" });
    res.json({ message: "Leave updated", leave });
  } catch (err) {
    res.status(500).json({ message: "Error updating leave", error: err.message });
  }
});

// DELETE Leave
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });
    res.json({ message: "Leave deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting leave", error: err.message });
  }
});

export default router;

