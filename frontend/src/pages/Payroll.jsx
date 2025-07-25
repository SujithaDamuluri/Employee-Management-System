// frontend/src/pages/Payroll.jsx
import { useState, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUsers,
  FaBuilding,
  FaProjectDiagram,
  FaTasks,
  FaMoneyBillWave,
  FaCalendarCheck,
  FaChartPie,
  FaUserCircle,
  FaUserEdit,
  FaSignOutAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilePdf,
  FaFilter,
  FaCheck,
  FaBars,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaMoon,
  FaSun,
  FaDownload,
} from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import api from "../utils/api";

/* ========================================================================
   Helper: Convert data to CSV
========================================================================= */
function convertToCSV(data) {
  const headers = ["Employee", "Month", "Basic Pay", "Deductions", "Net Pay", "Status"];
  const rows = data.map((p) => [p.employeeName, p.month, p.basicPay, p.deductions, p.netPay, p.status]);
  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  return csvContent;
}
/* ========================================================================
   Sidebar Component (Unchanged Colors)
========================================================================= */
function SidebarNav({ isOpen, onClose, onLogout, user }) {
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/attendance", label: "Attendance", icon: <FaCalendarAlt /> },
    { path: "/employees", label: "Employees", icon: <FaUsers /> },
    { path: "/departments", label: "Departments", icon: <FaBuilding /> },
    { path: "/projects", label: "Projects", icon: <FaProjectDiagram /> },
    { path: "/tasks", label: "Tasks", icon: <FaTasks /> },
    { path: "/payroll", label: "Payroll", icon: <FaMoneyBillWave /> },
    { path: "/leaves", label: "Leaves", icon: <FaCalendarCheck /> },
    { path: "/manager-insights", label: "Manager Insights", icon: <FaChartPie /> },
    { path: "/profile", label: "My Profile", icon: <FaUserCircle /> },
    { path: "/edit-profile", label: "Edit Profile", icon: <FaUserEdit /> },
  ];

  const SAGE = "#819A91";
  const PASTEL = "#A7C1A8";
  const CREAM = "#EEEFE0";
  const TEXT_DARK = "#213547";

  return (
    <>
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={onClose} />
      )}

      <aside
        className={`fixed z-40 inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          w-64 shadow-xl flex flex-col`}
        style={{ backgroundColor: SAGE, color: CREAM }}
      >
        <div
          className="flex items-center justify-center py-5 text-2xl font-bold shadow-md w-full"
          style={{ backgroundColor: PASTEL, color: TEXT_DARK }}
        >
          StaffSphere
        </div>

        <nav className="mt-4 flex-1 space-y-1 px-3 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} end onClick={onClose} className="block">
              {({ isActive }) => (
                <div
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-base ${
                    isActive ? "font-semibold shadow-md" : "hover:shadow hover:scale-[1.01]"
                  }`}
                  style={{
                    backgroundColor: isActive ? CREAM : "transparent",
                    color: isActive ? TEXT_DARK : CREAM,
                  }}
                >
                  <span className="mr-3 text-lg flex-shrink-0" style={{ color: isActive ? TEXT_DARK : CREAM }}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t w-full" style={{ borderColor: "#ffffff33" }}>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition text-white shadow"
            style={{ backgroundColor: "#e53935" }}
          >
            <FaSignOutAlt />
            Logout
          </button>
          {user?.role && (
            <p className="mt-3 text-center text-xs opacity-80">
              Signed in as <span className="font-semibold">{user.role}</span>
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
/* ========================================================================
   Main Payroll Component
========================================================================= */
export default function Payroll() {
  // ---------------- Sidebar + Dark Mode ----------------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", !prev);
      return !prev;
    });
  };

  // ---------------- Payroll State ----------------
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("month");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Form State
  const [form, setForm] = useState({
    employeeId: "",
    month: "",
    basicPay: "",
    deductions: "",
    netPay: "",
    status: "Pending",
  });

  // ---------------- Fetch Payrolls + Employees ----------------
  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const res = await api.get("/payroll");
      setPayrolls(res.data);
    } catch (err) {
      console.error("Error fetching payrolls:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // ---------------- Handle Form Changes ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "basicPay" || name === "deductions") {
      const basic = parseFloat(name === "basicPay" ? value : form.basicPay) || 0;
      const ded = parseFloat(name === "deductions" ? value : form.deductions) || 0;
      setForm((prev) => ({ ...prev, netPay: (basic - ded).toFixed(2) }));
    }
  };

  // ---------------- Save Payroll ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.employeeId || !form.month || !form.basicPay) {
        alert("Please fill all required fields");
        return;
      }

      if (editingPayroll) {
        await api.put(`/payroll/${editingPayroll._id}`, form);
      } else {
        await api.post("/payroll", form);
      }

      setShowModal(false);
      setEditingPayroll(null);
      resetForm();
      fetchPayrolls();
    } catch (err) {
      console.error("Error saving payroll:", err);
      alert("Failed to save payroll");
    }
  };

  const resetForm = () => {
    setForm({
      employeeId: "",
      month: "",
      basicPay: "",
      deductions: "",
      netPay: "",
      status: "Pending",
    });
  };

  // ---------------- Edit/Delete/Approve ----------------
  const handleEdit = (p) => {
    setEditingPayroll(p);
    setForm({
      employeeId: p.employeeId,
      month: p.month,
      basicPay: p.basicPay,
      deductions: p.deductions,
      netPay: p.netPay,
      status: p.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payroll?")) return;
    try {
      await api.delete(`/payroll/${id}`);
      setPayrolls((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Error deleting payroll:", err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/payroll/${id}/approve`);
      setPayrolls((prev) => prev.map((p) => (p._id === id ? { ...p, status: "Processed" } : p)));
    } catch (err) {
      console.error("Error approving payroll:", err);
      alert("Failed to approve payroll");
    }
  };

  // ---------------- Export PDF & CSV ----------------
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Payroll Report", 14, 15);
    const tableData = payrolls.map((p) => [
      p.employeeName,
      p.month,
      p.basicPay,
      p.deductions,
      p.netPay,
      p.status,
    ]);
    doc.autoTable({
      startY: 20,
      head: [["Employee", "Month", "Basic Pay", "Deductions", "Net Pay", "Status"]],
      body: tableData,
    });
    doc.save("Payroll_Report.pdf");
  };

  const handleExportCSV = () => {
    const csv = convertToCSV(payrolls);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Payroll_Report.csv";
    link.click();
  };

  // ---------------- Filter & Search ----------------
  const filteredPayrolls = useMemo(() => {
    return payrolls
      .filter((p) => (filter === "All" ? true : p.status === filter))
      .filter((p) => p.employeeName?.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortKey === "month") {
          return sortOrder === "asc" ? a.month.localeCompare(b.month) : b.month.localeCompare(a.month);
        } else if (sortKey === "basicPay") {
          return sortOrder === "asc" ? a.basicPay - b.basicPay : b.basicPay - a.basicPay;
        }
        return 0;
      });
  }, [payrolls, filter, search, sortKey, sortOrder]);

  // Pagination slice
  const totalPages = Math.ceil(filteredPayrolls.length / rowsPerPage);
  const currentData = filteredPayrolls.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (dir) => {
    setCurrentPage((prev) => {
      if (dir === "next" && prev < totalPages) return prev + 1;
      if (dir === "prev" && prev > 1) return prev - 1;
      return prev;
    });
  };

  // ---------------- Analytics ----------------
  const summary = useMemo(() => {
    return {
      total: payrolls.length,
      pending: payrolls.filter((p) => p.status === "Pending").length,
      processed: payrolls.filter((p) => p.status === "Processed").length,
      totalPayout: payrolls.reduce((acc, p) => acc + (parseFloat(p.netPay) || 0), 0),
    };
  }, [payrolls]);

  const pieData = [
    { name: "Processed", value: summary.processed },
    { name: "Pending", value: summary.pending },
  ];

  const COLORS = ["#4caf50", "#f9a825"];

  // Bar chart data (monthly payout)
  const barData = useMemo(() => {
    const monthMap = {};
    payrolls.forEach((p) => {
      if (!monthMap[p.month]) monthMap[p.month] = 0;
      monthMap[p.month] += parseFloat(p.netPay) || 0;
    });
    return Object.entries(monthMap).map(([month, total]) => ({ month, total }));
  }, [payrolls]);
  /* ========================================================================
     Step 4: UI Rendering
  ========================================================================= */
  return (
    <div className={`flex h-screen w-full ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      {/* ---------------- Sidebar ---------------- */}
      <SidebarNav
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => alert("Logging out...")}
        user={{ role: "Admin" }}
      />

      {/* ---------------- Main Content ---------------- */}
      <div className="flex-1 flex flex-col">
        {/* Header Bar */}
        <header
          className="flex items-center justify-between px-6 py-4 shadow-md"
          style={{ backgroundColor: "#fff" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 bg-green-600 text-white rounded"
            >
              <FaBars />
            </button>
            <h1 className="text-xl font-bold">Payroll Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-2"
            >
              <FaFilePdf /> Export PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-2"
            >
              CSV
            </button>
            <button
              onClick={() => {
                setEditingPayroll(null);
                setShowModal(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center gap-2"
            >
              <FaPlus /> Add Payroll
            </button>
          </div>
        </header>

        {/* ---------------- Filters ---------------- */}
        <div className="p-4 flex flex-wrap gap-4 items-center bg-white shadow-md">
          <div className="flex items-center border rounded px-3 py-2 bg-white shadow-sm">
            <FaFilter className="text-gray-500 mr-2" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="outline-none"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Processed">Processed</option>
            </select>
          </div>
          <div className="flex items-center border rounded px-3 py-2 bg-white shadow-sm flex-1">
            <input
              type="text"
              placeholder="Search by employee name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none w-full"
            />
          </div>
          <div className="flex items-center border rounded px-3 py-2 bg-white shadow-sm">
            <label className="mr-2">Sort By:</label>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="outline-none"
            >
              <option value="month">Month</option>
              <option value="basicPay">Basic Pay</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="ml-2 p-1 bg-gray-200 rounded"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>

        {/* ---------------- Charts ---------------- */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-100">
          {/* Pie Chart */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-3">Payroll Status Summary</h2>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-3">Monthly Payout</h2>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ---------------- Payroll Table ---------------- */}
        <div className="p-6 bg-gray-50 flex-1 overflow-y-auto">
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3">Employee</th>
                  <th className="p-3">Month</th>
                  <th className="p-3">Basic Pay</th>
                  <th className="p-3">Deductions</th>
                  <th className="p-3">Net Pay</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-4 text-center text-gray-500">
                      No payroll records found
                    </td>
                  </tr>
                ) : (
                  currentData.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="p-3">{p.employeeName}</td>
                      <td className="p-3">{p.month}</td>
                      <td className="p-3">₹{p.basicPay}</td>
                      <td className="p-3">₹{p.deductions}</td>
                      <td className="p-3 font-semibold">₹{p.netPay}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            p.status === "Processed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        {p.status === "Pending" && (
                          <button
                            onClick={() => handleApprove(p._id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                          >
                            <FaCheck /> Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(p)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange("prev")}
              className="px-3 py-1 border rounded"
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange("next")}
              className="px-3 py-1 border rounded"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {/* ---------------- Add/Edit Modal ---------------- */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative">
              <h2 className="text-xl font-bold mb-4">
                {editingPayroll ? "Edit Payroll" : "Add Payroll"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1">Employee</label>
                  <select
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Month</label>
                  <input
                    type="month"
                    name="month"
                    value={form.month}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block mb-1">Basic Pay</label>
                    <input
                      type="number"
                      name="basicPay"
                      value={form.basicPay}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1">Deductions</label>
                    <input
                      type="number"
                      name="deductions"
                      value={form.deductions}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1">Net Pay</label>
                  <input
                    type="number"
                    name="netPay"
                    value={form.netPay}
                    readOnly
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// /* ========================================================================
//    Step 5: Helper Functions
// ========================================================================= */
// function convertToCSV(data) {
//   const headers = ["Employee", "Month", "Basic Pay", "Deductions", "Net Pay", "Status"];
//   const rows = data.map((p) => [
//     p.employeeName,
//     p.month,
//     p.basicPay,
//     p.deductions,
//     p.netPay,
//     p.status,
//   ]);
//   const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
//   return csvContent;
// }
