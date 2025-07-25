import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    manager: { type: String, default: "" },
    employeesCount: { type: Number, default: 0 }, // Auto-calculated
  },
  { timestamps: true }
);

export default mongoose.model("Department", departmentSchema);
