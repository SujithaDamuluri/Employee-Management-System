// import React from "react";
// import { NavLink } from "react-router-dom";
// import {
//   FaTachometerAlt,
//   FaUsers,
//   FaBuilding,
//   FaUserCircle,
//   FaSignOutAlt,
// } from "react-icons/fa";

// /**
//  * SidebarNav
//  * Props:
//  *  - isOpen (bool) mobile open/closed
//  *  - onClose (fn) close callback on mobile
//  *  - onLogout (fn)
//  *  - user (obj) { name, role }
//  */
// export default function SidebarNav({ isOpen, onClose, onLogout, user }) {
//   const navItems = [
//     { path: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
//     { path: "/employees", label: "Employees", icon: <FaUsers /> },
//     { path: "/departments", label: "Departments", icon: <FaBuilding /> },
//     { path: "/profile", label: "My Profile", icon: <FaUserCircle /> },
//   ];

//   return (
//     <>
//       {/* Mobile overlay */}
//       {isOpen && (
//         <div
//           className="lg:hidden fixed inset-0 bg-black/40 z-30"
//           onClick={onClose}
//         />
//       )}

//       <aside
//         className={`fixed z-40 inset-y-0 left-0 transform ${
//           isOpen ? "translate-x-0" : "-translate-x-full"
//         } transition-transform duration-300 ease-in-out
//           lg:translate-x-0 lg:static lg:inset-0
//           w-64 bg-[var(--color-sage)] text-white shadow-xl flex flex-col`}
//       >
//         {/* Brand */}
//         <div className="flex items-center justify-center py-5 text-2xl font-bold bg-[var(--color-sage-light)] w-full">
//           StaffSphere
//         </div>

//         {/* Nav */}
//         <nav className="mt-4 flex-1 space-y-1 px-3 overflow-y-auto">
//           {navItems.map((item) => (
//             <NavLink
//               key={item.path}
//               to={item.path}
//               onClick={onClose}
//               className={({ isActive }) =>
//                 `flex items-center px-4 py-2 rounded-lg transition text-base ${
//                   isActive
//                     ? "bg-white text-[var(--color-sage)] font-semibold shadow"
//                     : "hover:bg-[var(--color-sage-light)] hover:text-white/90"
//                 }`
//               }
//             >
//               <span className="mr-3 text-lg">{item.icon}</span>
//               {item.label}
//             </NavLink>
//           ))}
//         </nav>

//         {/* Footer / Logout */}
//         <div className="p-3 border-t border-white/20 w-full">
//           <button
//             onClick={onLogout}
//             className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition text-white"
//           >
//             <FaSignOutAlt />
//             Logout
//           </button>
//           {user?.role && (
//             <p className="mt-3 text-center text-xs text-white/80">
//               Signed in as <span className="font-semibold">{user.role}</span>
//             </p>
//           )}
//         </div>
//       </aside>
//     </>
//   );
// }


import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUsers,
  FaBuilding,
  FaProjectDiagram,
  FaTasks,
  FaChartPie,
  FaUserCircle,
  FaUserEdit,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa";

/**
 * SidebarNav
 * Props:
 *  - isOpen (bool) mobile open/closed
 *  - onClose (fn)
 *  - onLogout (fn)
 *  - user (obj) { name, role }
 */
// export default function SidebarNav({ isOpen, onClose, onLogout, user }) {
//   const navItems = [
//     { path: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
//     { path: "/attendance", label: "Attendance", icon: <FaCalendarAlt /> },
//     { path: "/employees", label: "Employees", icon: <FaUsers /> },
//     { path: "/departments", label: "Departments", icon: <FaBuilding /> },
//     { path: "/projects", label: "Projects", icon: <FaProjectDiagram /> },
//     { path: "/tasks", label: "Tasks", icon: <FaTasks /> },
//     { path: "/leaves", label: "Leaves", icon: <FaCalendarCheck /> }, 
//     {
//       path: "/manager-insights",
//       label: "Manager Insights",
//       icon: <FaChartPie />,
//     },
//     { path: "/profile", label: "My Profile", icon: <FaUserCircle /> },
//     { path: "/edit-profile", label: "Edit Profile", icon: <FaUserEdit /> },
//   ];

//   // Palette
//   const SAGE = "#819A91";
//   const PASTEL = "#A7C1A8";
//   const CREAM = "#EEEFE0";
//   const TEXT_DARK = "#213547";

//   return (
//     <>
//       {/* Mobile overlay */}
//       {isOpen && (
//         <div
//           className="lg:hidden fixed inset-0 bg-black/40 z-30"
//           onClick={onClose}
//         />
//       )}

