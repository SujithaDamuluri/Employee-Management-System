import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { FaUsers, FaBuilding, FaUserTie } from "react-icons/fa";

const COLORS = ["#819a91", "#a7c1a8", "#d1d8be", "#e0c097"];

export default function ManagerInsights() {
  const [stats, setStats] = useState({
    totalManagers: 0,
    totalDepartments: 0,
    totalEmployees: 0,
  });
  const [topEmployees, setTopEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch insights data from backend
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await api.get("/manager/insights");
        setStats({
          totalManagers: res.data.totalManagers,
          totalDepartments: res.data.totalDepartments,
          totalEmployees: res.data.totalEmployees,
        });
        setTopEmployees(res.data.topEmployees || []);
      } catch (err) {
        console.error("Failed to fetch insights:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  // Data for charts
  const employeeDeptData = topEmployees.map((emp) => ({
    name: emp.name,
    salary: emp.salary || 0,
  }));

  const pieData = [
    { name: "Managers", value: stats.totalManagers },
    { name: "Departments", value: stats.totalDepartments },
    { name: "Employees", value: stats.totalEmployees },
  ];

  if (loading) return <p className="text-center mt-10">Loading Manager Insights...</p>;

  return (
    <div className="min-h-screen p-6 bg-[#f8f9fa]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-[#819a91] text-center mb-8">
          Manager Insights Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg text-center transition">
            <FaUserTie className="text-4xl text-[#819a91] mx-auto" />
            <h3 className="text-lg font-semibold mt-2 text-gray-700">Total Managers</h3>
            <p className="text-3xl font-bold mt-1">{stats.totalManagers}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg text-center transition">
            <FaBuilding className="text-4xl text-[#a7c1a8] mx-auto" />
            <h3 className="text-lg font-semibold mt-2 text-gray-700">Departments</h3>
            <p className="text-3xl font-bold mt-1">{stats.totalDepartments}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg text-center transition">
            <FaUsers className="text-4xl text-[#d1d8be] mx-auto" />
            <h3 className="text-lg font-semibold mt-2 text-gray-700">Employees</h3>
            <p className="text-3xl font-bold mt-1">{stats.totalEmployees}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-[#819a91] mb-4">
              Top Employees by Salary
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeDeptData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="salary" fill="#819a91" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-[#819a91] mb-4">
              Workforce Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
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
      </div>
    </div>
  );
}
