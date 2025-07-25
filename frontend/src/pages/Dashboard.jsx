// import React, { useEffect, useState, useMemo } from "react";
// import Layout from "../components/Layout";
// import api from "../utils/api";
// import {
//   FaUsers,
//   FaTasks,
//   FaCalendarAlt,
//   FaProjectDiagram,
// } from "react-icons/fa";

// // Chart.js
// import {
//   Chart as ChartJS,
//   ArcElement,
//   BarElement,
//   LineElement,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { Pie, Bar, Line } from "react-chartjs-2";

// ChartJS.register(
//   ArcElement,
//   BarElement,
//   LineElement,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   Tooltip,
//   Legend
// );

// /* ------------------------------------------------------------------
//    Color Palette (matches what you told me to use everywhere)
//    ------------------------------------------------------------------ */
// const PALETTE = {
//   sage: "#819A91",
//   pastel: "#A7C1A8",
//   olive: "#D1D8BE",
//   cream: "#EEEFE0",
//   text: "#213547",
//   white: "#FFFFFF",
// };

// /* ------------------------------------------------------------------
//    Dashboard Page
//    ------------------------------------------------------------------ */
// export default function Dashboard() {
//   /* ---------------- state ---------------- */
//   const [loading, setLoading] = useState(true);
//   const [projects, setProjects] = useState([]);
//   const [tasks, setTasks] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [attendanceTrend, setAttendanceTrend] = useState([]); // [{day:'Mon',present:32},...]

//   /* ---------------- initial load ---------------- */
//   useEffect(() => {
//     let ignore = false;
//     async function load() {
//       try {
//         setLoading(true);

//         // Fetch in parallel
//         const [projRes, taskRes, empRes, attRes] = await Promise.allSettled([
//           api.get("/projects"),
//           api.get("/tasks/all"), // you created /api/tasks/all route earlier
//           api.get("/employees"),
//           api.get("/attendance/stats/overview").catch(() => ({ data: [] })),
//         ]);

//         if (ignore) return;

//         setProjects(Array.isArray(projRes.value?.data) ? projRes.value.data : []);
//         setTasks(Array.isArray(taskRes.value?.data) ? taskRes.value.data : []);
//         setEmployees(Array.isArray(empRes.value?.data) ? empRes.value.data : []);

//         // Attendance overview -> transform to last 5 points
//         const attRaw = attRes.value?.data || [];
//         // attRaw might be [{_id:{month,year},presentCount:n}]
//         // We'll fake days if monthly. If empty: fallback demo data.
//         if (Array.isArray(attRaw) && attRaw.length) {
//           const mapped = attRaw.slice(-5).map((r) => ({
//             label: `${r._id?.month || ""}/${r._id?.year || ""}`,
//             present: r.presentCount || 0,
//           }));
//           setAttendanceTrend(mapped);
//         } else {
//           // fallback demo
//           setAttendanceTrend([
//             { label: "Mon", present: 34 },
//             { label: "Tue", present: 37 },
//             { label: "Wed", present: 36 },
//             { label: "Thu", present: 40 },
//             { label: "Fri", present: 38 },
//           ]);
//         }
//       } finally {
//         if (!ignore) setLoading(false);
//       }
//     }
//     load();
//     return () => {
//       ignore = true;
//     };
//   }, []);

//   /* ---------------- derived: stat values ---------------- */
//   const totalEmployees = employees.length;
//   const totalProjects = projects.length;
//   const totalTasks = tasks.length;

//   // crude "attendance %" = avg present / employees
//   const attendancePercent = useMemo(() => {
//     if (!attendanceTrend.length || !totalEmployees) return 0;
//     const totalPresent = attendanceTrend.reduce((sum, d) => sum + d.present, 0);
//     const avg = totalPresent / attendanceTrend.length;
//     return Math.round((avg / totalEmployees) * 100);
//   }, [attendanceTrend, totalEmployees]);

//   /* ---------------- derived: task distribution ---------------- */
//   const taskCounts = useMemo(() => {
//     const counts = { TO_DO: 0, IN_PROGRESS: 0, DONE: 0 };
//     tasks.forEach((t) => {
//       if (counts[t.status] !== undefined) counts[t.status] += 1;
//     });
//     return counts;
//   }, [tasks]);

//   /* ---------------- derived: dept employee counts ---------------- */
//   const deptCounts = useMemo(() => {
//     const map = {};
//     employees.forEach((e) => {
//       const key = e.department || "Unassigned";
//       map[key] = (map[key] || 0) + 1;
//     });
//     return Object.entries(map).map(([department, count]) => ({
//       department,
//       count,
//     }));
//   }, [employees]);

