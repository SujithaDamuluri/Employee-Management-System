// backend/models/Project.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Completed", "Ongoing", "Pending"],
      default: "Pending",
      index: true,
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    // optional: track which employees are on the project
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
