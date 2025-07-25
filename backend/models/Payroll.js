import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    employeeName: { type: String, required: true },
    month: { type: String, required: true }, // e.g., 2025-07
    basicPay: { type: Number, required: true },
    deductions: { type: Number, default: 0 },
    netPay: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Processed"],
      default: "Pending",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Payroll", payrollSchema);
