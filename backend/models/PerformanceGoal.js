import mongoose from "mongoose";

const performanceGoalSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: false,  // <-- Made optional
    },
    title: { type: String, required: true },
    description: { type: String },
    targetDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const PerformanceGoal = mongoose.model("PerformanceGoal", performanceGoalSchema);
export default PerformanceGoal;
