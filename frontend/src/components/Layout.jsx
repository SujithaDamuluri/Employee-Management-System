// // import React, { useState, useEffect } from "react";
// // import { useNavigate, useLocation } from "react-router-dom";
// // import SidebarNav from "./SidebarNav";
// // import { GiHamburgerMenu } from "react-icons/gi";
// // import api from "../utils/api";

// // /**
// //  * App shell wrapper. Provides:
// //  * - SidebarNav (collapsible)
// //  * - Topbar w/ page title + user snippet
// //  * - Fetches user name from /auth/me (once)
// //  *
// //  * Props:
// //  *  - children
// //  *  - pageTitle? string
// //  */
// // export default function Layout({ children, pageTitle }) {
// //   const [sidebarOpen, setSidebarOpen] = useState(false);
// //   const [user, setUser] = useState(null);
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   // pull user once for topbar + sidebar footer role
// //   useEffect(() => {
// //     (async () => {
// //       try {
// //         const res = await api.get("/auth/me");
// //         setUser(res.data?.user || null);
// //       } catch {
// //         // probably not logged in
// //       }
// //     })();
// //   }, []);

// //   const handleLogout = () => {
// //     localStorage.removeItem("token");
// //     // if you later add a logout API, call it here
// //     navigate("/login");
// //   };

// //   // derive topbar title if not provided
// //   const routeTitleMap = {
// //     "/dashboard": "Dashboard",
// //     "/employees": "Employees",
// //     "/departments": "Departments",
// //     "/profile": "My Profile",
// //   };
// //   const derivedTitle =
// //     pageTitle || routeTitleMap[location.pathname] || "StaffSphere";

// //   return (
// //     <div className="flex min-h-screen bg-[var(--color-cream)] text-[#213547]">
// //       <SidebarNav
// //         isOpen={sidebarOpen}
// //         onClose={() => setSidebarOpen(false)}
// //         onLogout={handleLogout}
// //         user={user}
// //       />

// //       {/* Main column */}
// //       <div className="flex-1 flex flex-col min-w-0">
// //         {/* Topbar */}
// //         <header className="flex items-center justify-between bg-white px-4 py-3 shadow-md sticky top-0 z-20">
// //           <button
// //             className="lg:hidden text-gray-600 text-2xl"
// //             onClick={() => setSidebarOpen((s) => !s)}
// //             aria-label="Toggle navigation"
// //           >
// //             <GiHamburgerMenu />
// //           </button>
// //           <h1 className="text-xl font-bold text-[#2d3e40]">{derivedTitle}</h1>
// //           <div className="flex items-center space-x-3">
// //             <span className="font-medium text-gray-700 max-w-[140px] truncate">
// //               {user?.name || "User"}
// //             </span>
// //             <img
// //               src="https://i.pravatar.cc/40"
// //               alt="avatar"
// //               className="w-10 h-10 rounded-full border"
// //             />
// //           </div>
// //         </header>

// //         {/* Page Content */}
// //         <main className="p-6 w-full">{children}</main>
// //       </div>
// //     </div>
// //   );
// // }

// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import SidebarNav from "./SidebarNav";
// import { GiHamburgerMenu } from "react-icons/gi";
// import api from "../utils/api";

