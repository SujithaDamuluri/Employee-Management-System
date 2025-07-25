// // frontend/src/pages/Employees.jsx
// import React, { useEffect, useState, useMemo } from "react";
// import api from "../utils/api";
// import Layout from "../components/Layout";
// import {
//   FaPlus,
//   FaTrash,
//   FaEdit,
//   FaSearch,
//   FaUsers,
//   FaBuilding,
//   FaRupeeSign,
//   FaRegClock,
// } from "react-icons/fa";

// /**
//  * Employees Page (Card Grid Edition)
//  * - StatsSection (total, departments, avg salary, new this month)
//  * - Search filter
//  * - Add/Edit employee form (toggle)
//  * - Responsive card grid
//  * - Pagination
//  */
// export default function Employees() {
//   const [employees, setEmployees] = useState([]);
//   const [stats, setStats] = useState({ total: 0, byDepartment: [] });

//   // UI state
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // Search/filter
//   const [search, setSearch] = useState("");

//   // Add/Edit Form state
//   const [showForm, setShowForm] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState(blankForm());

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const CARDS_PER_PAGE = 6;

//   /* ---------------- utilities ---------------- */
//   function blankForm() {
//     return {
//       name: "",
//       email: "",
//       department: "",
//       jobTitle: "",
//       salary: "",
//       dateOfJoining: "",
//     };
//   }

//   const resetAlerts = () => {
//     setError("");
//     setSuccess("");
//   };

//   const startAdd = () => {
//     resetAlerts();
//     setEditing(null);
//     setForm(blankForm());
//     setShowForm(true);
//   };

//   const startEdit = (emp) => {
//     resetAlerts();
//     setEditing(emp);
//     setForm({
//       name: emp.name ?? "",
//       email: emp.email ?? "",
//       department: emp.department ?? "",
//       jobTitle: emp.jobTitle ?? "",
//       salary: emp.salary ?? "",
//       dateOfJoining: emp.dateOfJoining
//         ? emp.dateOfJoining.slice(0, 10) // YYYY-MM-DD
//         : "",
//     });
//     setShowForm(true);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((p) => ({ ...p, [name]: value }));
//   };

//   /* ---------------- load data ---------------- */
//   useEffect(() => {
//     async function load() {
//       try {
//         setLoading(true);
//         const [statsRes, empRes] = await Promise.all([
//           api.get("/employees/stats/summary"),
//           api.get("/employees"),
//         ]);
//         setStats(statsRes.data);
//         setEmployees(empRes.data || []);
//       } catch (err) {
//         console.error("Employees load error:", err);
//         setError(
//           err?.response?.data?.message || "Failed to load employees data."
//         );
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//   }, []);

//   /* ---------------- derived: filtered list ---------------- */
//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return employees;
//     return employees.filter((e) => {
//       const dept = e.department?.toLowerCase() || "";
//       const name = e.name?.toLowerCase() || "";
//       const email = e.email?.toLowerCase() || "";
//       return (
//         dept.includes(q) ||
//         name.includes(q) ||
//         email.includes(q) ||
//         (e.jobTitle?.toLowerCase() || "").includes(q)
//       );
//     });
//   }, [search, employees]);

//   /* ---------------- derived: pagination slice ---------------- */
//   const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE) || 1;
//   const pageSafe = Math.min(currentPage, totalPages);
//   const indexOfLast = pageSafe * CARDS_PER_PAGE;
//   const indexOfFirst = indexOfLast - CARDS_PER_PAGE;
//   const pageEmployees = filtered.slice(indexOfFirst, indexOfLast);

//   /* ---------------- derived: stats extras ---------------- */
//   const computedStats = useMemo(() => {
//     // total from backend for consistency, fallback to employees length
//     const total = stats.total || employees.length;

//     // dept count
//     const deptSet = new Set(
//       employees
//         .map((e) => (e.department ? e.department.trim() : "Not Assigned"))
//         .filter(Boolean)
//     );
//     const deptCount = deptSet.size;

