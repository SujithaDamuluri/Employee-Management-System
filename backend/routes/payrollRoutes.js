import express from "express";
import Payroll from "../models/Payroll.js";
import Employee from "../models/Employee.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

/* -------- GET ALL PAYROLLS -------- */
router.get("/", verifyToken, async (req, res) => {
  try {
    const payrolls = await Payroll.find().sort({ createdAt: -1 });
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching payrolls.", error: err.message });
  }
});

/* -------- CREATE PAYROLL -------- */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { employeeId, month, basicPay, deductions, netPay } = req.body;
    if (!employeeId || !month || !basicPay) {
      return res.status(400).json({ message: "Employee, month, and basic pay are required." });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found." });

    const payroll = await Payroll.create({
      employeeId,
      employeeName: employee.name,
      month,
      basicPay,
      deductions,
      netPay,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    res.status(201).json(payroll);
  } catch (err) {
    res.status(500).json({ message: "Error creating payroll.", error: err.message });
  }
});

/* -------- UPDATE PAYROLL -------- */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!payroll) return res.status(404).json({ message: "Payroll not found." });
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: "Error updating payroll.", error: err.message });
  }
});

/* -------- APPROVE PAYROLL -------- */
router.patch("/:id/approve", verifyToken, async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { status: "Processed" },
      { new: true }
    );
    if (!payroll) return res.status(404).json({ message: "Payroll not found." });
    res.json({ message: "Payroll approved.", payroll });
  } catch (err) {
    res.status(500).json({ message: "Error approving payroll.", error: err.message });
  }
});

/* -------- DELETE PAYROLL -------- */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) return res.status(404).json({ message: "Payroll not found." });
    res.json({ message: "Payroll deleted." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting payroll.", error: err.message });
  }
});

export default router;
