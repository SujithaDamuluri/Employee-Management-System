import mongoose from "mongoose";

const PerformanceCycleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "completed"], default: "active" }
  },
  { timestamps: true }
);

const PerformanceCycle = mongoose.model("PerformanceCycle", PerformanceCycleSchema);
export default PerformanceCycle;