//     // avg salary
//     const numericSalaries = employees
//       .map((e) => Number(e.salary))
//       .filter((n) => !isNaN(n) && n > 0);
//     const avgSalary =
//       numericSalaries.length > 0
//         ? Math.round(
//             numericSalaries.reduce((sum, v) => sum + v, 0) / numericSalaries.length
//           )
//         : null;

//     // new this month (last 30 days)
//     const now = Date.now();
//     const THIRTY = 1000 * 60 * 60 * 24 * 30;
//     const newThisMonth = employees.filter((e) => {
//       const dt =
//         e.dateOfJoining ??
//         e.createdAt ??
//         e.updatedAt; // fallback to any timestamp if missing
//       if (!dt) return false;
//       const t = new Date(dt).getTime();
//       return now - t <= THIRTY;
//     }).length;

//     return { total, deptCount, avgSalary, newThisMonth };
//   }, [stats.total, employees]);

//   /* ---------------- submit add / update ---------------- */
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     resetAlerts();

//     if (!form.name.trim() || !form.email.trim()) {
//       return setError("Name and Email are required.");
//     }

//     const payload = {
//       name: form.name.trim(),
//       email: form.email.trim().toLowerCase(),
//       department: form.department.trim(),
//       jobTitle: form.jobTitle.trim(),
//       salary: form.salary ? Number(form.salary) : 0,
//       dateOfJoining: form.dateOfJoining || undefined,
//     };

//     try {
//       setSaving(true);
//       if (editing) {
//         await api.put(`/employees/${editing._id}`, payload);
//         setSuccess("Employee updated.");
//       } else {
//         await api.post("/employees", payload);
//         setSuccess("Employee added.");
//       }
//       // reload
//       const [statsRes, empRes] = await Promise.all([
//         api.get("/employees/stats/summary"),
//         api.get("/employees"),
//       ]);
//       setStats(statsRes.data);
//       setEmployees(empRes.data || []);
//       setEditing(null);
//       setShowForm(false);
//       setForm(blankForm());
//     } catch (err) {
//       console.error("Save employee error:", err);
//       setError(err?.response?.data?.message || "Failed to save employee.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* ---------------- delete ---------------- */
//   const handleDelete = async (id) => {
//     resetAlerts();
//     if (!window.confirm("Delete this employee?")) return;
//     try {
//       await api.delete(`/employees/${id}`);
//       setSuccess("Employee deleted.");
//       // refresh
//       const [statsRes, empRes] = await Promise.all([
//         api.get("/employees/stats/summary"),
//         api.get("/employees"),
//       ]);
//       setStats(statsRes.data);
//       setEmployees(empRes.data || []);
//     } catch (err) {
//       console.error("Delete error:", err);
//       setError(err?.response?.data?.message || "Failed to delete employee.");
//     }
//   };

//   /* ---------------- render ---------------- */
//   return (
//     <Layout pageTitle="Employees">
//       {/* Stats Section */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
//         <StatsCard
//           label="Total Employees"
//           value={computedStats.total}
//           icon={<FaUsers />}
//           bg="bg-[#819A91]"
//         />
//         <StatsCard
//           label="Departments"
//           value={computedStats.deptCount}
//           icon={<FaBuilding />}
//           bg="bg-[#A7C1A8]"
//         />
//         <StatsCard
//           label="Avg Salary"
//           value={
//             computedStats.avgSalary !== null
//               ? `₹${computedStats.avgSalary.toLocaleString()}`
//               : "—"
//           }
//           icon={<FaRupeeSign />}
//           bg="bg-[#D1D8BE]"
//           text="text-[#2d3e40]"
//         />
//         <StatsCard
//           label="New This Month"
//           value={computedStats.newThisMonth}
//           icon={<FaRegClock />}
//           bg="bg-[#EEEFE0]"
//           text="text-[#2d3e40]"
//         />
//       </div>

//       {/* Controls Row */}
//       <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
//         <div className="relative w-full md:w-72">
//           <FaSearch className="absolute top-3 left-3 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search name, email, dept..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-[#819A91]"
//           />
//         </div>