//   /* ---------------- chart data: pie (tasks) ---------------- */
//   const pieData = {
//     labels: ["To Do", "In Progress", "Done"],
//     datasets: [
//       {
//         data: [taskCounts.TO_DO, taskCounts.IN_PROGRESS, taskCounts.DONE],
//         backgroundColor: [PALETTE.sage, PALETTE.pastel, PALETTE.olive],
//         borderColor: PALETTE.white,
//         borderWidth: 2,
//       },
//     ],
//   };
//   const pieOptions = {
//     plugins: {
//       legend: { position: "bottom", labels: { color: PALETTE.text } },
//     },
//     maintainAspectRatio: false,
//   };

//   /* ---------------- chart data: bar (dept) ---------------- */
//   const barData = {
//     labels: deptCounts.map((d) => d.department),
//     datasets: [
//       {
//         label: "Employees",
//         data: deptCounts.map((d) => d.count),
//         backgroundColor: PALETTE.sage,
//         hoverBackgroundColor: PALETTE.pastel,
//         borderRadius: 6,
//       },
//     ],
//   };
//   const barOptions = {
//     plugins: {
//       legend: { display: false },
//       tooltip: { enabled: true },
//     },
//     scales: {
//       x: {
//         ticks: { color: PALETTE.text },
//         grid: { display: false },
//       },
//       y: {
//         ticks: { color: PALETTE.text },
//         grid: { color: "rgba(0,0,0,0.05)" },
//         beginAtZero: true,
//         precision: 0,
//       },
//     },
//     maintainAspectRatio: false,
//   };

//   /* ---------------- chart data: line (attendance) ---------------- */
//   const lineData = {
//     labels: attendanceTrend.map((d) => d.label),
//     datasets: [
//       {
//         label: "Present",
//         data: attendanceTrend.map((d) => d.present),
//         fill: true,
//         borderColor: PALETTE.sage,
//         backgroundColor: PALETTE.pastel + "33", // alpha overlay
//         tension: 0.35,
//         pointRadius: 4,
//         pointBackgroundColor: PALETTE.sage,
//       },
//     ],
//   };
//   const lineOptions = {
//     plugins: {
//       legend: { display: true, position: "top", labels: { color: PALETTE.text } },
//     },
//     scales: {
//       x: {
//         ticks: { color: PALETTE.text },
//         grid: { display: false },
//       },
//       y: {
//         ticks: { color: PALETTE.text },
//         grid: { color: "rgba(0,0,0,0.05)" },
//         beginAtZero: true,
//       },
//     },
//     maintainAspectRatio: false,
//   };

//   /* ---------------- sample activity feed ---------------- */
//   const recentActivity = useMemo(() => {
//     // derive a few sample rows from actual fetched data to make it feel live
//     const acts = [];
//     if (tasks[0]) acts.push({ text: `Task "${tasks[0].title}" created`, time: "Just now" });
//     if (projects[0]) acts.push({ text: `Project "${projects[0].name}" updated`, time: "5m ago" });
//     if (employees[0]) acts.push({ text: `${employees[0].name} joined`, time: "Today" });
//     if (!acts.length) {
//       return [
//         { text: "No recent activity yet.", time: "" },
//       ];
//     }
//     return acts;
//   }, [tasks, projects, employees]);

//   /* ---------------- render content ---------------- */
//   const page = (
//     <div className="flex flex-col gap-8 w-full">

//       {/* Stats grid */}
//       <StatsGrid
//         employees={totalEmployees}
//         projects={totalProjects}
//         tasks={totalTasks}
//         attendance={attendancePercent}
//       />

//       {/* Charts row */}
//       <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full">
//         {/* Pie */}
//         <Panel title="Task Distribution">
//           <div className="h-[260px]">
//             <Pie data={pieData} options={pieOptions} />
//           </div>
//         </Panel>

//         {/* Bar */}
//         <Panel title="Employees by Department" className="xl:col-span-1">
//           <div className="h-[260px]">
//             <Bar data={barData} options={barOptions} />
//           </div>
//         </Panel>

//         {/* Line */}
//         <Panel title="Attendance Trend" className="xl:col-span-1">
//           <div className="h-[260px]">
//             <Line data={lineData} options={lineOptions} />
//           </div>
//         </Panel>
//       </div>

//       {/* Recent Activity + Recent Projects/Tasks */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <ActivityFeed items={recentActivity} />
//         <RecentLists projects={projects} tasks={tasks} />
//       </div>
//     </div>
//   );

