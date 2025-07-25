// import mongoose from "mongoose";

// const leaveSchema = new mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     startDate: { type: Date, required: true },
//     endDate: { type: Date, required: true },
//     reason: { type: String, required: true, trim: true },
//     status: {
//       type: String,
//       enum: ["PENDING", "APPROVED", "REJECTED"],
//       default: "PENDING",
//     },
//     approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Leave", leaveSchema);
import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    type: {
      type: String,
      enum: ["CASUAL", "SICK", "EARNED", "UNPAID", "OTHER"],
      default: "CASUAL",
    },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    reason: { type: String, trim: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Leave", leaveSchema);
