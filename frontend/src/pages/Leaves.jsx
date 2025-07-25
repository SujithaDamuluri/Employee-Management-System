// src/pages/Leaves.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  FaPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaUsers,
  FaUserCircle, 
  FaCalendarCheck,
} from "react-icons/fa";
import Layout from "../components/Layout";
import LeaveCalendar from "../components/LeaveCalendar";
import api from "../utils/api";

// ------------------------------------------------------------
// Palette (your system colors)
// ------------------------------------------------------------
const C = {
  sage: "#819A91",
  pastel: "#A7C1A8",
  olive: "#D1D8BE",
  cream: "#EEEFE0",
  text: "#213547",
  red: "#f44336",
  amber: "#ff9800",
  green: "#4caf50",
};

// Map leave status → meta
const STATUS_META = {
  APPROVED: { label: "Approved", icon: <FaCheckCircle />, color: C.green },
  PENDING: { label: "Pending", icon: <FaHourglassHalf />, color: C.amber },
  REJECTED: { label: "Rejected", icon: <FaTimesCircle />, color: C.red },
};

// Map type fallback color (if we ever color by type)
const TYPE_COLOR = {
  CASUAL: C.pastel,
  SICK: C.red,
  EARNED: C.sage,
  UNPAID: C.olive,
  OTHER: C.cream,
};

// ------------------------------------------------------------
// Small utils
// ------------------------------------------------------------
function daysBetween(d1, d2) {
  const a = new Date(d1);
  const b = new Date(d2);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24)) + 1);
}
function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString();
}
function safeStr(v) {
  return v == null ? "" : String(v);
}
function toISODateInput(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(0, 10);
}