//         <button
//           type="button"
//           onClick={startAdd}
//           className="self-end md:self-auto bg-[#819A91] text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-[#A7C1A8] transition"
//         >
//           <FaPlus /> Add Employee
//         </button>
//       </div>

//       {/* Alerts */}
//       {error && (
//         <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded mb-6 w-full">
//           {error}
//         </div>
//       )}
//       {success && (
//         <div className="bg-green-100 text-green-700 border border-green-300 px-4 py-2 rounded mb-6 w-full">
//           {success}
//         </div>
//       )}

//       {/* Form (collapsible) */}
//       {showForm && (
//         <div className="mb-10 bg-white rounded-xl shadow p-6 animate-fadeIn">
//           <h2 className="text-2xl font-semibold mb-4 text-[#819A91]">
//             {editing ? "Edit Employee" : "Add Employee"}
//           </h2>
//           <form
//             onSubmit={handleSubmit}
//             className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
//           >
//             <input
//               name="name"
//               value={form.name}
//               onChange={handleChange}
//               placeholder="Name *"
//               className="p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
//               required
//             />
//             <input
//               type="email"
//               name="email"
//               value={form.email}
//               onChange={handleChange}
//               placeholder="Email *"
//               className="p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
//               required
//             />
//             <input
//               name="department"
//               value={form.department}
//               onChange={handleChange}
//               placeholder="Department"
//               className="p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
//             />
//             <input
//               name="jobTitle"
//               value={form.jobTitle}
//               onChange={handleChange}
//               placeholder="Job Title"
//               className="p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
//             />
//             <input
//               type="number"
//               name="salary"
//               value={form.salary}
//               onChange={handleChange}
//               placeholder="Salary"
//               className="p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
//             />
//             <input
//               type="date"
//               name="dateOfJoining"
//               value={form.dateOfJoining}
//               onChange={handleChange}
//               className="p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
//             />

//             {/* Buttons */}
//             <div className="col-span-full flex gap-3 justify-end mt-2">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowForm(false);
//                   setEditing(null);
//                 }}
//                 className="px-4 py-2 rounded border hover:bg-gray-100"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={saving}
//                 className="px-4 py-2 rounded bg-[#819A91] text-white hover:bg-[#5B7167] disabled:opacity-50"
//               >
//                 {saving
//                   ? editing
//                     ? "Saving..."
//                     : "Adding..."
//                   : editing
//                   ? "Save Changes"
//                   : "Add Employee"}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Card Grid */}
//       {loading ? (
//         <p className="text-center py-10">Loading employees...</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
//           {pageEmployees.length ? (
//             pageEmployees.map((emp) => (
//               <EmployeeCard
//                 key={emp._id}
//                 emp={emp}
//                 onEdit={() => startEdit(emp)}
//                 onDelete={() => handleDelete(emp._id)}
//               />
//             ))
//           ) : (
//             <p className="text-center col-span-full">No employees found.</p>
//           )}
//         </div>
//       )}

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="flex justify-center mt-10 space-x-2">
//           {Array.from({ length: totalPages }).map((_, i) => (
//             <button
//               key={i}
//               onClick={() => setCurrentPage(i + 1)}
//               className={`px-3 py-1 rounded ${
//                 currentPage === i + 1
//                   ? "bg-[#819A91] text-white"
//                   : "bg-gray-200 hover:bg-gray-300"
//               }`}
//             >
//               {i + 1}
//             </button>
//           ))}
//         </div>
//       )}
//     </Layout>
//   );
// }

// /* ---------------------------------------------------
//  * StatsCard small component
//  * --------------------------------------------------- */
// function StatsCard({ label, value, icon, bg = "bg-white", text = "text-white" }) {
//   return (
//     <div
//       className={`${bg} ${text} p-4 rounded-xl shadow hover:shadow-lg transition flex items-center gap-3`}
//     >
//       <div className="text-xl">{icon}</div>
//       <div>
//         <div className="text-sm opacity-90">{label}</div>
//         <div className="text-2xl font-bold leading-tight">{value}</div>
//       </div>
//     </div>
//   );
// }

