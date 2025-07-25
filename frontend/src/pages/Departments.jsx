// import React, { useEffect, useState } from "react";
// import api from "../utils/api";
// import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";

// const Departments = () => {
//   const [departments, setDepartments] = useState([]);
//   const [form, setForm] = useState({ name: "", manager: "", employeesCount: "" });
//   const [editing, setEditing] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // Fetch departments
//   const fetchDepartments = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/departments");
//       setDepartments(res.data);
//     } catch (err) {
//       console.error("Fetch departments error:", err);
//       setError("Failed to fetch departments.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDepartments();
//   }, []);

//   // Handle input changes
//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   // Add/Update Department
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     if (!form.name) return setError("Department Name is required.");

//     try {
//       if (editing) {
//         await api.put(`/departments/${editing._id}`, form);
//         setSuccess("Department updated successfully.");
//       } else {
//         await api.post("/departments", form);
//         setSuccess("Department added successfully.");
//       }
//       setForm({ name: "", manager: "", employeesCount: "" });
//       setEditing(null);
//       fetchDepartments();
//     } catch (err) {
//       console.error("Add/Edit department error:", err);
//       setError(err.response?.data?.message || "Failed to save department.");
//     }
//   };

//   // Delete department
//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this department?")) return;
//     try {
//       await api.delete(`/departments/${id}`);
//       setSuccess("Department deleted.");
//       fetchDepartments();
//     } catch (err) {
//       console.error("Delete error:", err);
//       setError(err.response?.data?.message || "Failed to delete department.");
//     }
//   };

//   // Edit department
//   const handleEdit = (dept) => {
//     setForm({
//       name: dept.name,
//       manager: dept.manager || "",
//       employeesCount: dept.employeesCount || "",
//     });
//     setEditing(dept);
//   };

//   return (
//     <div className="min-h-screen p-6 bg-gradient-to-br from-[#EEEFE0] via-[#D1D8BE] to-[#A7C1A8] text-[#213547]">
//       <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-6 transition transform hover:shadow-2xl">
//         <h1 className="text-4xl font-extrabold mb-6 text-center text-[#4A5D52] tracking-wide">
//           Departments Management
//         </h1>

//         {/* Alerts */}
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
//             {error}
//           </div>
//         )}
//         {success && (
//           <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
//             {success}
//           </div>
//         )}

//         {/* Form */}
//         <form
//           onSubmit={handleSubmit}
//           className="grid md:grid-cols-4 gap-4 mb-8 bg-white/60 p-4 rounded-xl shadow-md"
//         >
//           <input
//             type="text"
//             name="name"
//             value={form.name}
//             onChange={handleChange}
//             placeholder="Department Name"
//             className="p-2 border rounded-lg focus:ring-2 focus:ring-[#819A91] outline-none"
//           />
//           <input
//             type="text"
//             name="manager"
//             value={form.manager}
//             onChange={handleChange}
//             placeholder="Manager"
//             className="p-2 border rounded-lg focus:ring-2 focus:ring-[#819A91] outline-none"
//           />
//           <input
//             type="number"
//             name="employeesCount"
//             value={form.employeesCount}
//             onChange={handleChange}
//             placeholder="Employees Count"
//             className="p-2 border rounded-lg focus:ring-2 focus:ring-[#819A91] outline-none"
//           />
//           <button
//             type="submit"
//             className="bg-[#819A91] text-white rounded-lg px-4 py-2 hover:bg-[#A7C1A8] transition shadow-lg flex items-center justify-center"
//           >
//             {editing ? "Update" : "Add"} <FaPlus className="ml-2" />
//           </button>
//         </form>

