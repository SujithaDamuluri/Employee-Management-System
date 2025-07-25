// backend/index.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import favicon from "serve-favicon";


import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import employeeRoutes from "./routes/employee.js";
import employeesRoutes from "./routes/employees.js";
import departmentRoutes from "./routes/departments.js";
import managerRoutes from "./routes/managerRoutes.js";
import attendanceRoutes from "./routes/attendance.js";
import dashboardRoutes from "./routes/dashboard.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import profileRoutes from "./routes/profile.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import performanceRoutes from "./routes/performance.js";
import essRoutes from "./routes/essRoutes.js";

// ------------------------------------------------------------------
// Setup env + paths
// ------------------------------------------------------------------
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ------------------------------------------------------------------
// Favicon (safe: only mount if file exists so server doesn't crash)
// ------------------------------------------------------------------
const faviconPath = path.join(__dirname, "public", "favicon.ico");
if (fs.existsSync(faviconPath)) {
  app.use(favicon(faviconPath));
}

// ------------------------------------------------------------------
// Static assets (favicon, logos, etc.)
// ------------------------------------------------------------------
app.use(express.static(path.join(__dirname, "public")));

// ------------------------------------------------------------------
// Content Security Policy
// ------------------------------------------------------------------
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "img-src 'self' data: blob: http://localhost:8000",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "connect-src 'self' http://localhost:5173",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'self'",
    ].join("; ")
  );
  next();
});

// ------------------------------------------------------------------
// Core middleware
// ------------------------------------------------------------------
app.use(express.json());
app.use(cookieParser());

// CORS
const rawOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((s) => s.trim()).filter(Boolean)
  : [];
const allowedOrigins = [
  ...rawOrigins,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

// app.use(
//   cors({
//     origin(origin, cb) {
//       if (!origin) return cb(null, true);
//       if (allowedOrigins.includes(origin)) return cb(null, true);
//       console.warn(`CORS blocked origin: ${origin}`);
//       return cb(new Error("Not allowed by CORS"));
//     },
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: ["http://localhost:5173"], // or process.env.CLIENT_URL
    credentials: true,
  })
);

// ------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------
app.get("/", (req, res) => {
  res.send("StaffSphere API is running.");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoutes); // Moved here
app.use("/api/employees", employeesRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/ess", essRoutes);
app.use("/uploads", express.static("uploads"));


// mongoose.connect("mongodb://localhost:27017/ems", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// ------------------------------------------------------------------
// Start server after DB connection
// ------------------------------------------------------------------
const PORT = process.env.PORT || 8000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
