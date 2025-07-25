// // backend/routes/employees.js
// import express from "express";
// import Employee from "../models/Employee.js";
// import { verifyToken } from "../middleware/authMiddleware.js";
// import { requireHR } from "../middleware/requireHR.js";

// const router = express.Router();

// /* ---------------------------------------------
//  * SUMMARY stats (total + by dept)
//  * GET /api/employees/stats/summary
//  *  ⚠ put BEFORE "/:id" to avoid route conflict
//  * ------------------------------------------- */
// router.get("/stats/summary", verifyToken, async (req, res) => {
//   try {
//     const total = await Employee.countDocuments();
//     const byDeptAgg = await Employee.aggregate([
//       { $group: { _id: "$department", count: { $sum: 1 } } },
//       { $sort: { count: -1 } },
//     ]);
//     res.json({
//       total,
//       byDepartment: byDeptAgg.map((d) => ({
//         department: d._id || "Not Assigned",
//         count: d.count,
//       })),
//     });
//   } catch (err) {
//     console.error("EMP STATS ERR:", err);
//     res.status(500).json({ message: "Server error fetching stats." });
//   }
// });

// /* ---------------------------------------------
//  * CREATE employee (HR only)
//  * POST /api/employees
//  * ------------------------------------------- */
// router.post("/", verifyToken, requireHR, async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       department,
//       jobTitle,
//       salary,
//       dateOfJoining,
//       phone,
//       address,
//       status,
//       avatarUrl,
//       userRef,
//     } = req.body;

//     if (!name || !email) {
//       return res.status(400).json({ message: "Name and email are required." });
//     }

//     const exists = await Employee.findOne({ email: email.toLowerCase() });
//     if (exists) {
//       return res.status(400).json({ message: "Employee email already exists." });
//     }

//     const employee = await Employee.create({
//       name: name.trim(),
//       email: email.trim().toLowerCase(),
//       department,
//       jobTitle,
//       salary,
//       dateOfJoining,
//       phone,
//       address,
//       status,
//       avatarUrl,
//       userRef,
//       createdBy: req.user.id,
//       updatedBy: req.user.id,
//     });

//     res.status(201).json({ message: "Employee created.", employee });
//   } catch (err) {
//     console.error("EMP CREATE ERR:", err);
//     res.status(500).json({ message: "Server error creating employee." });
//   }
// });

// /* ---------------------------------------------
//  * READ all employees (any logged-in user)
//  * GET /api/employees
//  * ------------------------------------------- */
// router.get("/", verifyToken, async (req, res) => {
//   try {
//     const employees = await Employee.find().sort({ createdAt: -1 });
//     res.json(employees);
//   } catch (err) {
//     console.error("EMP LIST ERR:", err);
//     res.status(500).json({ message: "Server error fetching employees." });
//   }
// });

// /* ---------------------------------------------
//  * READ one employee by id
//  * GET /api/employees/:id
//  * ------------------------------------------- */
// router.get("/:id", verifyToken, async (req, res) => {
//   try {
//     const emp = await Employee.findById(req.params.id);
//     if (!emp) return res.status(404).json({ message: "Employee not found." });
//     res.json(emp);
//   } catch (err) {
//     console.error("EMP GET ERR:", err);
//     res.status(500).json({ message: "Server error fetching employee." });
//   }
// });

// /* ---------------------------------------------
//  * UPDATE employee (HR only)
//  * PUT /api/employees/:id
//  * ------------------------------------------- */
// router.put("/:id", verifyToken, requireHR, async (req, res) => {
//   try {
//     const update = { ...req.body, updatedBy: req.user.id };
//     if (update.email) update.email = update.email.toLowerCase();

//     const emp = await Employee.findByIdAndUpdate(req.params.id, update, {
//       new: true,
//       runValidators: true,
//     });

//     if (!emp) return res.status(404).json({ message: "Employee not found." });

//     res.json({ message: "Employee updated.", employee: emp });
//   } catch (err) {
//     console.error("EMP UPDATE ERR:", err);
//     res.status(500).json({ message: "Server error updating employee." });
//   }
// });

// /* ---------------------------------------------
//  * DELETE employee (HR only)
//  * DELETE /api/employees/:id
//  * ------------------------------------------- */
// router.delete("/:id", verifyToken, requireHR, async (req, res) => {
//   try {
//     const emp = await Employee.findByIdAndDelete(req.params.id);
//     if (!emp) return res.status(404).json({ message: "Employee not found." });
//     res.json({ message: "Employee deleted." });
//   } catch (err) {
//     console.error("EMP DELETE ERR:", err);
//     res.status(500).json({ message: "Server error deleting employee." });
//   }
// });

// export default router;