//         {/* Departments Table */}
//         <div className="overflow-x-auto mb-12">
//           {loading ? (
//             <p className="text-center py-4">Loading departments...</p>
//           ) : (
//             <table className="w-full border border-gray-200 shadow-lg rounded-lg overflow-hidden">
//               <thead className="bg-[#819A91] text-white">
//                 <tr>
//                   <th className="py-2 px-3">Department</th>
//                   <th className="py-2 px-3">Manager</th>
//                   <th className="py-2 px-3">Employees</th>
//                   <th className="py-2 px-3 text-center">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {departments.length > 0 ? (
//                   departments.map((dept) => (
//                     <tr
//                       key={dept._id}
//                       className="border-b hover:bg-[#EEEFE0] transition"
//                     >
//                       <td className="py-2 px-3">{dept.name}</td>
//                       <td className="py-2 px-3">{dept.manager || "N/A"}</td>
//                       <td className="py-2 px-3">{dept.employeesCount || 0}</td>
//                       <td className="py-2 px-3 text-center">
//                         <button
//                           onClick={() => handleEdit(dept)}
//                           className="bg-[#A7C1A8] text-white px-2 py-1 rounded mr-2 hover:bg-[#819A91]"
//                         >
//                           <FaEdit />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(dept._id)}
//                           className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
//                         >
//                           <FaTrash />
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="4" className="text-center py-4">
//                       No departments found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           )}
//         </div>

//         {/* Bar Chart for Department Sizes */}
//         <div className="bg-white/60 rounded-xl shadow-lg p-6">
//           <h2 className="text-2xl font-bold mb-4 text-[#4A5D52]">
//             Department Sizes
//           </h2>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={departments} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Bar
//                 dataKey="employeesCount"
//                 fill="#819A91"
//                 barSize={40}
//                 animationDuration={1200}
//                 radius={[8, 8, 0, 0]}
//               />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Departments;


// import React, { useEffect, useState } from "react";
// import api from "../utils/api";
// import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from "recharts";

// const COLORS = ["#819A91", "#A7C1A8", "#D1D8BE", "#BFD3C1", "#97BFB4"];

// export default function Departments() {
//   const [departments, setDepartments] = useState([]);
//   const [form, setForm] = useState({ name: "", manager: "" });
//   const [editing, setEditing] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const fetchDepartments = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/departments");
//       setDepartments(res.data);
//     } catch (err) {
//       console.error("Fetch departments error:", err);
//       setError("Failed to fetch departments.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDepartments();
//   }, []);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     if (!form.name) return setError("Department name is required.");

//     try {
//       if (editing) {
//         await api.put(`/departments/${editing._id}`, form);
//         setSuccess("Department updated successfully.");
//       } else {
//         await api.post("/departments", form);
//         setSuccess("Department added successfully.");
//       }
//       setForm({ name: "", manager: "" });
//       setEditing(null);
//       fetchDepartments();
//     } catch (err) {
//       console.error("Add/Edit department error:", err);
//       setError(err.response?.data?.message || "Failed to save department.");
//     }
//   };

//   const handleEdit = (dept) => {
//     setForm({ name: dept.name, manager: dept.manager || "" });
//     setEditing(dept);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this department?")) return;
//     try {
//       await api.delete(`/departments/${id}`);
//       setSuccess("Department deleted.");
//       fetchDepartments();
//     } catch (err) {
//       console.error("Delete department error:", err);
//       setError(err.response?.data?.message || "Failed to delete department.");
//     }
//   };

//   return (
//     <div className="min-h-screen p-6 bg-[#EEEFE0] text-[#213547] animate-fadeIn">
//       <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
//         <h1 className="text-3xl font-bold mb-6 text-center text-[#819A91]">Departments</h1>

//         {/* Alerts */}
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 animate-bounce">
//             {error}
//           </div>
//         )}
//         {success && (
//           <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 animate-pulse">
//             {success}
//           </div>
//         )}