// export default function Layout({ children, pageTitle }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await api.get("/auth/me");
//         setUser(res.data?.user || null);
//       } catch {
//         // Probably not logged in
//       }
//     })();
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   const routeTitleMap = {
//     "/dashboard": "Dashboard",
//     "/employees": "Employees",
//     "/departments": "Departments",
//     "/profile": "My Profile",
//   };
//   const derivedTitle =
//     pageTitle || routeTitleMap[location.pathname] || "StaffSphere";

//   return (
//     <div
//       className="flex min-h-screen text-[#213547]"
//       style={{ backgroundColor: "#EEEFE0" }} // Cream background
//     >
//       {/* Sidebar */}
//       <SidebarNav
//         isOpen={sidebarOpen}
//         onClose={() => setSidebarOpen(false)}
//         onLogout={handleLogout}
//         user={user}
//       />

//       {/* Main column */}
//       <div className="flex-1 flex flex-col min-w-0">
//         {/* Topbar */}
//         <header
//           className="flex items-center justify-between px-5 py-3 shadow-md sticky top-0 z-20"
//           style={{ backgroundColor: "#819A91" }} // Sage topbar
//         >
//           <button
//             className="lg:hidden text-white text-2xl"
//             onClick={() => setSidebarOpen((s) => !s)}
//             aria-label="Toggle navigation"
//           >
//             <GiHamburgerMenu />
//           </button>
//           <h1 className="text-xl font-bold text-white tracking-wide">
//             {derivedTitle}
//           </h1>
//           <div className="flex items-center space-x-3">
//             <span className="font-medium text-white max-w-[140px] truncate">
//               {user?.name || "User"}
//             </span>
//             <img
//               src="https://i.pravatar.cc/40"
//               alt="avatar"
//               className="w-10 h-10 rounded-full border border-white"
//             />
//           </div>
//         </header>

//         {/* Page Content */}
//         <main className="p-6 w-full text-[#213547] bg-[#D1D8BE]">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }

// src/components/Layout.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { GiHamburgerMenu } from "react-icons/gi";
// import { FaUserCircle, FaUserEdit, FaSignOutAlt } from "react-icons/fa";
// import SidebarNav from "./SidebarNav";
// import api from "../utils/api";

// /* ------------------------------------------------------------------
//    Theme palette (centralized so we’re not scattering strings)
// ------------------------------------------------------------------- */
// const COLORS = {
//   sage: "#819A91",
//   pastel: "#A7C1A8",
//   olive: "#D1D8BE",
//   cream: "#EEEFE0",
//   text: "#213547",
//   white: "#FFFFFF",
// };

// /* ------------------------------------------------------------------
//    Top-right profile dropdown (Amazon-like)
// ------------------------------------------------------------------- */
// function TopRightProfile({ user, onLogout }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);
//   const navigate = useNavigate();

//   // Close when clicking outside
//   useEffect(() => {
//     function handleClickOutside(e) {
//       if (ref.current && !ref.current.contains(e.target)) {
//         setOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const go = (path) => {
//     setOpen(false);
//     navigate(path);
//   };

//   const avatarSrc =
//     user?.avatarUrl ||
//     "https://i.pravatar.cc/80?u=" + encodeURIComponent(user?._id || "user");

//   return (
//     <div className="relative" ref={ref}>
//       <button
//         type="button"
//         onClick={() => setOpen((o) => !o)}
//         className="w-10 h-10 rounded-full overflow-hidden border border-white/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
//         aria-haspopup="menu"
//         aria-expanded={open}
//       >
//         <img
//           src={avatarSrc}
//           alt={user?.name ? `${user.name} profile` : "profile"}
//           className="w-full h-full object-cover"
//         />
//       </button>

//       {open && (
//         <div
//           role="menu"
//           className="absolute right-0 mt-2 w-56 bg-white text-[var(--color-text,#213547)] rounded-lg shadow-xl border border-gray-200 z-50"
//         >
//           <div className="px-4 py-3 border-b border-gray-200">
//             <p className="text-sm text-gray-500">Signed in as</p>
//             <p className="font-semibold truncate">
//               {user?.name || "User"}
//             </p>
//           </div>
//           <button
//             role="menuitem"
//             onClick={() => go("/profile")}
//             className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
//           >
//             <FaUserCircle /> My Profile
//           </button>
//           <button
//             role="menuitem"
//             onClick={() => go("/edit-profile")}
//             className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
//           >
//             <FaUserEdit /> Edit Profile
//           </button>
//           <button
//             role="menuitem"
//             onClick={onLogout}
//             className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//           >
//             <FaSignOutAlt /> Logout
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ------------------------------------------------------------------
//    Layout wrapper component
// ------------------------------------------------------------------- */
// export default function Layout({ children, pageTitle }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Load current user for header + sidebar
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await api.get("/auth/me");
//         setUser(res.data?.user || null);
//       } catch {
//         // ignore (not logged in)
//       }
//     })();
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   // Title map fallback
//   const routeTitleMap = {
//     "/dashboard": "Dashboard",
//     "/attendance": "Attendance",
//     "/employees": "Employees",
//     "/departments": "Departments",
//     "/projects": "Projects",
//     "/tasks": "Tasks",
//     "/manager-insights": "Manager Insights",
//     "/profile": "My Profile",
//     "/edit-profile": "Edit Profile",
//   };
//   const derivedTitle =
//     pageTitle || routeTitleMap[location.pathname] || "StaffSphere";

//   return (
//     <div
//       className="flex min-h-screen text-[var(--color-text,#213547)]"
//       style={{ backgroundColor: COLORS.cream }}
//     >
//       {/* Sidebar */}
//       <SidebarNav
//         isOpen={sidebarOpen}
//         onClose={() => setSidebarOpen(false)}
//         onLogout={handleLogout}
//         user={user}
//       />

//       {/* Main column */}
//       <div className="flex-1 flex flex-col min-w-0">
//         {/* Topbar */}
//         <header
//           className="flex items-center justify-between px-5 py-3 shadow-md sticky top-0 z-20"
//           style={{ backgroundColor: COLORS.sage }}
//         >
//           <button
//             className="lg:hidden text-white text-2xl"
//             onClick={() => setSidebarOpen((s) => !s)}
//             aria-label="Toggle navigation"
//           >
//             <GiHamburgerMenu />
//           </button>
//           <h1 className="text-xl font-bold text-white tracking-wide">
//             {derivedTitle}
//           </h1>

//           {/* Amazon-like profile dropdown */}
//           <TopRightProfile user={user} onLogout={handleLogout} />
//         </header>

//         {/* Page Content */}
//         <main
//           className="p-6 w-full"
//           style={{ backgroundColor: COLORS.olive, color: COLORS.text }}
//         >
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaUserCircle, FaUserEdit, FaSignOutAlt } from "react-icons/fa";
import SidebarNav from "./SidebarNav";
import api from "../utils/api";

