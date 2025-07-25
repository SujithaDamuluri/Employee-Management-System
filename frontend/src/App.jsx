// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import { ToastContainer } from "react-toastify";
// import 'react-toastify/dist/ReactToastify.css';

// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import Profile from "./pages/Profile";
// import Dashboard from "./pages/Dashboard";
// import Employees from "./pages/Employees";
// import Departments from "./pages/Departments";
// import ManagerInsights from "./pages/ManagerInsights";
// import Projects from "./pages/Projects";
// import Attendance from "./pages/Attendance";
// import Tasks from "./pages/Tasks";
// import Leaves from "./pages/Leaves";
// import Payroll from "./pages/Payroll";
// import Performance from "./pages/Performance";

// import ViewUpdateProfile from "./components/ESS/ViewUpdateProfile";
// /**
//  * Global app wrapper:
//  * - Removes ALL gradient backgrounds.
//  * - Uses your theme background (var(--color-cream)) from index.css.
//  */
// export default function App() {
//   return (
//     <div
//       className="min-h-screen w-full"
//       style={{ backgroundColor: "var(--color-cream)" }}
//     >
//         <ToastContainer position="top-right" autoClose={3000} />
//       <Routes>
//         <Route path="/" element={<Navigate to="/login" replace />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/profile" element={<Profile />} />
//          <Route path="/dashboard" element={<Dashboard />} />
//          <Route path="/employees" element={<Employees />} />
//          <Route path="/departments" element={<Departments />} />
//          <Route path="/projects" element={<Projects />} />
//          <Route path="/attendance" element={<Attendance />} />
//          <Route path="/leaves" element={<Leaves />} />
//          <Route path="/payroll" element={<Payroll />} />
//          <Route path="/performance" element={<Performance />} />
//          <Route path="/ess/profile" element={<ViewUpdateProfile />} />

    


//          <Route path="/projects/:projectId/tasks" element={<Tasks />} />
//          <Route path="/manager-insights" element={<ManagerInsights />} />
//         <Route path="*" element={<Navigate to="/login" replace />} />
//       </Routes>
//     </div>
//   );
// }


import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import ManagerInsights from "./pages/ManagerInsights";
import Projects from "./pages/Projects";
import Attendance from "./pages/Attendance";
import Tasks from "./pages/Tasks";
import Leaves from "./pages/Leaves";
import Payroll from "./pages/Payroll";
import Performance from "./pages/Performance";
import ViewUpdateProfile from "./components/ESS/ViewUpdateProfile";

// Context
import { UserProvider } from "./context/UserContext";

const App = () => {
  return (
    <UserProvider>
      <div
        className="min-h-screen w-full"
        style={{ backgroundColor: "var(--color-cream)" }}
      >
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId/tasks" element={<Tasks />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leaves" element={<Leaves />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/ess/profile" element={<ViewUpdateProfile />} />
          <Route path="/manager-insights" element={<ManagerInsights />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </UserProvider>
  );
};

export default App;
