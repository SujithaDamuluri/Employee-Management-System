// backend/models/PerformanceReview.js
import mongoose from "mongoose";

const performanceReviewSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: false, // relaxed for now
    },
    reviewer: {
      type: String,
      required: false, // relaxed so backend fallback works
      default: "System",
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
      default: 3,
    },
    comments: { type: String, default: "" },
  },
  { timestamps: true }
);

const PerformanceReview = mongoose.model(
  "PerformanceReview",
  performanceReviewSchema
);

export default PerformanceReview;