// import express from "express";
// import Employee from "../models/Employee.js";
// import Department from "../models/Department.js";
// import verifyToken from "../middleware/authMiddleware.js";

// const router = express.Router();

// /* ----------------------------
//    GET ALL EMPLOYEES
// ---------------------------- */
// router.get("/", verifyToken, async (req, res) => {
//   try {
//     const employees = await Employee.find().populate("department");
//     res.json(employees);
//   } catch (err) {
//     console.error("GET /employees error:", err);
//     res.status(500).json({ message: "Failed to fetch employees" });
//   }
// });

// /* ----------------------------
//    ADD EMPLOYEE
// ---------------------------- */
// router.post("/", verifyToken, async (req, res) => {
//   try {
//     const { name, email, department, jobTitle, salary } = req.body;

//     const employee = await Employee.create({
//       name,
//       email,
//       department, // ObjectId of Department
//       jobTitle,
//       salary,
//     });

//     // Update department employee count
//     await Department.findByIdAndUpdate(department, { $inc: { employeesCount: 1 } });

//     res.status(201).json(employee);
//   } catch (err) {
//     console.error("POST /employees error:", err);
//     res.status(500).json({ message: "Failed to add employee" });
//   }
// });

// /* ----------------------------
//    UPDATE EMPLOYEE
// ---------------------------- */
// router.put("/:id", verifyToken, async (req, res) => {
//   try {
//     const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(employee);
//   } catch (err) {
//     console.error("PUT /employees/:id error:", err);
//     res.status(500).json({ message: "Failed to update employee" });
//   }
// });

// /* ----------------------------
//    DELETE EMPLOYEE
// ---------------------------- */
// router.delete("/:id", verifyToken, async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id);
//     if (!employee) return res.status(404).json({ message: "Employee not found" });

//     await Employee.findByIdAndDelete(req.params.id);

//     // Decrement department count
//     if (employee.department) {
//       await Department.findByIdAndUpdate(employee.department, { $inc: { employeesCount: -1 } });
//     }

//     res.json({ message: "Employee deleted" });
//   } catch (err) {
//     console.error("DELETE /employees/:id error:", err);
//     res.status(500).json({ message: "Failed to delete employee" });
//   }
// });

// export default router;

// import express from "express";
// import Employee from "../models/Employee.js";
// import Department from "../models/Department.js";
// import verifyToken from "../middleware/authMiddleware.js";

// const router = express.Router();

// /* ----------------------------
//    HELPER: Update Department Count
// ---------------------------- */
// const updateDepartmentCount = async (departmentName) => {
//   if (!departmentName) return;
//   const count = await Employee.countDocuments({ department: departmentName });
//   await Department.findOneAndUpdate(
//     { name: departmentName },
//     { employeesCount: count },
//     { new: true }
//   );
// };

// /* ----------------------------
//    GET ALL EMPLOYEES
// ---------------------------- */
// // backend/routes/employees.js
// router.get("/", verifyToken, async (req, res) => {
//   try {
//     const employees = await Employee.find().populate("department", "name _id");
//     res.json(employees);
//   } catch (err) {
//     console.error("GET /employees error:", err);
//     res.status(500).json({ message: "Failed to fetch employees" });
//   }
// });


// /* ----------------------------
//    CREATE EMPLOYEE
// ---------------------------- */
// router.post("/", verifyToken, async (req, res) => {
//   try {
//     const emp = await Employee.create(req.body);
//     await updateDepartmentCount(emp.department);
//     res.status(201).json(emp);
//   } catch (err) {
//     console.error("POST /employees error:", err);
//     res.status(500).json({ message: "Failed to create employee" });
//   }
// });

// /* ----------------------------
//    UPDATE EMPLOYEE
// ---------------------------- */
// router.put("/:id", verifyToken, async (req, res) => {
//   try {
//     const oldEmp = await Employee.findById(req.params.id);
//     const updatedEmp = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });

//     // Update counts for old and new department
//     if (oldEmp.department !== updatedEmp.department) {
//       await updateDepartmentCount(oldEmp.department);
//       await updateDepartmentCount(updatedEmp.department);
//     } else {
//       await updateDepartmentCount(updatedEmp.department);
//     }

//     res.json(updatedEmp);
//   } catch (err) {
//     console.error("PUT /employees/:id error:", err);
//     res.status(500).json({ message: "Failed to update employee" });
//   }
// });

// /* ----------------------------
//    DELETE EMPLOYEE
// ---------------------------- */
// router.delete("/:id", verifyToken, async (req, res) => {
//   try {
//     const emp = await Employee.findById(req.params.id);
//     await Employee.findByIdAndDelete(req.params.id);

//     // Update department count
//     await updateDepartmentCount(emp.department);