//   return (
//     <Layout pageTitle="Dashboard">
//       {loading ? (
//         <div className="w-full text-center py-20 text-lg font-medium text-gray-500">
//           Loading dashboard...
//         </div>
//       ) : (
//         page
//       )}
//     </Layout>
//   );
// }

// /* ------------------------------------------------------------------
//    Stats Cards Grid
//    ------------------------------------------------------------------ */
// function StatsGrid({ employees, projects, tasks, attendance }) {
//   const cards = [
//     {
//       label: "Employees",
//       value: employees,
//       icon: <FaUsers />,
//       bg: PALETTE.sage,
//     },
//     {
//       label: "Projects",
//       value: projects,
//       icon: <FaProjectDiagram />,
//       bg: PALETTE.pastel,
//     },
//     {
//       label: "Tasks",
//       value: tasks,
//       icon: <FaTasks />,
//       bg: PALETTE.olive,
//     },
//     {
//       label: "Attendance",
//       value: `${attendance}%`,
//       icon: <FaCalendarAlt />,
//       bg: PALETTE.cream,
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
//       {cards.map((c) => (
//         <div
//           key={c.label}
//           className="flex items-center gap-4 p-5 rounded-xl shadow hover:shadow-md transition border border-white/40"
//           style={{ backgroundColor: c.bg }}
//         >
//           <div
//             className="w-12 h-12 rounded-full flex items-center justify-center text-xl text-white shadow"
//             style={{ backgroundColor: PALETTE.text }}
//           >
//             {c.icon}
//           </div>
//           <div>
//             <p className="text-sm leading-none mb-1 text-[#213547]">{c.label}</p>
//             <p className="text-2xl font-bold text-[#213547]">{c.value}</p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// /* ------------------------------------------------------------------
//    Generic Panel wrapper
//    ------------------------------------------------------------------ */
// function Panel({ title, className = "", children }) {
//   return (
//     <div
//       className={`bg-white rounded-xl shadow p-6 border border-[${PALETTE.olive}] ${className}`}
//       style={{ borderColor: PALETTE.olive }}
//     >
//       <h3 className="text-lg font-semibold mb-4" style={{ color: PALETTE.text }}>
//         {title}
//       </h3>
//       {children}
//     </div>
//   );
// }

// /* ------------------------------------------------------------------
//    Activity Feed
//    ------------------------------------------------------------------ */
// function ActivityFeed({ items }) {
//   return (
//     <Panel title="Recent Activity">
//       <ul className="space-y-3">
//         {items.map((a, i) => (
//           <li
//             key={i}
//             className="flex justify-between items-start border-b last:border-none pb-2 text-sm"
//             style={{ borderColor: PALETTE.olive }}
//           >
//             <span className="text-[#213547]">{a.text}</span>
//             <span className="text-gray-500 text-xs">{a.time}</span>
//           </li>
//         ))}
//       </ul>
//     </Panel>
//   );
// }

// /* ------------------------------------------------------------------
//    Recent Projects + Tasks (side-by-side)
//    ------------------------------------------------------------------ */
// function RecentLists({ projects, tasks }) {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//       <Panel title="Recent Projects">
//         {projects.length ? (
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="text-left border-b" style={{ borderColor: PALETTE.olive }}>
//                 <th className="py-2 pr-2">Name</th>
//                 <th className="py-2 pr-2">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {projects.slice(0, 5).map((p) => (
//                 <tr
//                   key={p._id}
//                   className="border-b last:border-none hover:bg-[#EEEFE0]/60 transition"
//                   style={{ borderColor: PALETTE.olive }}
//                 >
//                   <td className="py-1 pr-2">{p.name}</td>
//                   <td className="py-1 pr-2">{p.status}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p className="text-sm text-gray-500">No projects yet.</p>
//         )}
//       </Panel>

//       <Panel title="Recent Tasks">
//         {tasks.length ? (
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="text-left border-b" style={{ borderColor: PALETTE.olive }}>
//                 <th className="py-2 pr-2">Title</th>
//                 <th className="py-2 pr-2">Status</th>
//                 <th className="py-2 pr-2">Priority</th>
//               </tr>
//             </thead>
//             <tbody>
//               {tasks.slice(0, 5).map((t) => (
//                 <tr
//                   key={t._id}
//                   className="border-b last:border-none hover:bg-[#EEEFE0]/60 transition"
//                   style={{ borderColor: PALETTE.olive }}
//                 >
//                   <td className="py-1 pr-2">{t.title}</td>
//                   <td className="py-1 pr-2">{t.status}</td>
//                   <td className="py-1 pr-2">{t.priority}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p className="text-sm text-gray-500">No tasks yet.</p>
//         )}
//       </Panel>
//     </div>
//   );
// }