//         {/* Form */}
//         <form
//           onSubmit={handleSubmit}
//           className="grid md:grid-cols-3 gap-4 mb-8 bg-[#D1D8BE] p-4 rounded-lg shadow-md"
//         >
//           <input
//             type="text"
//             name="name"
//             value={form.name}
//             onChange={handleChange}
//             placeholder="Department Name"
//             className="p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
//           />
//           <input
//             type="text"
//             name="manager"
//             value={form.manager}
//             onChange={handleChange}
//             placeholder="Manager"
//             className="p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
//           />
//           <button
//             type="submit"
//             className="bg-[#819A91] text-white p-2 rounded hover:bg-[#A7C1A8] transition flex items-center justify-center"
//           >
//             {editing ? "Update" : "Add"} <FaPlus className="inline ml-1" />
//           </button>
//         </form>

//         {/* Chart Section */}
//         <div className="bg-white p-4 rounded-lg shadow-md mb-8">
//           <h3 className="text-xl font-bold text-[#819A91] mb-4">Department Employee Count</h3>
//           {departments.length > 0 ? (
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={departments}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="employeesCount">
//                   {departments.map((_, idx) => (
//                     <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           ) : (
//             <p className="text-center text-gray-500">No departments found.</p>
//           )}
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           {loading ? (
//             <p className="text-center py-4">Loading departments...</p>
//           ) : (
//             <table className="w-full border border-gray-200 shadow-md rounded-lg overflow-hidden">
//               <thead className="bg-[#819A91] text-white">
//                 <tr>
//                   <th className="py-2 px-3">Department</th>
//                   <th className="py-2 px-3">Manager</th>
//                   <th className="py-2 px-3 text-center">Employees</th>
//                   <th className="py-2 px-3 text-center">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {departments.length > 0 ? (
//                   departments.map((dept) => (
//                     <tr key={dept._id} className="border-b hover:bg-[#EEEFE0] transition">
//                       <td className="py-2 px-3">{dept.name}</td>
//                       <td className="py-2 px-3">{dept.manager || "N/A"}</td>
//                       <td className="py-2 px-3 text-center">{dept.employeesCount}</td>
//                       <td className="py-2 px-3 text-center">
//                         <button
//                           onClick={() => handleEdit(dept)}
//                           className="bg-[#A7C1A8] text-white px-2 py-1 rounded mr-2 hover:bg-[#819A91] transition"
//                         >
//                           <FaEdit />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(dept._id)}
//                           className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
//                         >
//                           <FaTrash />
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="4" className="text-center py-4">
//                       No departments found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// src/pages/Departments.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import api from "../utils/api";
import Layout from "../components/Layout";

// Pastel palette
const COLORS = ["#819a91", "#a7c1a8", "#d1d8be", "#b2c5c0", "#cfe2cf"];

export default function Departments() {
  /* ---------- state ---------- */
  const [departments, setDepartments] = useState([]); // raw dept docs
  const [stats, setStats] = useState([]); // from /departments/stats
  const [form, setForm] = useState({ name: "", manager: "" });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recountTried, setRecountTried] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ---------- data loads ---------- */
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const [deptRes, statsRes] = await Promise.all([
        api.get("/departments"),
        api.get("/departments/stats").catch(() => ({ data: [] })), // stats optional
      ]);
      setDepartments(deptRes.data || []);
      setStats(statsRes.data || []);
    } catch (err) {
      console.error("Fetch departments error:", err);
      setError("Failed to fetch departments.");
    } finally {
      setLoading(false);
    }
  };

  // call once
  useEffect(() => {
    fetchDepartments();
  }, []);

  /* ---------- attempt server recount if all counts 0 ---------- */
  useEffect(() => {
    if (!departments.length) return;
    const allZero =
      (stats.length
        ? stats.every((s) => !s.employeesCount || s.employeesCount === 0)
        : departments.every(
            (d) => !d.employeesCount || d.employeesCount === 0
          )) && !recountTried;

    if (!allZero) return;

    setRecountTried(true);
    (async () => {
      try {
        await api.get("/departments/refresh-counts");
        await fetchDepartments();
      } catch (err) {
        console.warn("refresh-counts not available or failed:", err?.response?.status);
      }
    })();
  }, [departments, stats, recountTried]);

  /* ---------- unified chart data ---------- */
  const chartData = useMemo(() => {
    // Prefer stats (aggregate) if present
    if (stats.length) {
      return stats.map((s) => ({
        id: s._id,
        name: s.name,
        manager: s.manager || "N/A",
        employeesCount: s.employeesCount ?? 0,
      }));
    }
    // Fallback to raw departments
    return departments.map((d) => ({
      id: d._id,
      name: d.name,
      manager: d.manager || "N/A",
      employeesCount: d.employeesCount ?? 0,
    }));
  }, [stats, departments]);

  const hasChartData = chartData.some((d) => d.employeesCount > 0);

  /* ---------- form handlers ---------- */
  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.manager) {
      setError("Department Name and Manager are required.");
      return;
    }

    try {
      if (editing) {
        await api.put(`/departments/${editing._id}`, form);
        setSuccess("Department updated.");
      } else {
        await api.post("/departments", form);
        setSuccess("Department added.");
      }
      setForm({ name: "", manager: "" });
      setEditing(null);
      await fetchDepartments();
    } catch (err) {
      console.error("Save department error:", err);
      setError(err.response?.data?.message || "Failed to save department.");
    }
  };

  const handleEdit = (dept) => {
    setForm({ name: dept.name, manager: dept.manager || "" });
    setEditing(dept);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await api.delete(`/departments/${id}`);
      setSuccess("Department deleted.");
      await fetchDepartments();
    } catch (err) {
      console.error("Delete department error:", err);
      setError(err.response?.data?.message || "Failed to delete department.");
    }
  };

  /* ---------- UI ---------- */
  const content = (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#819A91]">
        Departments
      </h1>

      {/* Alerts */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
          {success}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid md:grid-cols-3 gap-4 mb-8 bg-[#D1D8BE] p-4 rounded-lg shadow-sm"
      >
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Department Name"
          className="p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
        />
        <input
          type="text"
          name="manager"
          value={form.manager}
          onChange={handleChange}
          placeholder="Manager"
          className="p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
        />
        <button
          type="submit"
          className="bg-[#819A91] text-white p-2 rounded hover:bg-[#A7C1A8] transition"
        >
          {editing ? "Update" : "Add"} <FaPlus className="inline ml-1" />
        </button>
      </form>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Bar */}
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-[#819A91] mb-4">
            Employees per Department
          </h3>
          {chartData.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="employeesCount"
                  fill="#819a91"
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-10">No data.</p>
          )}
        </div>

        {/* Pie */}
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-[#819A91] mb-4">
            Department Distribution
          </h3>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="employeesCount"
                  nameKey="name"
                  outerRadius={100}
                  innerRadius={40}
                  label
                  animationDuration={1500}
                >
                  {chartData.map((_, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-10">
              No employees assigned yet.
            </p>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center py-4">Loading departments...</p>
        ) : (
          <table className="w-full border border-gray-200 shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-[#819A91] text-white">
              <tr>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Manager</th>
                <th className="py-2 px-3">Employees</th>
                <th className="py-2 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {chartData.length ? (
                chartData.map((dept) => (
                  <tr
                    key={dept.id}
                    className="border-b hover:bg-[#EEEFE0] transition"
                  >
                    <td className="py-2 px-3">{dept.name}</td>
                    <td className="py-2 px-3">{dept.manager}</td>
                    <td className="py-2 px-3 text-center">
                      {dept.employeesCount}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="bg-[#A7C1A8] text-white px-2 py-1 rounded mr-2 hover:bg-[#819A91]"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    No departments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // Provide themed outer background here (instead of <Layout> if not used)
  return <Layout pageTitle="Departments">{content}</Layout>;
}