//     res.json({ message: "Employee deleted" });
//   } catch (err) {
//     console.error("DELETE /employees/:id error:", err);
//     res.status(500).json({ message: "Failed to delete employee" });
//   }
// });

// export default router;
// backend/routes/employees.js
// backend/routes/employees.js
// backend/routes/employees.js
// backend/routes/employees.js
// backend/routes/employees.js
import express from "express";
import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

function dbg(label, data) {
  try {
    console.log(`[employees] ${label}:`, JSON.stringify(data, null, 2));
  } catch {
    console.log(`[employees] ${label}:`, data);
  }
}

/* ---------- SUMMARY ---------- */
router.get("/stats/summary", verifyToken, async (req, res) => {
  dbg("stats req.user", req.user);
  try {
    const total = await Employee.countDocuments();
    const byDeptAgg = await Employee.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return res.json({
      total,
      byDepartment: byDeptAgg.map((d) => ({
        department: d._id || "Not Assigned",
        count: d.count,
      })),
    });
  } catch (err) {
    console.error("EMP STATS ERR:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching stats.", error: err.message });
  }
});

/* ---------- CREATE ---------- */
router.post("/", verifyToken, async (req, res) => {
  dbg("POST body", req.body);
  dbg("POST user", req.user);

  try {
    let {
      name,
      email,
      department,
      jobTitle,
      salary,
      dateOfJoining,
      phone,
      address,
      status,
      avatarUrl,
      userRef,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    email = email.trim().toLowerCase();
    name = name.trim();

    // sanitize dept to string
    if (typeof department !== "string" || !department.trim()) {
      department = "Not Assigned";
    } else {
      department = department.trim();
    }

    // salary
    salary = salary ? Number(salary) : 0;

    // optional refs -- only set if valid ObjectId
    const safeUserRef =
      userRef && mongoose.isValidObjectId(userRef) ? userRef : undefined;
    const safeCreatedBy =
      req.user?.id && mongoose.isValidObjectId(req.user.id)
        ? req.user.id
        : undefined;

    const exists = await Employee.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Employee email already exists." });
    }

    const employee = await Employee.create({
      name,
      email,
      department,
      jobTitle,
      salary,
      dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : undefined,
      phone,
      address,
      status,
      avatarUrl,
      userRef: safeUserRef,
      createdBy: safeCreatedBy,
      updatedBy: safeCreatedBy,
    });

    return res.status(201).json({ message: "Employee created.", employee });
  } catch (err) {
    console.error("EMP CREATE ERR:", err);
    if (err?.code === 11000) {
      return res
        .status(400)
        .json({ message: "Employee email already exists." });
    }
    return res
      .status(500)
      .json({ message: "Server error creating employee.", error: err.message });
  }
});

/* ---------- LIST ---------- */
router.get("/", verifyToken, async (req, res) => {
  dbg("LIST user", req.user);
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    return res.json(employees);
  } catch (err) {
    console.error("EMP LIST ERR:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching employees.", error: err.message });
  }
});

/* ---------- GET ONE ---------- */
router.get("/:id", verifyToken, async (req, res) => {
  dbg("GET one id", req.params.id);
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: "Employee not found." });
    return res.json(emp);
  } catch (err) {
    console.error("EMP GET ERR:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching employee.", error: err.message });
  }
});

/* ---------- UPDATE ---------- */
router.put("/:id", verifyToken, async (req, res) => {
  dbg("UPDATE id", req.params.id);
  dbg("UPDATE body", req.body);
  try {
    const update = { ...req.body, updatedBy: req.user?.id };

    if (update.email) update.email = update.email.toLowerCase();
    if (typeof update.department === "string") {
      update.department = update.department.trim() || "Not Assigned";
    }

    const emp = await Employee.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!emp) return res.status(404).json({ message: "Employee not found." });
    return res.json({ message: "Employee updated.", employee: emp });
  } catch (err) {
    console.error("EMP UPDATE ERR:", err);
    if (err?.code === 11000) {
      return res
        .status(400)
        .json({ message: "Duplicate email not allowed." });
    }
    return res
      .status(500)
      .json({ message: "Server error updating employee.", error: err.message });
  }
});

/* ---------- DELETE ---------- */
router.delete("/:id", verifyToken, async (req, res) => {
  dbg("DELETE id", req.params.id);
  try {
    const emp = await Employee.findByIdAndDelete(req.params.id);
    if (!emp) return res.status(404).json({ message: "Employee not found." });
    return res.json({ message: "Employee deleted." });
  } catch (err) {
    console.error("EMP DELETE ERR:", err);
    return res
      .status(500)
      .json({ message: "Server error deleting employee.", error: err.message });
  }
});

export default router;