// ------------------------------------------------------------
// Main Page
// ------------------------------------------------------------
export default function Leaves() {
  // Tabs: "my", "all", "calendar"
  const [tab, setTab] = useState("my");

  // Data
  const [leaves, setLeaves] = useState([]); // all leaves from API
  const [employees, setEmployees] = useState([]); // used in manager views
  const [currentUser, setCurrentUser] = useState(null); // from /auth/me

  // UI
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // leave being edited
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filtering & search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Leave form
  const blankLeave = {
    employee: "", // required when manager creating; ignored for self
    type: "CASUAL",
    from: "",
    to: "",
    reason: "",
  };
  const [form, setForm] = useState(blankLeave);

  // ----------------------------------------------------------
  // Load user + employees + leaves
  // ----------------------------------------------------------
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [meRes, leavesRes, empRes] = await Promise.allSettled([
        api.get("/auth/me"),
        api.get("/leaves"),
        api.get("/employees").catch(() => ({ data: [] })),
      ]);

      // user
      if (meRes.status === "fulfilled") {
        setCurrentUser(meRes.value.data?.user || null);
      }

      // leaves
      if (leavesRes.status === "fulfilled") {
        setLeaves(Array.isArray(leavesRes.value.data) ? leavesRes.value.data : []);
      } else {
        setError("Failed to load leave requests.");
      }

      // employees (may fail if locked down)
      if (empRes.status === "fulfilled") {
        setEmployees(Array.isArray(empRes.value.data) ? empRes.value.data : []);
      }
    } catch (err) {
      console.error("Leaves load error:", err);
      setError("Failed to load leave data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ----------------------------------------------------------
  // Derived: current user's ID
  // ----------------------------------------------------------
  const userId = currentUser?.id || currentUser?._id || null;

  // ----------------------------------------------------------
  // Derived: myLeaves vs allLeaves
  // ----------------------------------------------------------
  const myLeaves = useMemo(() => {
    if (!userId) return [];
    return leaves.filter((l) => {
      const id = l.employee?._id || l.employee;
      return String(id) === String(userId);
    });
  }, [leaves, userId]);

  const visibleLeaves = useMemo(() => {
    // Tab decides baseline set
    const base = tab === "my" ? myLeaves : leaves;

    const q = search.trim().toLowerCase();
    const statusQ = statusFilter;
    const typeQ = typeFilter;

    return base.filter((l) => {
      // status filter
      if (statusQ !== "ALL" && l.status !== statusQ) return false;
      // type filter
      if (typeQ !== "ALL" && l.type !== typeQ) return false;
      // search (by reason, employee name, type)
      if (!q) return true;
      const empName = safeStr(l.employee?.name || "").toLowerCase();
      const type = safeStr(l.type).toLowerCase();
      const reason = safeStr(l.reason).toLowerCase();
      return (
        empName.includes(q) ||
        type.includes(q) ||
        reason.includes(q)
      );
    });
  }, [tab, leaves, myLeaves, search, statusFilter, typeFilter]);

  // ----------------------------------------------------------
  // Summary counts (depends on visibleLeaves or all leaves? we use all)
  // ----------------------------------------------------------
  const summary = useMemo(() => {
    const arr = tab === "my" ? myLeaves : leaves;
    return {
      total: arr.length,
      approved: arr.filter((l) => l.status === "APPROVED").length,
      pending: arr.filter((l) => l.status === "PENDING").length,
      rejected: arr.filter((l) => l.status === "REJECTED").length,
    };
  }, [tab, myLeaves, leaves]);

  // Pie for summary
  const pieData = useMemo(
    () => [
      { name: "Approved", value: summary.approved, fill: C.green },
      { name: "Pending", value: summary.pending, fill: C.amber },
      { name: "Rejected", value: summary.rejected, fill: C.red },
    ],
    [summary]
  );

  // ----------------------------------------------------------
  // Modal helpers
  // ----------------------------------------------------------
  const openAddModal = () => {
    setEditing(null);
    setForm({
      ...blankLeave,
      // if not manager, default employee to current user
      employee: currentUser?.role === "HR" ? "" : userId,
    });
    setModalOpen(true);
  };

  const openEditModal = (leave) => {
    setEditing(leave);
    setForm({
      employee: leave.employee?._id || leave.employee || "",
      type: leave.type || "CASUAL",
      from: toISODateInput(leave.from),
      to: toISODateInput(leave.to),
      reason: leave.reason || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(blankLeave);
  };

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // ----------------------------------------------------------
  // Save / Update leave (API)
  // ----------------------------------------------------------
  const submitLeave = async (e) => {
    e?.preventDefault?.();
    setError("");
    setSuccess("");

    // Required fields
    if (!form.from || !form.to) {
      setError("From and To dates are required.");
      return;
    }
    if (!form.type) {
      setError("Select a leave type.");
      return;
    }

    // Manager must choose employee; regular user uses self
    const payload = {
      employee:
        currentUser?.role === "HR"
          ? form.employee
          : userId,
      type: form.type,
      from: form.from,
      to: form.to,
      reason: form.reason || "",
    };

    if (!payload.employee) {
      setError("Select an employee.");
      return;
    }

    try {
      if (editing) {
        await api.put(`/leaves/${editing._id}`, payload);
        setSuccess("Leave updated.");
      } else {
        await api.post("/leaves", payload);
        setSuccess("Leave requested.");
      }
      closeModal();
      loadAll();
    } catch (err) {
      console.error("Leave save error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to save leave."
      );
    }
  };

  // ----------------------------------------------------------
  // Approve / Reject leave (manager)
  // ----------------------------------------------------------
  const updateStatus = async (leaveId, newStatus) => {
    try {
      await api.put(`/leaves/${leaveId}`, { status: newStatus });
      loadAll();
    } catch (err) {
      console.error("Leave status update error:", err);
      alert("Failed to update leave status.");
    }
  };

  // ----------------------------------------------------------
  // Delete leave
  // ----------------------------------------------------------
  const deleteLeave = async (leaveId) => {
    if (!window.confirm("Delete this leave request?")) return;
    try {
      await api.delete(`/leaves/${leaveId}`);
      loadAll();
    } catch (err) {
      console.error("Leave delete error:", err);
      alert("Failed to delete leave.");
    }
  };

  // ----------------------------------------------------------
  // Calendar view feed
  // (LeaveCalendar wants [{_id,type,status,from,to,employee:{name}}...])
  // We can just pass visibleLeaves OR all leaves; let's pass all so manager sees full calendar.
  // If you'd like personal view in "my" tab, change depending on `tab`.
  // ----------------------------------------------------------
  const calendarLeaves = tab === "my" ? myLeaves : leaves;

  // ----------------------------------------------------------
  // Page content switching by tab
  // ----------------------------------------------------------
  const renderContent = () => {
    if (tab === "calendar") {
      return (
        <div className="bg-white rounded-xl shadow p-4 lg:p-6">
          <LeaveCalendar leaves={calendarLeaves} />
        </div>
      );
    }
    return (
      <LeavesListView
        tab={tab}
        visibleLeaves={visibleLeaves}
        currentUser={currentUser}
        onEdit={openEditModal}
        onDelete={deleteLeave}
        onApprove={(id) => updateStatus(id, "APPROVED")}
        onReject={(id) => updateStatus(id, "REJECTED")}
      />
    );
  };

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  return (
    <Layout pageTitle="Leaves">
      {/* Alerts */}
      {(error || success) && (
        <div className="mb-4 space-y-2">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
              {success}
            </div>
          )}
        </div>
      )}

      {/* Tabs + Calendar Toggle */}
      <LeavesTabs tab={tab} setTab={setTab} />

      {/* Summary + Add */}
      <TopControls
        summary={summary}
        onAdd={openAddModal}
        isManager={currentUser?.role === "HR"}
      />

      {/* Filters */}
      <LeavesFilters
        search={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatus={setStatusFilter}
        typeFilter={typeFilter}
        onType={setTypeFilter}
      />

      {/* Main content */}
      {loading ? (
        <p className="text-center py-10">Loading leaves...</p>
      ) : (
        renderContent()
      )}

      {/* Modal */}
      {modalOpen && (
        <LeaveModal
          editing={!!editing}
          form={form}
          employees={employees}
          isManager={currentUser?.role === "HR"}
          onChange={onFormChange}
          onClose={closeModal}
          onSubmit={submitLeave}
        />
      )}
    </Layout>
  );
}

// ------------------------------------------------------------
// Tabs Row
// ------------------------------------------------------------
function LeavesTabs({ tab, setTab }) {
  const tabs = [
    { key: "my", label: "My Leaves", icon: <FaUserCircle /> },
    { key: "all", label: "All Leaves", icon: <FaUsers /> },
    { key: "calendar", label: "Calendar", icon: <FaCalendarCheck /> },
  ];
  return (
    <div className="flex gap-2 mb-6 border-b border-gray-300 text-sm">
      {tabs.map((t) => {
        const active = tab === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-t-md flex items-center gap-2 transition ${
              active
                ? "bg-white text-[#213547] font-semibold shadow"
                : "bg-transparent text-gray-600 hover:text-[#213547]"
            }`}
          >
            <span className="text-base">{t.icon}</span>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------
// Top Summary + Add Button
// ------------------------------------------------------------
function TopControls({ summary, onAdd, isManager }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <SummaryCard
        label="Total"
        value={summary.total}
        color={C.sage}
        icon={<FaCalendarAlt />}
      />
      <SummaryCard
        label="Approved"
        value={summary.approved}
        color={C.green}
        icon={<FaCheckCircle />}
      />
      <SummaryCard
        label="Pending"
        value={summary.pending}
        color={C.amber}
        icon={<FaHourglassHalf />}
      />
      <SummaryCard
        label="Rejected"
        value={summary.rejected}
        color={C.red}
        icon={<FaTimesCircle />}
      />
      {/* Add sits full width below on mobile */}
      <div className="col-span-2 sm:col-span-4 flex justify-end mt-2">
        <button
          onClick={onAdd}
          className="px-4 py-2 rounded-lg text-white flex items-center gap-2 shadow hover:shadow-md transition"
          style={{ backgroundColor: C.sage }}
        >
          <FaPlus /> {isManager ? "Add Leave" : "Request Leave"}
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Summary Stat Card
// ------------------------------------------------------------
function SummaryCard({ label, value, color, icon }) {
  return (
    <div
      className="p-4 rounded-xl shadow flex items-center gap-3"
      style={{ backgroundColor: color, color: "#fff" }}
    >
      <div className="text-xl">{icon}</div>
      <div>
        <div className="text-sm opacity-90">{label}</div>
        <div className="text-2xl font-bold leading-tight">{value}</div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Filters Row
// ------------------------------------------------------------
function LeavesFilters({
  search,
  onSearch,
  statusFilter,
  onStatus,
  typeFilter,
  onType,
}) {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-8">
      {/* search */}
      <div className="relative w-full lg:w-64">
        <FaSearch className="absolute top-3 left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search reason, employee, type..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-[#819A91]"
        />
      </div>

      {/* status */}
      <div className="flex items-center gap-2">
        <FaFilter className="text-gray-500" />
        <select
          value={statusFilter}
          onChange={(e) => onStatus(e.target.value)}
          className="p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
        >
          <option value="ALL">All Status</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING">Pending</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* type */}
      <select
        value={typeFilter}
        onChange={(e) => onType(e.target.value)}
        className="p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
      >
        <option value="ALL">All Types</option>
        <option value="CASUAL">Casual</option>
        <option value="SICK">Sick</option>
        <option value="EARNED">Earned</option>
        <option value="UNPAID">Unpaid</option>
        <option value="OTHER">Other</option>
      </select>
    </div>
  );
}

// ------------------------------------------------------------
// Leaves List View (My or All depending on tab)
// ------------------------------------------------------------
function LeavesListView({
  tab,
  visibleLeaves,
  currentUser,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}) {
  const isManager = currentUser?.role === "HR";
  const showEmployeeCol = tab === "all"; // show employee name in All Leaves

  // If no leaves:
  if (!visibleLeaves.length) {
    return (
      <div className="text-center py-20 text-gray-500">
        No leave records found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow border border-[#D1D8BE]">
      <table className="w-full text-sm">
        <thead className="bg-[#819A91] text-white">
          <tr>
            {showEmployeeCol && <th className="py-2 px-3 text-left">Employee</th>}
            <th className="py-2 px-3 text-left">Type</th>
            <th className="py-2 px-3 text-left">From</th>
            <th className="py-2 px-3 text-left">To</th>
            <th className="py-2 px-3 text-left">Days</th>
            <th className="py-2 px-3 text-left">Status</th>
            <th className="py-2 px-3 text-left">Reason</th>
            <th className="py-2 px-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleLeaves.map((l) => {
            const days = daysBetween(l.from, l.to);
            const meta = STATUS_META[l.status] || {};
            return (
              <tr
                key={l._id || l.id}
                className="border-b last:border-0 hover:bg-[#EEEFE0]/70 transition"
              >
                {showEmployeeCol && (
                  <td className="py-2 px-3">
                    {l.employee?.name || "—"}
                  </td>
                )}
                <td className="py-2 px-3">{l.type}</td>
                <td className="py-2 px-3">{fmt(l.from)}</td>
                <td className="py-2 px-3">{fmt(l.to)}</td>
                <td className="py-2 px-3">{days}</td>
                <td className="py-2 px-3">
                  <StatusPill status={l.status} />
                </td>
                <td className="py-2 px-3">{l.reason || "—"}</td>
                <td className="py-2 px-3 text-center">
                  <div className="inline-flex gap-2">
                    <button
                      onClick={() => onEdit(l)}
                      className="px-2 py-1 text-xs rounded bg-[#A7C1A8] text-white hover:bg-[#819A91]"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => onDelete(l._id || l.id)}
                      className="px-2 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                    {isManager && l.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => onApprove(l._id || l.id)}
                          className="px-2 py-1 text-xs rounded bg-green-500 text-white hover:bg-green-600"
                          title="Approve"
                        >
                          <FaCheckCircle />
                        </button>
                        <button
                          onClick={() => onReject(l._id || l.id)}
                          className="px-2 py-1 text-xs rounded bg-amber-500 text-white hover:bg-amber-600"
                          title="Reject"
                        >
                          <FaTimesCircle />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pie Summary under table */}
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-3 text-[#213547]">
          Status Distribution
        </h3>
        <div className="h-48 w-full">
          <ResponsivePieFromStatus leaves={visibleLeaves} />
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Status Pill
// ------------------------------------------------------------
function StatusPill({ status }) {
  const meta = STATUS_META[status] || {
    label: status,
    color: "#999",
    icon: null,
  };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full text-white"
      style={{ backgroundColor: meta.color }}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
}

// ------------------------------------------------------------
// Responsive Pie Chart for list summary
// ------------------------------------------------------------
function ResponsivePieFromStatus({ leaves }) {
  const data = useMemo(() => {
    const counts = { APPROVED: 0, PENDING: 0, REJECTED: 0 };
    leaves.forEach((l) => {
      if (counts[l.status] !== undefined) counts[l.status] += 1;
    });
    return [
      { name: "Approved", value: counts.APPROVED, fill: C.green },
      { name: "Pending", value: counts.PENDING, fill: C.amber },
      { name: "Rejected", value: counts.REJECTED, fill: C.red },
    ];
  }, [leaves]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChartComp data={data} />
    </ResponsiveContainer>
  );
}

// Simple pie wrapper for reusability
function PieChartComp({ data }) {
  return (
    <PieChart>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        innerRadius={45}
        outerRadius={65}
        paddingAngle={2}
        label
      >
        {data.map((d, idx) => (
          <Cell key={idx} fill={d.fill} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}

// Need Recharts imports here for local PieChartComp:
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"; // note: keep this *below* if bundler complains, move to top w/ others

// ------------------------------------------------------------
// Add/Edit Leave Modal
// ------------------------------------------------------------
function LeaveModal({
  editing,
  form,
  employees,
  isManager,
  onChange,
  onClose,
  onSubmit,
}) {
  // compute days
  const numDays = form.from && form.to ? daysBetween(form.from, form.to) : 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-xl font-bold mb-4 text-[#213547]">
          {editing ? "Edit Leave" : "Request Leave"}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          {isManager && (
            <div>
              <label className="block mb-1 text-sm text-gray-600">
                Employee *
              </label>
              <select
                name="employee"
                value={form.employee}
                onChange={onChange}
                required
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
              >
                <option value="">Select Employee...</option>
                {employees.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.name} ({e.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm text-gray-600">
              Leave Type *
            </label>
            <select
              name="type"
              value={form.type}
              onChange={onChange}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
            >
              <option value="CASUAL">Casual</option>
              <option value="SICK">Sick</option>
              <option value="EARNED">Earned</option>
              <option value="UNPAID">Unpaid</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm text-gray-600">
                From *
              </label>
              <input
                type="date"
                name="from"
                value={form.from}
                onChange={onChange}
                required
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-600">
                To *
              </label>
              <input
                type="date"
                name="to"
                value={form.to}
                onChange={onChange}
                required
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
              />
            </div>
          </div>

          {/* auto calc days */}
          {numDays > 0 && (
            <p className="text-sm text-gray-500">
              Total days: <strong>{numDays}</strong>
            </p>
          )}

          <div>
            <label className="block mb-1 text-sm text-gray-600">
              Reason
            </label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={onChange}
              rows={3}
              placeholder="Optional"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-[#819A91]"
            />
          </div>

          <div className="text-right pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border mr-2 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded text-white"
              style={{ backgroundColor: C.sage }}
            >
              {editing ? "Save Changes" : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