// import React, { useEffect, useState, useMemo, useRef } from "react";
// import Layout from "../components/Layout";
// import api from "../utils/api";
// import {
//   FaUsers,
//   FaTasks,
//   FaCalendarAlt,
//   FaProjectDiagram,
//   FaUserCircle,
//   FaUserEdit,
//   FaSignOutAlt,
// } from "react-icons/fa";

// // Chart.js
// import {
//   Chart as ChartJS,
//   ArcElement,
//   BarElement,
//   LineElement,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { Pie, Bar, Line } from "react-chartjs-2";

// ChartJS.register(
//   ArcElement,
//   BarElement,
//   LineElement,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   Tooltip,
//   Legend
// );

// /* ------------------------------------------------------------------
//    Color Palette
//    ------------------------------------------------------------------ */
// const PALETTE = {
//   sage: "#819A91",
//   pastel: "#A7C1A8",
//   olive: "#D1D8BE",
//   cream: "#EEEFE0",
//   text: "#213547",
//   white: "#FFFFFF",
// };

// /* ------------------------------------------------------------------
//    Dashboard Page with Profile
//    ------------------------------------------------------------------ */
// export default function Dashboard() {
//   const [loading, setLoading] = useState(true);
//   const [projects, setProjects] = useState([]);
//   const [tasks, setTasks] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [attendanceTrend, setAttendanceTrend] = useState([]);
//   const [user, setUser] = useState(null);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   /* Fetch user and dashboard data */
//   useEffect(() => {
//     let ignore = false;
//     async function load() {
//       try {
//         setLoading(true);

//         // Fetch user info
//         const userRes = await api.get("/auth/me");
//         setUser(userRes.data?.user || { name: "User", email: "user@email.com" });

//         // Fetch dashboard data
//         const [projRes, taskRes, empRes, attRes] = await Promise.allSettled([
//           api.get("/projects"),
//           api.get("/tasks/all"),
//           api.get("/employees"),
//           api.get("/attendance/stats/overview").catch(() => ({ data: [] })),
//         ]);

//         if (ignore) return;

//         setProjects(Array.isArray(projRes.value?.data) ? projRes.value.data : []);
//         setTasks(Array.isArray(taskRes.value?.data) ? taskRes.value.data : []);
//         setEmployees(Array.isArray(empRes.value?.data) ? empRes.value.data : []);

//         const attRaw = attRes.value?.data || [];
//         if (Array.isArray(attRaw) && attRaw.length) {
//           const mapped = attRaw.slice(-5).map((r) => ({
//             label: `${r._id?.month || ""}/${r._id?.year || ""}`,
//             present: r.presentCount || 0,
//           }));
//           setAttendanceTrend(mapped);
//         } else {
//           setAttendanceTrend([
//             { label: "Mon", present: 34 },
//             { label: "Tue", present: 37 },
//             { label: "Wed", present: 36 },
//             { label: "Thu", present: 40 },
//             { label: "Fri", present: 38 },
//           ]);
//         }
//       } finally {
//         if (!ignore) setLoading(false);
//       }
//     }
//     load();

//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       ignore = true;
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   /* Derived Stats */
//   const totalEmployees = employees.length;
//   const totalProjects = projects.length;
//   const totalTasks = tasks.length;

//   const attendancePercent = useMemo(() => {
//     if (!attendanceTrend.length || !totalEmployees) return 0;
//     const totalPresent = attendanceTrend.reduce((sum, d) => sum + d.present, 0);
//     const avg = totalPresent / attendanceTrend.length;
//     return Math.round((avg / totalEmployees) * 100);
//   }, [attendanceTrend, totalEmployees]);

//   const taskCounts = useMemo(() => {
//     const counts = { TO_DO: 0, IN_PROGRESS: 0, DONE: 0 };
//     tasks.forEach((t) => {
//       if (counts[t.status] !== undefined) counts[t.status] += 1;
//     });
//     return counts;
//   }, [tasks]);

//   const deptCounts = useMemo(() => {
//     const map = {};
//     employees.forEach((e) => {
//       const key = e.department || "Unassigned";
//       map[key] = (map[key] || 0) + 1;
//     });
//     return Object.entries(map).map(([department, count]) => ({ department, count }));
//   }, [employees]);