//       <aside
//         className={`fixed z-40 inset-y-0 left-0 transform ${
//           isOpen ? "translate-x-0" : "-translate-x-full"
//         } transition-transform duration-300 ease-in-out
//           lg:translate-x-0 lg:static lg:inset-0
//           w-64 shadow-xl flex flex-col`}
//         style={{ backgroundColor: SAGE, color: CREAM }}
//       >
//         {/* Brand */}
//         <div
//           className="flex items-center justify-center py-5 text-2xl font-bold shadow-md w-full"
//           style={{ backgroundColor: PASTEL, color: TEXT_DARK }}
//         >
//           StaffSphere
//         </div>

//         {/* Nav */}
//         <nav className="mt-4 flex-1 space-y-1 px-3 overflow-y-auto">
//           {navItems.map((item) => (
//             <NavLink
//               key={item.path}
//               to={item.path}
//               end
//               onClick={onClose}
//               className="block"
//             >
//               {({ isActive }) => (
//                 <div
//                   className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-base ${
//                     isActive
//                       ? "font-semibold shadow-md"
//                       : "hover:shadow hover:scale-[1.01]"
//                   }`}
//                   style={{
//                     backgroundColor: isActive ? CREAM : "transparent",
//                     color: isActive ? TEXT_DARK : CREAM,
//                   }}
//                 >
//                   <span
//                     className="mr-3 text-lg flex-shrink-0"
//                     style={{ color: isActive ? TEXT_DARK : CREAM }}
//                   >
//                     {item.icon}
//                   </span>
//                   <span className="truncate">{item.label}</span>
//                 </div>
//               )}
//             </NavLink>
//           ))}
//         </nav>

//         {/* Footer / Logout */}
//         <div className="p-3 border-t w-full" style={{ borderColor: "#ffffff33" }}>
//           <button
//             onClick={onLogout}
//             className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition text-white shadow"
//             style={{ backgroundColor: "#e53935" }}
//             onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d32f2f")}
//             onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e53935")}
//           >
//             <FaSignOutAlt />
//             Logout
//           </button>
//           {user?.role && (
//             <p className="mt-3 text-center text-xs opacity-80">
//               Signed in as <span className="font-semibold">{user.role}</span>
//             </p>
//           )}
//         </div>
//       </aside>
//     </>
//   );
// }

export default function SidebarNav({ isOpen, onClose, onLogout, user }) {
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/attendance", label: "Attendance", icon: <FaCalendarAlt /> },
    { path: "/employees", label: "Employees", icon: <FaUsers /> },
    { path: "/departments", label: "Departments", icon: <FaBuilding /> },
    { path: "/projects", label: "Projects", icon: <FaProjectDiagram /> },
    { path:"/projects/687cc9da7abb6af89e299a8a/tasks" , label: "Tasks", icon: <FaTasks /> },
    { path: "/payroll", label: "Payroll", icon: <FaMoneyBillWave /> },
    { path: "/performance", label: "Performance", icon: <FaChartBar /> },

    { path: "/leaves", label: "Leaves", icon: <FaCalendarCheck /> },  // <-- ADDED
    {
      path: "/manager-insights",
      label: "Manager Insights",
      icon: <FaChartPie />,
    },
    { path: "/profile", label: "My Profile", icon: <FaUserCircle /> },
    { path: "/edit-profile", label: "Edit Profile", icon: <FaUserEdit /> },
  ];

  // Palette
  const SAGE = "#819A91";
  const PASTEL = "#A7C1A8";
  const CREAM = "#EEEFE0";
  const TEXT_DARK = "#213547";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-30"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed z-40 inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          w-64 shadow-xl flex flex-col`}
        style={{ backgroundColor: SAGE, color: CREAM }}
      >
        {/* Brand */}
        <div
          className="flex items-center justify-center py-5 text-2xl font-bold shadow-md w-full"
          style={{ backgroundColor: PASTEL, color: TEXT_DARK }}
        >
          StaffSphere
        </div>

        {/* Nav */}
        <nav className="mt-4 flex-1 space-y-1 px-3 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              onClick={onClose}
              className="block"
            >
              {({ isActive }) => (
                <div
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-base ${
                    isActive
                      ? "font-semibold shadow-md"
                      : "hover:shadow hover:scale-[1.01]"
                  }`}
                  style={{
                    backgroundColor: isActive ? CREAM : "transparent",
                    color: isActive ? TEXT_DARK : CREAM,
                  }}
                >
                  <span
                    className="mr-3 text-lg flex-shrink-0"
                    style={{ color: isActive ? TEXT_DARK : CREAM }}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div
          className="p-3 border-t w-full"
          style={{ borderColor: "#ffffff33" }}
        >
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition text-white shadow"
            style={{ backgroundColor: "#e53935" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#d32f2f")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#e53935")
            }
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
