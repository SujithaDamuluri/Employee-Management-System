// // backend/models/Employee.js
// import mongoose from "mongoose";

// const employeeSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },

//     // REVERTED: store department as simple text label for now
//     department: { type: String, trim: true, default: "Not Assigned" },

//     jobTitle: { type: String, default: "Employee", trim: true },
//     dateOfJoining: { type: Date, default: Date.now },
//     status: {
//       type: String,
//       enum: ["ACTIVE", "INACTIVE", "ON_LEAVE", "TERMINATED"],
//       default: "ACTIVE",
//     },
//     phone: { type: String, trim: true },
//     address: { type: String, trim: true },
//     salary: { type: Number, default: 0 },
//     avatarUrl: { type: String },

//     userRef: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Employee", employeeSchema);

import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    department: { type: String, trim: true, default: "Not Assigned" },
    jobTitle: { type: String, default: "Employee", trim: true },
    dateOfJoining: { type: Date, default: Date.now },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ON_LEAVE", "TERMINATED"],
      default: "ACTIVE",
    },

    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    salary: { type: Number, default: 0 },
    avatarUrl: { type: String },

    // ✅ ESS Profile Fields
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },

    emergencyContact: {
      name: { type: String },
      relation: { type: String },
      phone: { type: String },
    },

    profileSummary: { type: String },

    // Audit References
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