// /* ---------------------------------------------------
//  * Employee card component
//  * --------------------------------------------------- */
// function EmployeeCard({ emp, onEdit, onDelete }) {
//   return (
//     <div className="bg-[#D1D8BE] p-5 rounded-lg shadow hover:shadow-xl transition transform hover:-translate-y-1">
//       <div className="flex items-center justify-between mb-2">
//         <h3 className="text-xl font-semibold text-[#2d3e40]">{emp.name}</h3>
//       </div>
//       <p className="text-gray-700 break-all">{emp.email}</p>
//       <p className="text-sm text-gray-600 mt-1">
//         Dept: {emp.department || "N/A"}
//       </p>
//       <p className="text-sm text-gray-600">Role: {emp.jobTitle || "N/A"}</p>
//       <p className="text-sm text-gray-800 font-semibold mt-1">
//         {emp.salary ? `₹${emp.salary}` : "Salary: N/A"}
//       </p>
//       {emp.dateOfJoining && (
//         <p className="text-xs text-gray-500 mt-1">
//           Joined: {new Date(emp.dateOfJoining).toLocaleDateString()}
//         </p>
//       )}
//       <div className="flex gap-2 mt-4">
//         <button
//           onClick={onEdit}
//           className="flex-1 bg-[#819A91] text-white py-1 rounded hover:bg-[#5B7167] transition flex items-center justify-center gap-1"
//           title="Edit"
//         >
//           <FaEdit /> Edit
//         </button>
//         <button
//           onClick={onDelete}
//           className="flex-1 bg-red-500 text-white py-1 rounded hover:bg-red-600 transition flex items-center justify-center gap-1"
//           title="Delete"
//         >
//           <FaTrash /> Delete
//         </button>
//       </div>
//     </div>
//   );
// }
             
// frontend/src/pages/Employees.jsx
import React, { useEffect, useState, useMemo } from "react";
import api from "../utils/api";
import Layout from "../components/Layout";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaSearch,
  FaUsers,
  FaBuilding,
  FaRupeeSign,
  FaRegClock,
} from "react-icons/fa";

/**
 * Employees Page (Card Grid Edition)
 * - StatsSection (total, departments, avg salary, new this month)
 * - Search filter
 * - Add/Edit employee form (toggle)
 * - Responsive card grid
 * - Pagination
 */