//   /* Chart Data */
//   const pieData = {
//     labels: ["To Do", "In Progress", "Done"],
//     datasets: [
//       {
//         data: [taskCounts.TO_DO, taskCounts.IN_PROGRESS, taskCounts.DONE],
//         backgroundColor: [PALETTE.sage, PALETTE.pastel, PALETTE.olive],
//         borderColor: PALETTE.white,
//         borderWidth: 2,
//       },
//     ],
//   };
//   const barData = {
//     labels: deptCounts.map((d) => d.department),
//     datasets: [
//       {
//         label: "Employees",
//         data: deptCounts.map((d) => d.count),
//         backgroundColor: PALETTE.sage,
//         hoverBackgroundColor: PALETTE.pastel,
//         borderRadius: 6,
//       },
//     ],
//   };
//   const lineData = {
//     labels: attendanceTrend.map((d) => d.label),
//     datasets: [
//       {
//         label: "Present",
//         data: attendanceTrend.map((d) => d.present),
//         fill: true,
//         borderColor: PALETTE.sage,
//         backgroundColor: PALETTE.pastel + "33",
//         tension: 0.35,
//         pointRadius: 4,
//         pointBackgroundColor: PALETTE.sage,
//       },
//     ],
//   };

//   /* Activity Feed */
//   const recentActivity = useMemo(() => {
//     const acts = [];
//     if (tasks[0]) acts.push({ text: `Task "${tasks[0].title}" created`, time: "Just now" });
//     if (projects[0]) acts.push({ text: `Project "${projects[0].name}" updated`, time: "5m ago" });
//     if (employees[0]) acts.push({ text: `${employees[0].name} joined`, time: "Today" });
//     return acts.length ? acts : [{ text: "No recent activity yet.", time: "" }];
//   }, [tasks, projects, employees]);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     window.location.href = "/login";
//   };

//   /* Page Content */
//   const page = (
//     <div className="flex flex-col gap-8 w-full">
//       {/* Profile Banner */}
//       <div className="flex justify-between items-center bg-white rounded-xl p-5 shadow border border-gray-100">
//         <div className="flex items-center gap-4">
//           <img
//             src="https://i.pravatar.cc/100?img=11"
//             alt="profile"
//             className="w-16 h-16 rounded-full border-2 border-[#819A91]"
//           />
//           <div>
//             <h2 className="text-xl font-semibold text-[#213547]">{user?.name || "User"}</h2>
//             <p className="text-sm text-gray-600">{user?.email}</p>
//             <p className="text-xs text-gray-500">Welcome back to your dashboard</p>
//           </div>
//         </div>
//         <div className="relative" ref={dropdownRef}>
//           <button
//             className="flex items-center gap-3 p-2 rounded hover:bg-gray-100"
//             onClick={() => setDropdownOpen(!dropdownOpen)}
//           >
//             <FaUserCircle className="text-xl text-[#819A91]" />
//             <span className="text-sm text-gray-700">Account</span>
//           </button>
//           {dropdownOpen && (
//             <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
//               <div className="p-3 border-b border-gray-100">
//                 <p className="text-sm font-semibold">{user?.name}</p>
//                 <p className="text-xs text-gray-500">{user?.email}</p>
//               </div>
//               <button
//                 className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
//                 onClick={() => (window.location.href = "/profile")}
//               >
//                 <FaUserCircle /> My Profile
//               </button>
//               <button
//                 className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
//                 onClick={() => (window.location.href = "/edit-profile")}
//               >
//                 <FaUserEdit /> Edit Profile
//               </button>
//               <button
//                 onClick={handleLogout}
//                 className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 text-red-600"
//               >
//                 <FaSignOutAlt /> Logout
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <StatsGrid
//         employees={totalEmployees}
//         projects={totalProjects}
//         tasks={totalTasks}
//         attendance={attendancePercent}
//       />

//       {/* Charts */}
//       <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full">
//         <Panel title="Task Distribution"><Pie data={pieData} /></Panel>
//         <Panel title="Employees by Department"><Bar data={barData} /></Panel>
//         <Panel title="Attendance Trend"><Line data={lineData} /></Panel>
//       </div>

//       {/* Activity and Lists */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <ActivityFeed items={recentActivity} />
//         <RecentLists projects={projects} tasks={tasks} />
//       </div>
//     </div>
//   );

//   return (
//     <Layout pageTitle="Dashboard">
//       {loading ? (
//         <div className="w-full text-center py-20 text-lg font-medium text-gray-500">
//           Loading dashboard...
//         </div>
//       ) : (
//         page
//       )}
//     </Layout>
//   );
// }

