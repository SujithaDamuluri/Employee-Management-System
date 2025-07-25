// backend/models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ["info", "warning", "alert"],
      default: "info",
    },
    read: { type: Boolean, default: false },
    // optional targeting
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
