// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { FaUsers, FaTasks, FaCalendarAlt, FaProjectDiagram } from "react-icons/fa";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";

ChartJS.register(
  LineElement,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement
);

const COLORS = {
  sage: "#819A91",
  pastel: "#A7C1A8",
  olive: "#D1D8BE",
  cream: "#EEEFE0",
  darkText: "#213547",
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    employees: 120,
    projects: 8,
    tasks: 240,
    attendance: 92,
  });

  // Simulate API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        employees: 132,
        projects: 9,
        tasks: 265,
        attendance: 95,
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-3xl font-bold text-[#213547]">Dashboard Overview</h1>

      {/* Top Stats */}
      <StatsSection stats={stats} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3 text-[#213547]">Attendance Overview</h2>
          <PieChart dataValue={stats.attendance} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
          <h2 className="text-lg font-semibold mb-3 text-[#213547]">Task Trends</h2>
          <LineChart />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3 text-[#213547]">Project Progress</h2>
          <BarChart />
        </div>
        <RecentActivities />
      </div>
    </div>
  );
}

/* ------------------- STATS CARDS ------------------- */
function StatsSection({ stats }) {
  const cards = [
    {
      title: "Employees",
      value: stats.employees,
      icon: <FaUsers />,
      color: COLORS.sage,
    },
    {
      title: "Projects",
      value: stats.projects,
      icon: <FaProjectDiagram />,
      color: COLORS.pastel,
    },
    {
      title: "Tasks",
      value: stats.tasks,
      icon: <FaTasks />,
      color: COLORS.olive,
    },
    {
      title: "Attendance %",
      value: stats.attendance + "%",
      icon: <FaCalendarAlt />,
      color: COLORS.cream,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="rounded-lg shadow p-4 flex items-center gap-4"
          style={{ backgroundColor: card.color }}
        >
          <div className="text-3xl text-white p-3 rounded-full bg-[#213547]">
            {card.icon}
          </div>
          <div>
            <p className="text-sm text-[#213547]">{card.title}</p>
            <p className="text-xl font-bold text-[#213547]">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------- PIE CHART ------------------- */
function PieChart({ dataValue }) {
  const data = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        data: [dataValue, 100 - dataValue],
        backgroundColor: [COLORS.sage, COLORS.cream],
        borderWidth: 1,
      },
    ],
  };
  const options = { responsive: true, plugins: { legend: { position: "bottom" } } };
  return <Pie data={data} options={options} />;
}

/* ------------------- LINE CHART ------------------- */
function LineChart() {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "Completed Tasks",
        data: [5, 8, 6, 10, 7, 12],
        borderColor: COLORS.sage,
        backgroundColor: COLORS.pastel,
        tension: 0.4,
        fill: true,
      },
    ],
  };
  const options = { responsive: true, plugins: { legend: { position: "top" } } };
  return <Line data={data} options={options} />;
}

/* ------------------- BAR CHART ------------------- */
function BarChart() {
  const data = {
    labels: ["Project A", "Project B", "Project C", "Project D"],
    datasets: [
      {
        label: "Progress %",
        data: [70, 50, 90, 60],
        backgroundColor: [COLORS.sage, COLORS.pastel, COLORS.olive, COLORS.cream],
      },
    ],
  };
  const options = { responsive: true, plugins: { legend: { display: false } } };
  return <Bar data={data} options={options} />;
}

/* ------------------- RECENT ACTIVITIES ------------------- */
function RecentActivities() {
  const activities = [
    { time: "10:30 AM", text: "John Doe marked attendance." },
    { time: "11:00 AM", text: "Project X moved to Ongoing." },
    { time: "12:15 PM", text: "New employee added." },
    { time: "02:45 PM", text: "Task 'UI Design' completed." },
    { time: "04:00 PM", text: "Manager updated project deadlines." },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-3 text-[#213547]">Recent Activities</h2>
      <ul className="space-y-2">
        {activities.map((act, idx) => (
          <li
            key={idx}
            className="flex justify-between items-center border-b pb-2 last:border-none"
          >
            <span className="text-sm text-gray-700">{act.text}</span>
            <span className="text-xs text-gray-500">{act.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