/* ------------------------------------------------------------------
   Theme palette
------------------------------------------------------------------- */
const COLORS = {
  sage: "#819A91",
  pastel: "#A7C1A8",
  olive: "#D1D8BE",
  cream: "#EEEFE0",
  text: "#213547",
  white: "#FFFFFF",
};

/* ------------------------------------------------------------------
   Top-right profile dropdown with image
------------------------------------------------------------------- */
function TopRightProfile({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  // const avatarSrc =
  // user?.imageUrl
  //   ? (user.imageUrl.startsWith("http") ? user.imageUrl : serverBaseUrl + user.imageUrl)
  //   : user?.profileImage || user?.avatarUrl || `https://i.pravatar.cc/80?u=${encodeURIComponent(user?._id || "user")}`; 
const avatarSrc =
  user?.image && user.image !== ""
    ? (user.image.startsWith("http")
        ? user.image
        : `${serverBaseUrl}/uploads/${user.image}`)
    : "/images/default-profile.png";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-10 h-10 rounded-full overflow-hidden border border-white/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <img
          src={avatarSrc}
          alt={user?.name ? `${user.name} profile` : "profile"}
          className="w-full h-full object-cover"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-white text-[var(--color-text,#213547)] rounded-lg shadow-xl border border-gray-200 z-50"
        >
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm text-gray-500">Signed in as</p>
            <p className="font-semibold truncate">
              {user?.name || "User"}
            </p>
          </div>
          <button
            role="menuitem"
            onClick={() => go("/profile")}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
          >
            <FaUserCircle /> My Profile
          </button>
          <button
            role="menuitem"
            onClick={() => go("/edit-profile")}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
          >
            <FaUserEdit /> Edit Profile
          </button>
          <button
            role="menuitem"
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   Layout wrapper component
------------------------------------------------------------------- */
export default function Layout({ children, pageTitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data?.user || null);
      } catch (err) {
        // ignore silently
      }
    })();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const routeTitleMap = {
    "/dashboard": "Dashboard",
    "/attendance": "Attendance",
    "/employees": "Employees",
    "/departments": "Departments",
    "/projects": "Projects",
    "/tasks": "Tasks",
    "/manager-insights": "Manager Insights",
    "/profile": "My Profile",
    "/edit-profile": "Edit Profile",
  };
  const derivedTitle = pageTitle || routeTitleMap[location.pathname] || "StaffSphere";

  return (
    <div
      className="flex min-h-screen text-[var(--color-text,#213547)]"
      style={{ backgroundColor: COLORS.cream }}
    >
      {/* Sidebar */}
      <SidebarNav
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        user={user}
      />

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header
          className="flex items-center justify-between px-5 py-3 shadow-md sticky top-0 z-20"
          style={{ backgroundColor: COLORS.sage }}
        >
          <button
            className="lg:hidden text-white text-2xl"
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="Toggle navigation"
          >
            <GiHamburgerMenu />
          </button>
          <h1 className="text-xl font-bold text-white tracking-wide">
            {derivedTitle}
          </h1>

          {/* Profile */}
          <TopRightProfile user={user} onLogout={handleLogout} />
        </header>

        {/* Routed Page Content */}
        <main
          className="p-6 w-full"
          style={{ backgroundColor: COLORS.olive, color: COLORS.text }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