// /* Stats, Panel, ActivityFeed, RecentLists (same as before) */
// function StatsGrid({ employees, projects, tasks, attendance }) {
//   const cards = [
//     { label: "Employees", value: employees, icon: <FaUsers />, bg: PALETTE.sage },
//     { label: "Projects", value: projects, icon: <FaProjectDiagram />, bg: PALETTE.pastel },
//     { label: "Tasks", value: tasks, icon: <FaTasks />, bg: PALETTE.olive },
//     { label: "Attendance", value: `${attendance}%`, icon: <FaCalendarAlt />, bg: PALETTE.cream },
//   ];
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
//       {cards.map((c) => (
//         <div key={c.label} className="flex items-center gap-4 p-5 rounded-xl shadow" style={{ backgroundColor: c.bg }}>
//           <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl text-white shadow" style={{ backgroundColor: PALETTE.text }}>
//             {c.icon}
//           </div>
//           <div>
//             <p className="text-sm mb-1 text-[#213547]">{c.label}</p>
//             <p className="text-2xl font-bold text-[#213547]">{c.value}</p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// function Panel({ title, children }) {
//   return (
//     <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
//       <h3 className="text-lg font-semibold mb-4" style={{ color: PALETTE.text }}>{title}</h3>
//       <div className="h-[260px]">{children}</div>
//     </div>
//   );
// }

// function ActivityFeed({ items }) {
//   return (
//     <Panel title="Recent Activity">
//       <ul className="space-y-3">
//         {items.map((a, i) => (
//           <li key={i} className="flex justify-between text-sm border-b pb-2 last:border-none">
//             <span className="text-[#213547]">{a.text}</span>
//             <span className="text-gray-500 text-xs">{a.time}</span>
//           </li>
//         ))}
//       </ul>
//     </Panel>
//   );
// }

// function RecentLists({ projects, tasks }) {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//       <Panel title="Recent Projects">
//         {projects.length ? (
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="text-left border-b"><th>Name</th><th>Status</th></tr>
//             </thead>
//             <tbody>
//               {projects.slice(0, 5).map((p) => (
//                 <tr key={p._id} className="border-b hover:bg-gray-50">
//                   <td>{p.name}</td>
//                   <td>{p.status}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : <p>No projects yet.</p>}
//       </Panel>
//       <Panel title="Recent Tasks">
//         {tasks.length ? (
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="text-left border-b"><th>Title</th><th>Status</th><th>Priority</th></tr>
//             </thead>
//             <tbody>
//               {tasks.slice(0, 5).map((t) => (
//                 <tr key={t._id} className="border-b hover:bg-gray-50">
//                   <td>{t.title}</td>
//                   <td>{t.status}</td>
//                   <td>{t.priority}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : <p>No tasks yet.</p>}
//       </Panel>
//     </div>
//   );
// }
// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../utils/api";
import {
  FaUsers,
  FaTasks,
  FaCalendarAlt,
  FaProjectDiagram,
} from "react-icons/fa";

// Chart.js
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

/* ------------------------------------------------------------------
   Color palette (global theme)
------------------------------------------------------------------- */
const PALETTE = {
  sage: "#819A91",
  pastel: "#A7C1A8",
  olive: "#D1D8BE",
  cream: "#EEEFE0",
  text: "#213547",
  white: "#FFFFFF",
};