export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ total: 0, byDepartment: [] });

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search/filter
  const [search, setSearch] = useState("");

  // Add/Edit Form state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const CARDS_PER_PAGE = 6;

  /* ---------------- utilities ---------------- */
  function blankForm() {
    return {
      name: "",
      email: "",
      department: "",
      jobTitle: "",
      salary: "",
      dateOfJoining: "",
    };
  }

  const resetAlerts = () => {
    setError("");
    setSuccess("");
  };

  const startAdd = () => {
    resetAlerts();
    setEditing(null);
    setForm(blankForm());
    setShowForm(true);
  };

  const startEdit = (emp) => {
    resetAlerts();
    setEditing(emp);
    setForm({
      name: emp.name ?? "",
      email: emp.email ?? "",
      department: emp.department ?? "",
      jobTitle: emp.jobTitle ?? "",
      salary: emp.salary ?? "",
      dateOfJoining: emp.dateOfJoining ? emp.dateOfJoining.slice(0, 10) : "",
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  /* ---------------- load data ---------------- */
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [statsRes, empRes] = await Promise.all([
          api.get("/employees/stats/summary"),
          api.get("/employees"),
        ]);
        setStats(statsRes.data);
        setEmployees(empRes.data || []);
      } catch (err) {
        console.error("Employees load error:", err);
        setError(
          err?.response?.data?.message || "Failed to load employees data."
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ---------------- derived: filtered list ---------------- */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => {
      const dept = e.department?.toLowerCase() || "";
      const name = e.name?.toLowerCase() || "";
      const email = e.email?.toLowerCase() || "";
      return (
        dept.includes(q) ||
        name.includes(q) ||
        email.includes(q) ||
        (e.jobTitle?.toLowerCase() || "").includes(q)
      );
    });
  }, [search, employees]);

  /* ---------------- derived: pagination slice ---------------- */
  const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE) || 1;
  const pageSafe = Math.min(currentPage, totalPages);
  const indexOfLast = pageSafe * CARDS_PER_PAGE;
  const indexOfFirst = indexOfLast - CARDS_PER_PAGE;
  const pageEmployees = filtered.slice(indexOfFirst, indexOfLast);

  /* ---------------- derived: stats extras ---------------- */
  const computedStats = useMemo(() => {
    const total = stats.total || employees.length;

    const deptSet = new Set(
      employees
        .map((e) => (e.department ? e.department.trim() : "Not Assigned"))
        .filter(Boolean)
    );
    const deptCount = deptSet.size;

    const numericSalaries = employees
      .map((e) => Number(e.salary))
      .filter((n) => !isNaN(n) && n > 0);
    const avgSalary =
      numericSalaries.length > 0
        ? Math.round(
            numericSalaries.reduce((sum, v) => sum + v, 0) /
              numericSalaries.length
          )
        : null;

    const now = Date.now();
    const THIRTY = 1000 * 60 * 60 * 24 * 30;
    const newThisMonth = employees.filter((e) => {
      const dt = e.dateOfJoining ?? e.createdAt ?? e.updatedAt;
      if (!dt) return false;
      const t = new Date(dt).getTime();
      return now - t <= THIRTY;
    }).length;

    return { total, deptCount, avgSalary, newThisMonth };
  }, [stats.total, employees]);

  /* ---------------- submit add / update ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    resetAlerts();

    if (!form.name.trim() || !form.email.trim()) {
      return setError("Name and Email are required.");
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      department: form.department.trim(),
      jobTitle: form.jobTitle.trim(),
      salary: form.salary ? Number(form.salary) : 0,
      dateOfJoining: form.dateOfJoining || undefined,
    };

    try {
      setSaving(true);
      if (editing) {
        await api.put(`/employees/${editing._id}`, payload);
        setSuccess("Employee updated.");
      } else {
        await api.post("/employees", payload);
        setSuccess("Employee added.");
      }
      const [statsRes, empRes] = await Promise.all([
        api.get("/employees/stats/summary"),
        api.get("/employees"),
      ]);
      setStats(statsRes.data);
      setEmployees(empRes.data || []);
      setEditing(null);
      setShowForm(false);
      setForm(blankForm());
    } catch (err) {
      console.error("Save employee error:", err);
      setError(err?.response?.data?.message || "Failed to save employee.");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- delete ---------------- */
  const handleDelete = async (id) => {
    resetAlerts();
    if (!window.confirm("Delete this employee?")) return;
    try {
      await api.delete(`/employees/${id}`);
      setSuccess("Employee deleted.");
      const [statsRes, empRes] = await Promise.all([
        api.get("/employees/stats/summary"),
        api.get("/employees"),
      ]);
      setStats(statsRes.data);
      setEmployees(empRes.data || []);
    } catch (err) {
      console.error("Delete error:", err);
      setError(err?.response?.data?.message || "Failed to delete employee.");
    }
  };

  /* ---------------- render ---------------- */
  return (
    <Layout pageTitle="Employees">
      {/* Stats Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Employees"
          value={computedStats.total}
          icon={<FaUsers />}
          bg="bg-[#819A91]"
        />
        <StatsCard
          label="Departments"
          value={computedStats.deptCount}
          icon={<FaBuilding />}
          bg="bg-[#A7C1A8]"
        />
        <StatsCard
          label="Avg Salary"
          value={
            computedStats.avgSalary !== null
              ? `₹${computedStats.avgSalary.toLocaleString()}`
              : "—"
          }
          icon={<FaRupeeSign />}
          bg="bg-[#D1D8BE]"
          text="text-[#2d3e40]"
        />
        <StatsCard
          label="New This Month"
          value={computedStats.newThisMonth}
          icon={<FaRegClock />}
          bg="bg-[#EEEFE0]"
          text="text-[#2d3e40]"
        />
      </div>

      {/* Controls Row */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-72">
          <FaSearch className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-[#819A91]"
          />
        </div>

        <button
          type="button"
          onClick={startAdd}
          className="self-end md:self-auto bg-[#819A91] text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-[#A7C1A8] transition"
        >
          <FaPlus /> Add Employee
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded mb-6 w-full">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 text-green-700 border border-green-300 px-4 py-2 rounded mb-6 w-full">
          {success}
        </div>
      )}

      {/* Form (collapsible) */}
      {showForm && (
        <div className="mb-10 bg-white rounded-xl shadow p-6 animate-fadeIn">
          <h2 className="text-2xl font-semibold mb-4 text-[#819A91]">
            {editing ? "Edit Employee" : "Add Employee"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name *"
              className="p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
              required
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email *"
              className="p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
              required
            />
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="Department"
              className="p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
            />
            <input
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleChange}
              placeholder="Job Title"
              className="p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
            />
            <input
              type="number"
              name="salary"
              value={form.salary}
              onChange={handleChange}
              placeholder="Salary"
              className="p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
            />
            <input
              type="date"
              name="dateOfJoining"
              value={form.dateOfJoining}
              onChange={handleChange}
              className="p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
            />

            {/* Buttons */}
            <div className="col-span-full flex gap-3 justify-end mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="px-4 py-2 rounded border hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded bg-[#819A91] text-white hover:bg-[#5B7167] disabled:opacity-50"
              >
                {saving
                  ? editing
                    ? "Saving..."
                    : "Adding..."
                  : editing
                  ? "Save Changes"
                  : "Add Employee"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Card Grid */}
      {loading ? (
        <p className="text-center py-10">Loading employees...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {pageEmployees.length ? (
            pageEmployees.map((emp) => (
              <EmployeeCard
                key={emp._id}
                emp={emp}
                onEdit={() => startEdit(emp)}
                onDelete={() => handleDelete(emp._id)}
              />
            ))
          ) : (
            <p className="text-center col-span-full">No employees found.</p>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 space-x-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-[#819A91] text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </Layout>
  );
}

/* ---------------------------------------------------
 * StatsCard small component
 * --------------------------------------------------- */
function StatsCard({
  label,
  value,
  icon,
  bg = "bg-white",
  text = "text-white",
}) {
  return (
    <div
      className={`${bg} ${text} p-4 rounded-xl shadow hover:shadow-lg transition flex items-center gap-3`}
    >
      <div className="text-xl">{icon}</div>
      <div>
        <div className="text-sm opacity-90">{label}</div>
        <div className="text-2xl font-bold leading-tight">{value}</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------
 * Employee card component
 * --------------------------------------------------- */
function EmployeeCard({ emp, onEdit, onDelete }) {
  return (
    <div className="bg-[#D1D8BE] p-5 rounded-lg shadow hover:shadow-xl transition transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold text-[#2d3e40]">{emp.name}</h3>
      </div>
      <p className="text-gray-700 break-all">{emp.email}</p>
      <p className="text-sm text-gray-600 mt-1">
        Dept: {emp.department || "N/A"}
      </p>
      <p className="text-sm text-gray-600">Role: {emp.jobTitle || "N/A"}</p>
      <p className="text-sm text-gray-800 font-semibold mt-1">
        {emp.salary ? `₹${emp.salary}` : "Salary: N/A"}
      </p>
      {emp.dateOfJoining && (
        <p className="text-xs text-gray-500 mt-1">
          Joined: {new Date(emp.dateOfJoining).toLocaleDateString()}
        </p>
      )}
      <div className="flex gap-2 mt-4">
        <button
          onClick={onEdit}
          className="flex-1 bg-[#819A91] text-white py-1 rounded hover:bg-[#5B7167] transition flex items-center justify-center gap-1"
          title="Edit"
        >
          <FaEdit /> Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 bg-red-500 text-white py-1 rounded hover:bg-red-600 transition flex items-center justify-center gap-1"
          title="Delete"
        >
          <FaTrash /> Delete
        </button>
      </div>
    </div>
  );
}
