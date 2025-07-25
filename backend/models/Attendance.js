import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ["PRESENT", "ABSENT", "ON_LEAVE"], 
      default: "PRESENT" 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);