/* ------------------------------------------------------------------
   Dashboard Page
------------------------------------------------------------------- */
export default function Dashboard() {
  const navigate = useNavigate();

  /* ---------------- state ---------------- */
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([]); // [{label,present}]

  /* ---------------- initial load ---------------- */
  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        setLoading(true);

        // Fetch in parallel
        const [projRes, taskRes, empRes, attRes] = await Promise.allSettled([
          api.get("/projects"),
          api.get("/tasks/all"), // your aggregated/all tasks route
          api.get("/employees"),
          api.get("/attendance/stats/overview").catch(() => ({ data: [] })),
        ]);

        if (ignore) return;

        setProjects(Array.isArray(projRes.value?.data) ? projRes.value.data : []);
        setTasks(Array.isArray(taskRes.value?.data) ? taskRes.value.data : []);
        setEmployees(Array.isArray(empRes.value?.data) ? empRes.value.data : []);

        // Attendance -> transform
        const attRaw = attRes.value?.data || [];
        if (Array.isArray(attRaw) && attRaw.length) {
          const mapped = attRaw.slice(-5).map((r) => ({
            label: `${r._id?.month || ""}/${r._id?.year || ""}`,
            present: r.presentCount || 0,
          }));
          setAttendanceTrend(mapped);
        } else {
          // fallback
          setAttendanceTrend([
            { label: "Mon", present: 34 },
            { label: "Tue", present: 37 },
            { label: "Wed", present: 36 },
            { label: "Thu", present: 40 },
            { label: "Fri", present: 38 },
          ]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  /* ---------------- derived: stat values ---------------- */
  const totalEmployees = employees.length;
  const totalProjects = projects.length;
  const totalTasks = tasks.length;

  // crude "attendance %" = avg present / employees
  const attendancePercent = useMemo(() => {
    if (!attendanceTrend.length || !totalEmployees) return 0;
    const totalPresent = attendanceTrend.reduce((sum, d) => sum + d.present, 0);
    const avg = totalPresent / attendanceTrend.length;
    return Math.round((avg / totalEmployees) * 100);
  }, [attendanceTrend, totalEmployees]);

  /* ---------------- derived: task distribution ---------------- */
  const taskCounts = useMemo(() => {
    const counts = { TO_DO: 0, IN_PROGRESS: 0, DONE: 0 };
    tasks.forEach((t) => {
      if (counts[t.status] !== undefined) counts[t.status] += 1;
    });
    return counts;
  }, [tasks]);

  /* ---------------- derived: dept employee counts ---------------- */
  const deptCounts = useMemo(() => {
    const map = {};
    employees.forEach((e) => {
      const key = e.department || "Unassigned";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([department, count]) => ({
      department,
      count,
    }));
  }, [employees]);

  /* ---------------- chart data: pie (tasks) ---------------- */
  const pieData = {
    labels: ["To Do", "In Progress", "Done"],
    datasets: [
      {
        data: [taskCounts.TO_DO, taskCounts.IN_PROGRESS, taskCounts.DONE],
        backgroundColor: [PALETTE.sage, PALETTE.pastel, PALETTE.olive],
        borderColor: PALETTE.white,
        borderWidth: 2,
      },
    ],
  };
  const pieOptions = {
    plugins: {
      legend: { position: "bottom", labels: { color: PALETTE.text } },
    },
    maintainAspectRatio: false,
  };

  /* ---------------- chart data: bar (dept) ---------------- */
  const barData = {
    labels: deptCounts.map((d) => d.department),
    datasets: [
      {
        label: "Employees",
        data: deptCounts.map((d) => d.count),
        backgroundColor: PALETTE.sage,
        hoverBackgroundColor: PALETTE.pastel,
        borderRadius: 6,
      },
    ],
  };
  const barOptions = {
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        ticks: { color: PALETTE.text },
        grid: { display: false },
      },
      y: {
        ticks: { color: PALETTE.text },
        grid: { color: "rgba(0,0,0,0.05)" },
        beginAtZero: true,
        precision: 0,
      },
    },
    maintainAspectRatio: false,
  };

  /* ---------------- chart data: line (attendance) ---------------- */
  const lineData = {
    labels: attendanceTrend.map((d) => d.label),
    datasets: [
      {
        label: "Present",
        data: attendanceTrend.map((d) => d.present),
        fill: true,
        borderColor: PALETTE.sage,
        backgroundColor: PALETTE.pastel + "33", // alpha overlay
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: PALETTE.sage,
      },
    ],
  };
  const lineOptions = {
    plugins: {
      legend: { display: true, position: "top", labels: { color: PALETTE.text } },
    },
    scales: {
      x: {
        ticks: { color: PALETTE.text },
        grid: { display: false },
      },
      y: {
        ticks: { color: PALETTE.text },
        grid: { color: "rgba(0,0,0,0.05)" },
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };

  /* ---------------- sample activity feed ---------------- */
  const recentActivity = useMemo(() => {
    const acts = [];
    if (tasks[0]) acts.push({ text: `Task "${tasks[0].title}" created`, time: "Just now" });
    if (projects[0]) acts.push({ text: `Project "${projects[0].name}" updated`, time: "5m ago" });
    if (employees[0]) acts.push({ text: `${employees[0].name} joined`, time: "Today" });
    if (!acts.length) {
      return [{ text: "No recent activity yet.", time: "" }];
    }
    return acts;
  }, [tasks, projects, employees]);

  /* ---------------- render content ---------------- */
  const page = (
    <div className="flex flex-col gap-8 w-full">
      {/* Quick Stats (clickable) */}
      <StatsGrid
        employees={totalEmployees}
        projects={totalProjects}
        tasks={totalTasks}
        attendance={attendancePercent}
        onEmployees={() => navigate("/employees")}
        onProjects={() => navigate("/projects")}
        onTasks={() => navigate("/tasks")}
        onAttendance={() => navigate("/attendance")}
      />

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full">
        {/* Pie */}
        <Panel title="Task Distribution">
          <div className="h-[260px]">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </Panel>

        {/* Bar */}
        <Panel title="Employees by Department">
          <div className="h-[260px]">
            <Bar data={barData} options={barOptions} />
          </div>
        </Panel>

        {/* Line */}
        <Panel title="Attendance Trend">
          <div className="h-[260px]">
            <Line data={lineData} options={lineOptions} />
          </div>
        </Panel>
      </div>

      {/* Recent Activity + Recent Projects/Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ActivityFeed items={recentActivity} />
        <RecentLists projects={projects} tasks={tasks} />
      </div>
    </div>
  );

  return (
    <Layout pageTitle="Dashboard">
      {loading ? (
        <div className="w-full text-center py-20 text-lg font-medium text-gray-500">
          Loading dashboard...
        </div>
      ) : (
        page
      )}
    </Layout>
  );
}

/* ------------------------------------------------------------------
   Stats Cards Grid (clickable)
------------------------------------------------------------------- */
function StatsGrid({
  employees,
  projects,
  tasks,
  attendance,
  onEmployees,
  onProjects,
  onTasks,
  onAttendance,
}) {
  const cards = [
    {
      label: "Employees",
      value: employees,
      icon: <FaUsers />,
      bg: PALETTE.sage,
      action: onEmployees,
    },
    {
      label: "Projects",
      value: projects,
      icon: <FaProjectDiagram />,
      bg: PALETTE.pastel,
      action: onProjects,
    },
    {
      label: "Tasks",
      value: tasks,
      icon: <FaTasks />,
      bg: PALETTE.olive,
      action: onTasks,
    },
    {
      label: "Attendance",
      value: `${attendance}%`,
      icon: <FaCalendarAlt />,
      bg: PALETTE.cream,
      action: onAttendance,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((c) => (
        <button
          key={c.label}
          type="button"
          onClick={c.action}
          className="text-left flex items-center gap-4 p-5 rounded-xl shadow hover:shadow-md transition border border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            backgroundColor: c.bg,
            color: PALETTE.text,
            outlineColor: PALETTE.sage,
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl text-white shadow"
            style={{ backgroundColor: PALETTE.text }}
          >
            {c.icon}
          </div>
          <div>
            <p className="text-sm leading-none mb-1">{c.label}</p>
            <p className="text-2xl font-bold">{c.value}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------
   Generic Panel wrapper
------------------------------------------------------------------- */
function Panel({ title, className = "", children }) {
  return (
    <div
      className={`bg-white rounded-xl shadow p-6 border ${className}`}
      style={{ borderColor: PALETTE.olive }}
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: PALETTE.text }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------
   Activity Feed
------------------------------------------------------------------- */
function ActivityFeed({ items }) {
  return (
    <Panel title="Recent Activity">
      <ul className="space-y-3">
        {items.map((a, i) => (
          <li
            key={i}
            className="flex justify-between items-start border-b last:border-none pb-2 text-sm"
            style={{ borderColor: PALETTE.olive, color: PALETTE.text }}
          >
            <span>{a.text}</span>
            <span className="text-gray-500 text-xs">{a.time}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ------------------------------------------------------------------
   Recent Projects + Tasks
------------------------------------------------------------------- */
function RecentLists({ projects, tasks }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Panel title="Recent Projects">
        {projects.length ? (
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left border-b"
                style={{ borderColor: PALETTE.olive, color: PALETTE.text }}
              >
                <th className="py-2 pr-2">Name</th>
                <th className="py-2 pr-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.slice(0, 5).map((p) => (
                <tr
                  key={p._id}
                  className="border-b last:border-none hover:bg-[#EEEFE0]/60 transition"
                  style={{ borderColor: PALETTE.olive, color: PALETTE.text }}
                >
                  <td className="py-1 pr-2">{p.name}</td>
                  <td className="py-1 pr-2">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">No projects yet.</p>
        )}
      </Panel>

      <Panel title="Recent Tasks">
        {tasks.length ? (
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left border-b"
                style={{ borderColor: PALETTE.olive, color: PALETTE.text }}
              >
                <th className="py-2 pr-2">Title</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2 pr-2">Priority</th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 5).map((t) => (
                <tr
                  key={t._id}
                  className="border-b last:border-none hover:bg-[#EEEFE0]/60 transition"
                  style={{ borderColor: PALETTE.olive, color: PALETTE.text }}
                >
                  <td className="py-1 pr-2">{t.title}</td>
                  <td className="py-1 pr-2">{t.status}</td>
                  <td className="py-1 pr-2">{t.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">No tasks yet.</p>
        )}
      </Panel>
    </div>
  );
}
