// src/pages/Attendance.jsx
import React, { useEffect, useState, useMemo } from "react";
import api from "../utils/api";
import Layout from "../components/Layout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  FaCheck,
  FaTimes,
  FaUserClock,
  FaFilter,
  FaUsers,
  FaRedo,
  FaDownload,
} from "react-icons/fa";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

/* ------------------------------------------------------------------
   Theme palette (ColorHunt palette you picked)
------------------------------------------------------------------ */
const COLOR_SAGE = "#819A91";
const COLOR_MINT = "#A7C1A8";
const COLOR_OLIVE = "#D1D8BE";
const COLOR_CREAM = "#EEEFE0";

/* ------------------------------------------------------------------
   Status meta
------------------------------------------------------------------ */
const STATUS_META = {
  PRESENT: { label: "Present", bg: "bg-green-100", text: "text-green-700" },
  ABSENT: { label: "Absent", bg: "bg-red-100", text: "text-red-700" },
  ON_LEAVE: { label: "On Leave", bg: "bg-yellow-100", text: "text-yellow-700" },
};

/* Utility: normalize date to midnight UTC string */
const toDayKey = (d) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt.toISOString();
};

/* Shift date by # days (negative for past) */
const shiftDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export default function Attendance() {
  /* ------------------ state ------------------ */
  const [attendance, setAttendance] = useState([]); // all records
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState(null); // show spinner on a specific employee mark
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL | PRESENT | ABSENT | ON_LEAVE
  const [selectedEmployees, setSelectedEmployees] = useState([]); // for bulk mark

  /* ------------------ load ------------------ */
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get("/attendance");
      setAttendance(res.data || []);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, []);

  /* ------------------ mark attendance (single) ------------------ */
  const markAttendance = async (employeeId, status) => {
    setMarkingId(employeeId);
    try {
      await api.post("/attendance", { employeeId, status });
      setMsg(`Marked ${status.replace("_", " ")} successfully.`);
      await fetchAttendance();
    } catch (err) {
      console.error("Failed to mark attendance:", err);
      setMsg(err.response?.data?.message || "Failed to mark attendance.");
    } finally {
      setMarkingId(null);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  /* ------------------ bulk attendance ------------------ */
  const bulkMark = async (status) => {
    if (!selectedEmployees.length) return;
    try {
      await Promise.all(
        selectedEmployees.map((id) =>
          api.post("/attendance", { employeeId: id, status })
        )
      );
      setMsg(`Bulk marked as ${status}.`);
      setSelectedEmployees([]);
      await fetchAttendance();
    } catch (err) {
      console.error("Bulk mark error:", err);
      setMsg("Bulk update failed.");
    } finally {
      setTimeout(() => setMsg(""), 3000);
    }
  };

  /* ------------------ export CSV ------------------ */
  const exportCSV = () => {
    const headers = ["Employee", "Date", "Status"];
    const rows = attendance.map((rec) => [
      rec.employee?.name || "Unknown",
      new Date(rec.date).toLocaleDateString(),
      rec.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "attendance.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ------------------ today's status map ------------------ */
  const todaysStatusByEmp = useMemo(() => {
    const map = {};
    const today = toDayKey(new Date());
    attendance.forEach((r) => {
      if (!r.employee?._id) return;
      const recDay = toDayKey(r.date);
      if (recDay !== today) return;
      const existing = map[r.employee._id];
      if (!existing || new Date(r.createdAt) > new Date(existing.createdAt)) {
        map[r.employee._id] = r;
      }
    });
    return map;
  }, [attendance]);

  /* ------------------ summary counts (today) ------------------ */
  const todaysCounts = useMemo(() => {
    const counts = { PRESENT: 0, ABSENT: 0, ON_LEAVE: 0 };
    Object.values(todaysStatusByEmp).forEach((r) => {
      if (counts[r.status] !== undefined) counts[r.status] += 1;
    });
    const total = employees.length;
    return { ...counts, total };
  }, [todaysStatusByEmp, employees.length]);

  /* ------------------ filter employees ------------------ */
  const filteredEmployees = useMemo(() => {
    if (filter === "ALL") return employees;
    return employees.filter((emp) => {
      const rec = todaysStatusByEmp[emp._id];
      return rec?.status === filter;
    });
  }, [filter, employees, todaysStatusByEmp]);

  /* ------------------ chart data (last 7 days) ------------------ */
  const chartData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }
    const presentCountByDay = {};
    attendance.forEach((r) => {
      const k = toDayKey(r.date);
      if (!presentCountByDay[k]) presentCountByDay[k] = 0;
      if (r.status === "PRESENT") presentCountByDay[k] += 1;
    });
    return days.map((d) => {
      const k = d.toISOString();
      const label = d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      return { day: label, present: presentCountByDay[k] || 0 };
    });
  }, [attendance]);

  /* ------------------ heatmap values per employee (last 30 days) ------------------ */
  const getAttendanceData = (empId) => {
    const last30 = shiftDate(-30);
    return attendance
      .filter(
        (rec) => rec.employee?._id === empId && new Date(rec.date) >= last30
      )
      .map((rec) => ({
        date: rec.date,
        status: rec.status,
      }));
  };

  /* ------------------ UI helpers ------------------ */
  const statusPill = (status) => {
    const meta = STATUS_META[status];
    if (!meta) return null;
    return (
      <span
        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${meta.bg} ${meta.text}`}
      >
        {meta.label}
      </span>
    );
  };

  /* ------------------ render ------------------ */
  const content = (
    <div className="max-w-7xl mx-auto w-full">
      {/* Title + Export */}
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <h1
          className="text-4xl font-extrabold text-center sm:text-left flex-1"
          style={{ color: COLOR_SAGE }}
        >
          Attendance
        </h1>
        <button
          onClick={exportCSV}
          className="bg-[#819A91] hover:bg-[#A7C1A8] text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FaDownload /> Export CSV
        </button>
      </div>

      {/* Message */}
      {msg && (
        <div className="mb-4 text-center bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
          {msg}
        </div>
      )}

      {/* Summary Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatChip
          label="Present"
          value={todaysCounts.PRESENT}
          color="bg-green-200"
          text="text-green-800"
          icon={<FaCheck />}
        />
        <StatChip
          label="Absent"
          value={todaysCounts.ABSENT}
          color="bg-red-200"
          text="text-red-800"
          icon={<FaTimes />}
        />
        <StatChip
          label="On Leave"
          value={todaysCounts.ON_LEAVE}
          color="bg-yellow-200"
          text="text-yellow-800"
          icon={<FaUserClock />}
        />
        <StatChip
          label="Total"
          value={todaysCounts.total}
          color="bg-[#D1D8BE]"
          text="text-[#213547]"
          icon={<FaUsers />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4 justify-center">
        <FilterButton
          active={filter === "ALL"}
          onClick={() => setFilter("ALL")}
          label="All"
        />
        <FilterButton
          active={filter === "PRESENT"}
          onClick={() => setFilter("PRESENT")}
          label="Present"
        />
        <FilterButton
          active={filter === "ABSENT"}
          onClick={() => setFilter("ABSENT")}
          label="Absent"
        />
        <FilterButton
          active={filter === "ON_LEAVE"}
          onClick={() => setFilter("ON_LEAVE")}
          label="Leave"
        />
        <button
          onClick={() => {
            setFilter("ALL");
            fetchAttendance();
          }}
          className="ml-2 px-3 py-1 text-xs rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center gap-1 transition"
        >
          <FaRedo size={10} /> Refresh
        </button>
      </div>

      {/* Bulk toolbar */}
      {selectedEmployees.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          <button
            onClick={() => bulkMark("PRESENT")}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
          >
            Mark All Present
          </button>
          <button
            onClick={() => bulkMark("ABSENT")}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
          >
            Mark All Absent
          </button>
          <button
            onClick={() => bulkMark("ON_LEAVE")}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
          >
            Mark All Leave
          </button>
        </div>
      )}

      {/* Employee Cards Grid */}
      <div
        className="grid gap-6 mb-14"
        style={{
          gridTemplateColumns:
            "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
        }}
      >
        {filteredEmployees.length ? (
          filteredEmployees.map((emp) => {
            const todayRec = todaysStatusByEmp[emp._id];
            return (
              <EmployeeCard
                key={emp._id}
                emp={emp}
                todayRec={todayRec}
                onMark={markAttendance}
                marking={markingId === emp._id}
                selected={selectedEmployees.includes(emp._id)}
                onSelect={(checked) =>
                  setSelectedEmployees((prev) =>
                    checked
                      ? [...prev, emp._id]
                      : prev.filter((id) => id !== emp._id)
                  )
                }
                getAttendanceData={getAttendanceData}
              />
            );
          })
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No employees match this filter.
          </p>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-14 border border-[#D1D8BE]">
        <h3
          className="text-2xl font-bold mb-4 text-center"
          style={{ color: COLOR_SAGE }}
        >
          Last 7 Days – Present Count
        </h3>
        {chartData.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="present"
                stroke={COLOR_SAGE}
                strokeWidth={3}
                dot={{ r: 5, fill: COLOR_MINT }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-10">No data.</p>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-[#D1D8BE] overflow-x-auto">
        <h3
          className="text-2xl font-bold mb-4 text-center"
          style={{ color: COLOR_SAGE }}
        >
          Recent Attendance Records
        </h3>
        {loading ? (
          <p className="text-center py-4">Loading...</p>
        ) : attendance.length ? (
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[#819A91] text-white">
              <tr>
                <th className="py-2 px-3 text-left">Employee</th>
                <th className="py-2 px-3 text-left">Date</th>
                <th className="py-2 px-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance
                .slice()
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((rec) => (
                  <tr
                    key={rec._id}
                    className="border-b last:border-b-0 hover:bg-[#EEEFE0] transition"
                  >
                    <td className="py-2 px-3">
                      {rec.employee?.name || "Unknown"}
                    </td>
                    <td className="py-2 px-3">
                      {new Date(rec.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3">{statusPill(rec.status)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center py-4 text-gray-500">
            No attendance records found.
          </p>
        )}
      </div>

      {/* Bottom spacing */}
      <div className="h-12" />
    </div>
  );

  return <Layout pageTitle="Attendance">{content}</Layout>;
}

/* ============================================================
 * Small Reusable Components
 * ========================================================== */
function StatChip({ label, value, color, text, icon }) {
  return (
    <div
      className={`rounded-xl p-4 flex flex-col items-center justify-center shadow-sm ${color} ${text} transition hover:shadow-md`}
    >
      <div className="text-xl">{icon}</div>
      <div className="text-sm mt-1 font-semibold uppercase tracking-wide">
        {label}
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function FilterButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-4 py-1 rounded-full text-sm font-medium border transition flex items-center gap-1",
        active
          ? "bg-[#819A91] text-white border-[#819A91] shadow"
          : "bg-white border-gray-300 text-gray-600 hover:bg-[#EEEFE0]",
      ].join(" ")}
    >
      <FaFilter size={10} />
      {label}
    </button>
  );
}

function EmployeeCard({
  emp,
  todayRec,
  onMark,
  marking,
  selected,
  onSelect,
  getAttendanceData,
}) {
  const initials = getInitials(emp.name);
  const status = todayRec?.status;

  return (
    <div className="relative group p-5 rounded-2xl bg-white border border-[#D1D8BE] shadow-sm hover:shadow-md transition">
      {/* Select checkbox */}
      <input
        type="checkbox"
        className="absolute top-3 left-3 w-4 h-4"
        checked={selected}
        onChange={(e) => onSelect(e.target.checked)}
      />

      {/* Avatar */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold mx-auto"
        style={{
          backgroundColor: "#A7C1A8",
          color: "#213547",
        }}
      >
        {initials}
      </div>

      {/* Name */}
      <p className="mt-3 text-center font-semibold text-gray-700">{emp.name}</p>

      {/* Dept */}
      {emp.department && (
        <p className="mt-1 text-xs text-gray-500 text-center">
          {emp.department}
        </p>
      )}

      {/* Today's status pill */}
      <div className="mt-2 text-center">
        {status && <StatusTag status={status} />}
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex items-center justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <MarkBtn
          color="green"
          label="Present"
          icon={<FaCheck />}
          onClick={() => onMark(emp._id, "PRESENT")}
          loading={marking}
        />
        <MarkBtn
          color="red"
          label="Absent"
          icon={<FaTimes />}
          onClick={() => onMark(emp._id, "ABSENT")}
          loading={marking}
        />
        <MarkBtn
          color="yellow"
          label="Leave"
          icon={<FaUserClock />}
          onClick={() => onMark(emp._id, "ON_LEAVE")}
          loading={marking}
        />
      </div>

      {/* Heatmap */}
      <div className="mt-5">
        <CalendarHeatmap
          startDate={shiftDate(-30)}
          endDate={new Date()}
          values={getAttendanceData(emp._id)}
          classForValue={(value) => {
            if (!value) return "color-empty";
            if (value.status === "PRESENT") return "color-green";
            if (value.status === "ABSENT") return "color-red";
            return "color-yellow";
          }}
          showWeekdayLabels={false}
        />
      </div>
    </div>
  );
}

function MarkBtn({ color, label, icon, onClick, loading }) {
  const base =
    "px-3 py-1 rounded-lg text-xs font-medium text-white shadow flex items-center gap-1 transition transform hover:-translate-y-0.5 active:scale-95";
  const colors = {
    green: "bg-green-500 hover:bg-green-600",
    red: "bg-red-500 hover:bg-red-600",
    yellow: "bg-yellow-500 hover:bg-yellow-600",
  }[color];
  return (
    <button
      disabled={loading}
      onClick={onClick}
      className={`${base} ${colors} ${loading ? "opacity-60 cursor-wait" : ""}`}
    >
      {icon} {label}
    </button>
  );
}

function StatusTag({ status }) {
  const meta = STATUS_META[status];
  if (!meta) return null;
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${meta.bg} ${meta.text}`}
    >
      {meta.label}
    </span>
  );
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0]?.toUpperCase() || "")
    .slice(0, 2)
    .join("");
}
