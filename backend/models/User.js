import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "employee" },
    department: { type: String },
    profileImage: { type: String },
    phone: { type: String },
    address: { type: String },
    language: { type: String },
    theme: { type: String, default: "light" },
    dob: { type: Date },
    gender: { type: String },
    activityTimeline: [
      {
        activity: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
