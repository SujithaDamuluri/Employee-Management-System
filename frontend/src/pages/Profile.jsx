// src/pages/Profile.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FaEdit,
  FaCamera,
  FaSave,
  FaLock,
  FaBell,
  FaCog,
  FaChevronDown,
  FaChevronUp,
  FaDownload,
  FaTimes,
  FaTrashAlt,
  FaSearch,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import SidebarNav from "../components/SidebarNav"; // or the correct path if different




// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

// Color palette for theme and accents
const COLORS = {
  sage: "#819A91",
  pastel: "#A7C1A8",
  olive: "#D1D8BE",
  cream: "#EEEFE0",
  text: "#213547",
  darkBg: "#2d3e40",
};

// Utility for password strength calculation
const passwordStrength = (password) => {
  let score = 0;
  if (!password) return score;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [darkMode, setDarkMode] = useState(false);


  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
  });


  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);


  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    weeklyDigest: true,
  });
  const [activities, setActivities] = useState([]);
  const [settingsModal, setSettingsModal] = useState(false);
  const [collapsePassword, setCollapsePassword] = useState(true);
  const [collapseNotifications, setCollapseNotifications] = useState(true);
  const [collapseCharts, setCollapseCharts] = useState(true);


  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/auth/me");
        const u = res.data?.user;
        if (u) {
          setUser(u);
          setForm({
            name: u.name ?? "",
            email: u.email ?? "",
            phone: u.phone ?? "",
            department: u.department ?? "",
          });
        }
      } catch (err) {
        console.error("Profile load /auth/me error:", err);
      }


      try {
        const actRes = await axios.get("/profile/activities");
        setActivities(actRes.data || []);
      } catch (err) {
        console.error("Profile load activities error:", err);
      }
    })();
  }, []);


  const handleFormChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));


  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };


  const handleSaveProfile = async () => {
    try {
      await axios.put("/profile/", form);
      setEditMode(false);
    } catch (err) {
      console.error("Profile update error:", err);
      alert("Failed to update profile.");
    }
  };


  // const handlePasswordChange = async () => {
  //   if (!passwords.current || !passwords.next) {
  //     alert("Enter both current and new password.");
  //     return;
  //   }
  //   try {
  //     await axios.put("/profile/change-password", {
  //       currentPassword: passwords.current,
  //       newPassword: passwords.next,
  //     });
  //     alert("Password updated!");
  //     setPasswords({ current: "", next: "" });
  //   } catch (err) {
  //     console.error("Password change error:", err);
  //     alert("Failed to change password.");
  //   }
  // };
  const handlePasswordChange = async () => {
  const token = localStorage.getItem("token");

  if (!passwords.current || !passwords.next) {
    alert("Enter both current and new password.");
    return;
  }

  try {
    await axios.put(
      "/profile/change-password",
      {
        currentPassword: passwords.current,
        newPassword: passwords.next,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    alert("Password updated!");
    setPasswords({ current: "", next: "" });
  } catch (err) {
    console.error("Password change error:", err.response?.data || err);
    alert("Failed to change password.");
  }
};


  const handleNotificationsChange = (e) => {
    const { name, checked } = e.target;
    setNotifications((n) => ({ ...n, [name]: checked }));
  };


  const toggleDarkMode = () => setDarkMode((d) => !d);



  /* --------------------------------------------------------------
   * Chart sample data
   * Replace w/ real data from backend if available
   * ------------------------------------------------------------ */
  const barData = {
    labels: ["Projects", "Tasks", "Attendance", "Meetings"],
    datasets: [
      {
        label: "Activity Count",
        data: [12, 19, 3, 5],
        backgroundColor: COLORS.sage ,
      },
    ],
  };


  const pieData = {
    labels: ["Completed", "In Progress", "Pending"],
    datasets: [
      {
        data: [45, 30, 25],
        backgroundColor: [COLORS.sage, COLORS.pastel, COLORS.olive
],
        borderColor: [COLORS.sage, COLORS.pastel, COLORS.olive
],
      },
    ],
  };


  // Example line chart (attendance trend placeholder)
  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Daily Attendance %",
        data: [90, 95, 88, 92, 99],
       borderColor: COLORS.pastel,
       backgroundColor: COLORS.pastel + "33",

        fill: true,
        tension: 0.3,
      },
    ],
  };


  /* --------------------------------------------------------------
   * Render
   * ------------------------------------------------------------ */
  const containerClasses = [
    "max-w-6xl mx-auto p-6 rounded-lg shadow-md space-y-8 transition-colors duration-300",
    darkMode ? "bg-[#2d3e40] text-gray-100" : "bg-[#EEEFE0] text-[#213547]",
  ].join(" ");
return (
  <div className="flex min-h-screen">
    {/* Sidebar */}
    <SidebarNav />

    {/* Main Content Area */}
    <div className={`${containerClasses} flex-1 p-6 bg-[#EEEFE0]`}>
      {/* Dark Mode Toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleDarkMode}
          className={`px-4 py-2 rounded shadow hover:opacity-90 ${
            darkMode ? "bg-[#A7C1A8] text-gray-900" : "bg-[#819A91] text-white"
          }`}
        >
          {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </div>

      {/* Tabs */}
      <ProfileTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        darkMode={darkMode}
      />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="tab-overview"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.35 }}
            className="space-y-8"
          >
            <ProfileHeader
              form={form}
              avatar={avatarPreview}
              editMode={editMode}
              setEditMode={setEditMode}
              handleAvatarChange={handleAvatarChange}
              handleSaveProfile={handleSaveProfile}
              darkMode={darkMode}
            />

            {editMode && (
              <EditableForm
                form={form}
                onChange={handleFormChange}
                onSave={handleSaveProfile}
                darkMode={darkMode}
              />
            )}

            <CollapsibleSection
              title="Change Password"
              icon={<FaLock />}
              open={collapsePassword}
              onToggle={() => setCollapsePassword((o) => !o)}
              darkMode={darkMode}
            >
              <PasswordSection
                passwords={passwords}
                setPasswords={setPasswords}
                onChangePassword={handlePasswordChange}
                darkMode={darkMode}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Notifications"
              icon={<FaBell />}
              open={collapseNotifications}
              onToggle={() => setCollapseNotifications((o) => !o)}
              darkMode={darkMode}
            >
              <NotificationSection
                notifications={notifications}
                onChange={handleNotificationsChange}
                darkMode={darkMode}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Charts & Stats"
              icon={<FaCog />}
              open={collapseCharts}
              onToggle={() => setCollapseCharts((o) => !o)}
              darkMode={darkMode}
            >
              <ChartsSection
                barData={barData}
                pieData={pieData}
                lineData={lineData}
                darkMode={darkMode}
              />
            </CollapsibleSection>
          </motion.div>
        )}

        {activeTab === "activity" && (
          <motion.div
            key="tab-activity"
            initial={{ opacity: 0, x: 35 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -35 }}
            transition={{ duration: 0.35 }}
          >
            <ActivityTimeline activities={activities} darkMode={darkMode} />
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div
            key="tab-settings"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
          >
            <SettingsSection
              onOpenModal={() => setSettingsModal(true)}
              darkMode={darkMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      {settingsModal && (
        <Modal onClose={() => setSettingsModal(false)} darkMode={darkMode}>
          <SettingsModalContent
            onClose={() => setSettingsModal(false)}
            darkMode={darkMode}
          />
        </Modal>
      )}
    </div>
  </div>
);



/* ==================================================================
 * Tabs
 * ================================================================= */
function ProfileTabs({ activeTab, onChange, darkMode }) {
  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "activity", label: "Activity" },
    { key: "settings", label: "Settings" },
  ];


  const activeClass = darkMode
    ? "border-b-4 border-[#A7C1A8] text-[#A7C1A8] font-bold"
    : "border-b-4 border-[#819A91] text-[#819A91] font-bold";


  return (
    <div
      className={[
        "flex gap-4 border-b pb-2",
        darkMode ? "border-gray-600" : "border-gray-300",
      ].join(" ")}
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={[
            "pb-2 capitalize transition-colors",
            activeTab === t.key
              ? activeClass
              : darkMode
              ? "hover:text-[#A7C1A8]"
              : "hover:text-[#819A91]",
          ].join(" ")}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}


/* ==================================================================
 * Profile Header
 * ================================================================= */
function ProfileHeader({
  form,
  avatar,
  editMode,
  setEditMode,
  handleAvatarChange,
  handleSaveProfile,
  darkMode,
}) {
const borderColor = darkMode ? COLORS.pastel : COLORS.sage;
const btnBg = darkMode ? COLORS.pastel : COLORS.sage;
const btnHover = darkMode ? COLORS.sage : COLORS.pastel;
const txtColor = darkMode ? "#f0f0f0" : COLORS.text;



  return (
    <section className="flex flex-col md:flex-row items-center md:items-start gap-6">
      <div className="relative">
        {/* <img
          src={avatar || "https://i.pravatar.cc/150"}
          alt="Profile"
          className="w-32 h-32 rounded-full shadow"
          style={{ border: `4px solid ${borderColor}`, objectFit: "cover" }}
        /> */}
        <img
  src={avatar || "/images/default-profile.png"}
  alt="Profile"
  className="w-32 h-32 rounded-full shadow"
  style={{ border: `4px solid ${borderColor}`, objectFit: "cover" }}
/>

        <label
          htmlFor="avatarUpload"
          className="absolute bottom-2 right-2 p-2 rounded-full text-white cursor-pointer hover:opacity-90"
          style={{ backgroundColor: btnBg }}
        >
          <FaCamera />
        </label>
        <input
          id="avatarUpload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>


      <div className="flex-1">
        <h2
          className="text-2xl font-bold"
          style={{ color: txtColor }}
        >
          {form.name}
        </h2>
        <p className="text-sm" style={{ color: darkMode ? "#ddd" : "#555" }}>
          {form.email}
        </p>
        <p className="text-sm" style={{ color: darkMode ? "#ccc" : "#666" }}>
          {form.department || "No Department"}
        </p>
        <button
          onClick={() => (editMode ? handleSaveProfile() : setEditMode(true))}
          className="mt-3 flex items-center gap-2 px-4 py-2 rounded text-white transition-colors"
          style={{ backgroundColor: btnBg }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = btnHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = btnBg)}
        >
          {editMode ? <FaSave /> : <FaEdit />} {editMode ? "Save" : "Edit"}
        </button>
      </div>
    </section>
  );
}


/* ==================================================================
 * Editable Form
 * ================================================================= */
function EditableForm({ form, onChange, onSave, darkMode }) {
  const inputBase =
    "p-2 border rounded w-full focus:outline-none focus:ring-2 transition";
  const inputRing = darkMode ? "focus:ring-[#A7C1A8]" : "focus:ring-[#819A91]";
  const inputBg = darkMode ? "bg-[#435356] border-gray-600 text-gray-100" : "bg-white border-gray-300";


  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        name="name"
        value={form.name}
        onChange={onChange}
        placeholder="Full Name"
        className={[inputBase, inputRing, inputBg].join(" ")}
      />
      <input
        name="email"
        value={form.email}
        onChange={onChange}
        placeholder="Email"
        className={[inputBase, inputRing, inputBg].join(" ")}
      />
      <input
        name="phone"
        value={form.phone}
        onChange={onChange}
        placeholder="Phone"
        className={[inputBase, inputRing, inputBg].join(" ")}
      />
      <input
        name="department"
        value={form.department}
        onChange={onChange}
        placeholder="Department"
        className={[inputBase, inputRing, inputBg].join(" ")}
      />
      <div className="col-span-2 text-right">
        <button
          onClick={onSave}
          className="px-4 py-2 rounded text-white hover:opacity-90"
          style={{ backgroundColor: COLORS.sage }}
        >
          Save Changes
        </button>
      </div>
    </section>
  );
}


/* ==================================================================
 * Collapsible Section Wrapper
 * ================================================================= */
function CollapsibleSection({
  title,
  icon,
  open,
  onToggle,
  children,
  darkMode,
}) {
  const bg = darkMode ? "#3c4b4e" : "#ffffff";
  const text = darkMode ? "#f0f0f0" : COLORS.text;
  const border = darkMode ? "#556b6e" : "#dcdcdc";


  return (
    <section
      className="rounded shadow p-4"
      style={{ backgroundColor: bg, border: `1px solid ${border}` }}
    >
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={onToggle}
      >
        <h3
          className="text-lg font-bold flex items-center gap-2"
          style={{ color: text }}
        >
          {icon} {title}
        </h3>
        {open ? <FaChevronUp /> : <FaChevronDown />}
      </div>


      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="collapsible-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mt-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}


/* ==================================================================
 * Password Section
 * ================================================================= */
function PasswordSection({
  passwords,
  setPasswords,
  onChangePassword,
  darkMode,
}) {
  const inputBase =
    "p-2 border rounded w-full focus:outline-none focus:ring-2 transition";
  const inputRing = darkMode ? "focus:ring-[#A7C1A8]" : "focus:ring-[#819A91]";
  const inputBg = darkMode ? "bg-[#435356] border-gray-600 text-gray-100" : "bg-white border-gray-300";


  return (
    <div className="space-y-4">
      <input
        type="password"
        name="current"
        value={passwords.current}
        onChange={(e) =>
          setPasswords((p) => ({ ...p, current: e.target.value }))
        }
        placeholder="Current Password"
        className={[inputBase, inputRing, inputBg].join(" ")}
      />
      <input
        type="password"
        name="next"
        value={passwords.next}
        onChange={(e) =>
          setPasswords((p) => ({ ...p, next: e.target.value }))
        }
        placeholder="New Password"
        className={[inputBase, inputRing, inputBg].join(" ")}
      />
      <button
        onClick={onChangePassword}
        className="px-4 py-2 rounded text-white hover:opacity-90"
        style={{ backgroundColor: COLORS.sage }}
      >
        Update Password
      </button>
    </div>
  );
}


/* ==================================================================
 * Notification Section
 * ================================================================= */
function NotificationSection({ notifications, onChange, darkMode }) {
  const txtDim = darkMode ? "#ddd" : "#555";
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm" style={{ color: txtDim }}>
        <input
          type="checkbox"
          name="email"
          checked={notifications.email}
          onChange={onChange}
        />
        Email Notifications
      </label>
      <label className="flex items-center gap-2 text-sm" style={{ color: txtDim }}>
        <input
          type="checkbox"
          name="sms"
          checked={notifications.sms}
          onChange={onChange}
        />
        SMS Notifications
      </label>
      <label className="flex items-center gap-2 text-sm" style={{ color: txtDim }}>
        <input
          type="checkbox"
          name="weeklyDigest"
          checked={notifications.weeklyDigest}
          onChange={onChange}
        />
        Weekly Summary Email
      </label>
    </div>
  );
}


/* ==================================================================
 * Charts Section
 * ================================================================= */
function ChartsSection({ barData, pieData, lineData, darkMode }) {
  const txt = darkMode ? "#f0f0f0" : COLORS.text;


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-4 bg-white rounded shadow md:col-span-1">
        <h4
          className="text-md font-bold mb-4"
          style={{ color: txt }}
        >
          Task Progress
        </h4>
        <Pie
          data={pieData}
          options={{
            plugins: {
              legend: { position: "bottom", labels: { color: txt } },
            },
          }}
        />
      </div>


      <div className="p-4 bg-white rounded shadow md:col-span-1">
        <h4
          className="text-md font-bold mb-4"
          style={{ color: txt }}
        >
          Activity Count
        </h4>
        <Bar
          data={barData}
          options={{
            scales: {
              x: { ticks: { color: txt } },
              y: { ticks: { color: txt }, beginAtZero: true },
            },
            plugins: {
              legend: { labels: { color: txt } },
            },
          }}
        />
      </div>


      <div className="p-4 bg-white rounded shadow md:col-span-1">
        <h4
          className="text-md font-bold mb-4"
          style={{ color: txt }}
        >
          Attendance Trend
        </h4>
        <Line
          data={lineData}
          options={{
            scales: {
              x: { ticks: { color: txt } },
              y: { ticks: { color: txt }, beginAtZero: true, max: 100 },
            },
            plugins: {
              legend: { labels: { color: txt } },
            },
          }}
        />
      </div>
    </div>
  );
}


/* ==================================================================
 * Activity Timeline
 * ================================================================= */
function ActivityTimeline({ activities, darkMode }) {
  const bgItem = darkMode ? "#435356" : COLORS.cream;
  const txt = darkMode ? "#f0f0f0" : COLORS.text;
  const dim = darkMode ? "#aaa" : "#666";


  return (
    <section
      className="rounded shadow p-4"
      style={{ backgroundColor: darkMode ? "#3c4b4e" : "#ffffff" }}
    >
      <h3
        className="text-lg font-bold mb-4"
        style={{ color: txt }}
      >
        Recent Activities
      </h3>
      <ul className="space-y-2">
        {(!activities || activities.length === 0) && (
          <li style={{ color: dim }}>No recent activity.</li>
        )}
        {/* {activities.map((act, idx) => (
          <li
            key={idx}
            className="p-2 rounded"
            style={{ backgroundColor: bgItem, color: txt }}
          >
            {typeof act === "string" ? act : JSON.stringify(act)}
          </li>
        ))} */}
        {Array.isArray(activities) &&
  activities.map((act, idx) => (
    <li
      key={idx}
      className="p-2 rounded"
      style={{ backgroundColor: bgItem, color: txt }}
    >
      {typeof act === "string" ? act : JSON.stringify(act)}
    </li>
  ))
}

      </ul>
    </section>
  );
}


/* ==================================================================
 * Settings Section (tab content)
 * ================================================================= */
function SettingsSection({ onOpenModal, darkMode }) {
  const txt = darkMode ? "#f0f0f0" : COLORS.text;
  const dim = darkMode ? "#aaa" : "#666";


  return (
    <section
      className="rounded shadow p-4 space-y-4"
      style={{ backgroundColor: darkMode ? "#3c4b4e" : "#ffffff" }}
    >
      <h3
        className="text-lg font-bold flex items-center gap-2"
        style={{ color: txt }}
      >
        <FaCog /> Settings
      </h3>
      <p style={{ color: dim }}>
        Manage preferences like theme, weekly reports, and data export.
      </p>
      <button
        onClick={onOpenModal}
        className="px-4 py-2 rounded text-white hover:opacity-90"
        style={{ backgroundColor: COLORS.sage }}
      >
        Open Preferences
      </button>
    </section>
  );
}


/* ==================================================================
 * Settings Modal Content
 * ================================================================= */
function SettingsModalContent({ onClose, darkMode }) {
  const txt = darkMode ? "#f0f0f0" : COLORS.text;
  const dim = darkMode ? "#aaa" : "#666";


  return (
    <div className="space-y-4">
      <h2
        className="text-xl font-bold flex items-center gap-2"
        style={{ color: txt }}
      >
        <FaCog /> User Preferences
      </h2>


      <div className="space-y-2">
        <label className="flex items-center gap-2" style={{ color: dim }}>
          <input type="checkbox" /> Enable Dark Mode (global)
        </label>
        <label className="flex items-center gap-2" style={{ color: dim }}>
          <input type="checkbox" /> Weekly Reports
        </label>
        <label className="flex items-center gap-2" style={{ color: dim }}>
          <input type="checkbox" /> Include Analytics in Email
        </label>
      </div>


      <div className="pt-4 text-right">
        <button
          className="px-4 py-2 rounded text-white hover:opacity-90"
          style={{ backgroundColor: COLORS.sage }}
          onClick={onClose}
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}


/* ==================================================================
 * Modal Wrapper
 * ================================================================= */
function Modal({ children, onClose, darkMode }) {
  const bg = darkMode ? "#2d3e40" : "#ffffff";
  const border = darkMode ? "#556b6e" : "#dcdcdc";
  const closeColor = darkMode ? "#eee" : "#666";


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="p-6 rounded shadow-lg w-full max-w-lg relative"
        style={{ backgroundColor: bg, border: `1px solid ${border}` }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 hover:opacity-80"
          style={{ color: closeColor }}
        >
          ✖
        </button>
        {children}
      </div>
    </div>
  );
} 
}
// // // src/pages/Profile.jsx
// // // src/pages/Profile.jsx
// // // src/pages/Profile.jsx

// // // import React, { useState, useEffect, useContext, useRef } from "react";
// // // import {
// // //   FaEdit, FaCamera, FaSave, FaBell, FaCog, FaChevronDown,
// // //   FaChevronUp, FaLock, FaLanguage, FaMoon, FaSun, FaUserShield, FaSignOutAlt
// // // } from "react-icons/fa";
// // // import { Bar, Pie } from "react-chartjs-2";
// // // import {
// // //   Chart as ChartJS, CategoryScale, LinearScale, BarElement,
// // //   Title, Tooltip, Legend, ArcElement
// // // } from "chart.js";
// // // import { UserContext } from "../context/UserContext";
// // // import SidebarNav from "../components/SidebarNav";
// // // import axios from "axios";

// // // // Register chart.js elements
// // // ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// // // // Color palette
// // // const COLORS = {
// // //   blue: "#007BFF", green: "#4caf50", orange: "#ff9800",
// // //   red: "#f44336", gray: "#9e9e9e", dark: "#242526", light: "#f5f6fa"
// // // };

// // // const languageOptions = [{ code: "EN", label: "English" }, { code: "FR", label: "French" }];

// // // const Profile = () => {
// // //   const { user, setUser, darkMode, setDarkMode } = useContext(UserContext);

// // //   // Profile State
// // //   const [editMode, setEditMode] = useState(false);
// // //   const [showSettings, setShowSettings] = useState(false);
// // //   const [showNotifications, setShowNotifications] = useState(false);
// // //   const [formData, setFormData] = useState({});
// // //   const [formErrors, setFormErrors] = useState({});
// // //   const [profileImage, setProfileImage] = useState(null);
// // //   const fileInputRef = useRef(null);
// // //   const [lang, setLang] = useState("EN");
// // //   const [saving, setSaving] = useState(false);

// // //   // Password change state
// // //   const [showPasswordDialog, setShowPasswordDialog] = useState(false);
// // //   const [passwordFields, setPasswordFields] = useState({ current: "", next: "", confirm: "" });
// // //   const [passwordMessage, setPasswordMessage] = useState("");

// // //   // Dummy notification data
// // //   const notifications = [
// // //     { id: 1, text: "✔ Task completed", read: false },
// // //     { id: 2, text: "📅 Meeting at 3 PM", read: true },
// // //     { id: 3, text: "⚠ Leave request pending", read: false }
// // //   ];

// // //   // Chart Data
// // //   const barData = {
// // //     labels: ["Projects", "Tasks", "Attendance", "Meetings"],
// // //     datasets: [{
// // //       label: "Activity Count",
// // //       data: [12, 19, 3, 5],
// // //       backgroundColor: COLORS.green
// // //     }]
// // //   };
// // //   const pieData = {
// // //     labels: ["Completed", "Pending", "In Progress"],
// // //     datasets: [{
// // //       data: [60, 25, 15],
// // //       backgroundColor: [COLORS.blue, COLORS.orange, COLORS.red]
// // //     }]
// // //   };

// // //   // Load profile data on mount
// // //   useEffect(() => {
// // //     if (user) setFormData(user);
// // //   }, [user]);

// // //   // Helper validation
// // //   const validateForm = () => {
// // //     const errors = {};
// // //     if (!formData.name || formData.name.trim().length < 2)
// // //       errors.name = "Name must be at least 2 characters.";
// // //     if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
// // //       errors.email = "A valid email is required.";
// // //     if (!formData.phone || !/^\d{7,15}$/.test(formData.phone || ''))
// // //       errors.phone = "Phone must be 7-15 digits.";
// // //     if (!formData.department)
// // //       errors.department = "Department is required.";
// // //     setFormErrors(errors);
// // //     return Object.keys(errors).length === 0;
// // //   };

// // //   // Update theme
// // //   const toggleTheme = () => setDarkMode((d) => !d);

// // //   // Edit and Save
// // //   const handleEdit = () => setEditMode(true);

// // //   const handleSave = async () => {
// // //     if (!validateForm()) return;
// // //     setSaving(true);
// // //     try {
// // //       const res = await axios.put("/api/profile/update", formData);
// // //       setUser(res.data);
// // //       setEditMode(false);
// // //       alert("Profile saved!");
// // //     } catch (err) {
// // //       alert("Failed to save profile.");
// // //     }
// // //     setSaving(false);
// // //   };

// // //   // Image upload
// // //   const handleImageChange = async (e) => {
// // //     const file = e.target.files?.[0];
// // //     if (!file) return;
// // //     const form = new FormData();
// // //     form.append("image", file);
// // //     try {
// // //       const res = await axios.post("/api/profile/upload", form);
// // //       setProfileImage(URL.createObjectURL(file));
// // //       setUser((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
// // //     } catch {
// // //       alert("Image upload failed!");
// // //     }
// // //   };

// // //   // Password Change Handlers
// // //   const passwordStrength = (pw) => {
// // //     let score = 0;
// // //     if (!pw) return 0;
// // //     if (pw.length >= 8) score++;
// // //     if (/[A-Z]/.test(pw)) score++;
// // //     if (/[0-9]/.test(pw)) score++;
// // //     if (/[^A-Za-z0-9]/.test(pw)) score++;
// // //     return score;
// // //   };
// // //   const passwordScore = passwordStrength(passwordFields.next);

// // //   const handlePasswordUpdate = async () => {
// // //     if (passwordFields.next.length < 8) {
// // //       setPasswordMessage("Password too short.");
// // //       return;
// // //     }
// // //     if (passwordFields.next !== passwordFields.confirm) {
// // //       setPasswordMessage("Passwords do not match.");
// // //       return;
// // //     }
// // //     try {
// // //       await axios.put("/api/profile/change-password", {
// // //         currentPassword: passwordFields.current,
// // //         newPassword: passwordFields.next,
// // //       });
// // //       setPasswordMessage("Password updated!");
// // //       setTimeout(() => setShowPasswordDialog(false), 1200);
// // //       setPasswordFields({ current: "", next: "", confirm: "" });
// // //     } catch {
// // //       setPasswordMessage("Update failed. Check current password.");
// // //     }
// // //   };

// // //   // Accessibility: Close dialogs on Escape
// // //   useEffect(() => {
// // //     const keyListener = (e) => {
// // //       if (e.key === "Escape") {
// // //         setShowSettings(false);
// // //         setShowPasswordDialog(false);
// // //         setShowNotifications(false);
// // //       }
// // //     };
// // //     window.addEventListener("keydown", keyListener);
// // //     return () => window.removeEventListener("keydown", keyListener);
// // //   }, []);

// // //   return (
// // //     <div
// // //       className={`flex min-h-screen font-sans ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}
// // //     >
// // //       <SidebarNav />

// // //       <main className="flex-1 p-6 space-y-6" aria-label="Profile Main">
// // //         {/* ================= Header =================== */}
// // //         <header className="flex justify-between items-center">
// // //           <div>
// // //             <h1 className="text-3xl font-bold">Employee Profile</h1>
// // //             <p className="text-sm text-gray-500 dark:text-gray-400">
// // //               Welcome back, {user?.name}!
// // //             </p>
// // //           </div>
// // //           <div className="flex items-center space-x-4">
// // //             {/* Notifications */}
// // //             <div className="relative" tabIndex={0} aria-label="Show Notifications">
// // //               <button onClick={() => setShowNotifications((v) => !v)}>
// // //                 <FaBell className="text-xl hover:text-blue-600" />
// // //               </button>
// // //               {showNotifications && (
// // //                 <div className="absolute right-0 top-8 w-64 bg-white text-black rounded shadow p-4 z-50 animate-fadein">
// // //                   <p className="font-semibold mb-2">Notifications</p>
// // //                   <ul className="space-y-2 text-sm">
// // //                     {notifications.map((n) => (
// // //                       <li key={n.id}>
// // //                         <span className={n.read ? "text-gray-400" : "font-bold"}>
// // //                           {n.text}
// // //                         </span>
// // //                       </li>
// // //                     ))}
// // //                   </ul>
// // //                 </div>
// // //               )}
// // //             </div>

// // //             {/* Profile Image Upload */}
// // //             <div className="relative">
// // //               <img
// // //                 src={profileImage || user?.imageUrl || "/default-avatar.png"}
// // //                 alt="avatar"
// // //                 className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 cursor-pointer"
// // //                 onClick={() => fileInputRef.current?.click()}
// // //               />
// // //               <input
// // //                 type="file"
// // //                 ref={fileInputRef}
// // //                 className="hidden"
// // //                 accept="image/*"
// // //                 onChange={handleImageChange}
// // //                 aria-label="Upload profile image"
// // //               />
// // //             </div>

// // //             {/* Settings Cog Dropdown */}
// // //             <div className="relative" tabIndex={0}>
// // //               <button onClick={() => setShowSettings((v) => !v)}>
// // //                 <FaCog className="text-xl hover:text-blue-600" />
// // //               </button>
// // //               {showSettings && (
// // //                 <div className="absolute right-0 top-10 bg-white text-black shadow-lg p-4 rounded w-64 z-50 space-y-2">
// // //                   <div className="flex items-center justify-between gap-2">
// // //                     <span>Dark Mode</span>
// // //                     <button onClick={toggleTheme} className="p-1 border rounded-full bg-gray-200">
// // //                       {darkMode ? <FaSun /> : <FaMoon />}
// // //                     </button>
// // //                   </div>
// // //                   <div className="flex items-center justify-between gap-2">
// // //                     <span>Language</span>
// // //                     <select
// // //                       className="text-sm bg-gray-100 border p-1 rounded"
// // //                       value={lang}
// // //                       onChange={(e) => setLang(e.target.value)}
// // //                     >
// // //                       {languageOptions.map((opt) => (
// // //                         <option key={opt.code} value={opt.code}>
// // //                           {opt.label}
// // //                         </option>
// // //                       ))}
// // //                     </select>
// // //                   </div>
// // //                   <div className="flex items-center justify-between gap-2">
// // //                     <span>Password</span>
// // //                     <button
// // //                       className="text-blue-600 text-sm"
// // //                       onClick={() => setShowPasswordDialog(true)}
// // //                     >
// // //                       Change
// // //                     </button>
// // //                   </div>
// // //                   <div className="flex items-center justify-between gap-2">
// // //                     <span>Logout</span>
// // //                     <button
// // //                       className="text-red-500 text-sm"
// // //                       onClick={() => alert("Logout logic here")}
// // //                     >
// // //                       <FaSignOutAlt className="inline" /> Logout
// // //                     </button>
// // //                   </div>
// // //                 </div>
// // //               )}
// // //             </div>
// // //           </div>
// // //         </header>

// // //         {/* ================= Main Profile =================== */}
// // //         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// // //           {/* Profile Details Card */}
// // //           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
// // //             <div className="flex items-center justify-between">
// // //               <h2 className="text-xl font-semibold">Personal Details</h2>
// // //               {editMode ? (
// // //                 <button
// // //                   onClick={handleSave}
// // //                   disabled={saving}
// // //                   className={`bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 flex items-center ${saving && "opacity-60"}`}
// // //                 >
// // //                   <FaSave className="inline mr-1" /> {saving ? "Saving..." : "Save"}
// // //                 </button>
// // //               ) : (
// // //                 <button
// // //                   onClick={handleEdit}
// // //                   className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 flex items-center"
// // //                 >
// // //                   <FaEdit className="inline mr-1" /> Edit
// // //                 </button>
// // //               )}
// // //             </div>
// // //             <form
// // //               onSubmit={e => {
// // //                 e.preventDefault();
// // //                 handleSave();
// // //               }}
// // //               className="space-y-3"
// // //               autoComplete="off"
// // //             >
// // //               <FormField
// // //                 label="Name"
// // //                 id="name"
// // //                 value={formData.name || ""}
// // //                 disabled={!editMode}
// // //                 onChange={(val) => setFormData({ ...formData, name: val })}
// // //                 error={formErrors.name}
// // //               />
// // //               <FormField
// // //                 label="Email"
// // //                 id="email"
// // //                 type="email"
// // //                 value={formData.email || ""}
// // //                 disabled={!editMode}
// // //                 onChange={(val) => setFormData({ ...formData, email: val })}
// // //                 error={formErrors.email}
// // //               />
// // //               <FormField
// // //                 label="Phone"
// // //                 id="phone"
// // //                 value={formData.phone || ""}
// // //                 disabled={!editMode}
// // //                 onChange={(val) => setFormData({ ...formData, phone: val })}
// // //                 error={formErrors.phone}
// // //               />
// // //               <FormField
// // //                 label="Department"
// // //                 id="department"
// // //                 value={formData.department || ""}
// // //                 disabled={!editMode}
// // //                 onChange={(val) => setFormData({ ...formData, department: val })}
// // //                 error={formErrors.department}
// // //               />
// // //             </form>
// // //             <ProfileCompletenessBar completeness={profileCompleteness(formData)} darkMode={darkMode} />
// // //           </div>

// // //           {/* Right-Side: Analytics and Password Change Modal */}
// // //           <div className="grid grid-cols-1 gap-6">
// // //             <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
// // //               <h2 className="text-lg font-semibold mb-2">Employee Activity</h2>
// // //               <Bar data={barData} />
// // //             </div>
// // //             <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
// // //               <h2 className="text-lg font-semibold mb-2">Work Distribution</h2>
// // //               <Pie data={pieData} />
// // //             </div>
// // //             {showPasswordDialog && (
// // //               <PasswordDialog
// // //                 fields={passwordFields}
// // //                 setFields={setPasswordFields}
// // //                 message={passwordMessage}
// // //                 setMessage={setPasswordMessage}
// // //                 onCancel={() => setShowPasswordDialog(false)}
// // //                 onSubmit={handlePasswordUpdate}
// // //                 darkMode={darkMode}
// // //                 score={passwordScore}
// // //               />
// // //             )}
// // //           </div>
// // //         </div>
// // //       </main>
// // //     </div>
// // //   );
// // // };

// // // // Profile completeness algorithm
// // // function profileCompleteness(data) {
// // //   let score = 0;
// // //   if (data.name) score += 25;
// // //   if (data.email) score += 25;
// // //   if (data.phone) score += 20;
// // //   if (data.department) score += 20;
// // //   if (data.imageUrl) score += 10;
// // //   return Math.min(score, 100);
// // // }

// // // function ProfileCompletenessBar({ completeness, darkMode }) {
// // //   let color = "red";
// // //   let label = "Need Improvement";
// // //   if (completeness >= 80) { color = "green"; label = "Excellent"; }
// // //   else if (completeness >= 60) { color = "orange"; label = "Good"; }
// // //   return (
// // //     <section
// // //       aria-label="Profile completeness"
// // //       className="rounded p-2 mt-2 mb-6 select-none"
// // //       style={{
// // //         backgroundColor: darkMode ? "#3c4b4e" : "#d9e4dd",
// // //         color: darkMode ? "#f0f0f0" : "#213547",
// // //       }}
// // //     >
// // //       <div className="flex justify-between items-center mb-1 font-semibold">
// // //         <span>
// // //           Profile Completeness: {completeness}% ({label})
// // //         </span>
// // //       </div>
// // //       <div className="rounded h-2 bg-gray-300 dark:bg-gray-700">
// // //         <div
// // //           style={{
// // //             width: `${completeness}%`,
// // //             height: "100%",
// // //             backgroundColor: color,
// // //             borderRadius: 6,
// // //             transition: "width 0.5s ease",
// // //           }}
// // //         />
// // //       </div>
// // //     </section>
// // //   );
// // // }

// // // function FormField({ label, id, value, onChange, error, type = "text", disabled = false }) {
// // //   return (
// // //     <div>
// // //       <label htmlFor={id} className="block text-sm">{label}</label>
// // //       <input
// // //         id={id}
// // //         type={type}
// // //         value={value}
// // //         disabled={disabled}
// // //         autoComplete="off"
// // //         onChange={e => onChange(e.target.value)}
// // //         className={`w-full p-2 rounded border bg-gray-100 dark:bg-gray-700 ${error ? "border-red-400" : ""}`}
// // //       />
// // //       {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
// // //     </div>
// // //   );
// // // }

// // // function PasswordDialog({ fields, setFields, message, setMessage, onCancel, onSubmit, darkMode, score }) {
// // //   const strengthText = ["", "Weak", "Fair", "Good", "Strong"];
// // //   const colors = ["", "red", "orange", "yellowgreen", "green"];
// // //   return (
// // //     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
// // //       <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-sm w-full relative">
// // //         <button
// // //           className="absolute top-2 right-3 text-gray-500 hover:text-red-500"
// // //           onClick={onCancel}
// // //         ><FaTimes /></button>
// // //         <h2 className="text-lg font-bold mb-4">Change Password</h2>
// // //         <label className="block mb-1 text-sm">Current Password</label>
// // //         <input
// // //           type="password"
// // //           className="w-full p-2 mb-2 rounded border bg-gray-100 dark:bg-gray-700"
// // //           value={fields.current}
// // //           onChange={e => setFields(f => ({ ...f, current: e.target.value }))}
// // //         />
// // //         <label className="block mb-1 text-sm">New Password</label>
// // //         <input
// // //           type="password"
// // //           className="w-full p-2 mb-2 rounded border bg-gray-100 dark:bg-gray-700"
// // //           value={fields.next}
// // //           onChange={e => setFields(f => ({ ...f, next: e.target.value }))}
// // //         />
// // //         <div className="flex items-center mb-2">
// // //           <div className="flex-1 h-2 rounded" style={{
// // //             backgroundColor: "#eee", marginRight: 8,
// // //             overflow: "hidden"
// // //           }}>
// // //             <div
// // //               style={{
// // //                 height: "100%",
// // //                 width: `${score * 25}%`,
// // //                 backgroundColor: colors[score] || "gray",
// // //                 transition: "width 250ms cubic-bezier(.4,0,.2,1)"
// // //               }}
// // //             />
// // //           </div>
// // //           <span className="text-xs" style={{ color: colors[score] }}>{strengthText[score]}</span>
// // //         </div>
// // //         <label className="block mb-1 text-sm">Confirm New Password</label>
// // //         <input
// // //           type="password"
// // //           className="w-full p-2 mb-2 rounded border bg-gray-100 dark:bg-gray-700"
// // //           value={fields.confirm}
// // //           onChange={e => setFields(f => ({ ...f, confirm: e.target.value }))}
// // //         />
// // //         {message && <div className="text-xs text-red-500 mb-2">{message}</div>}
// // //         <button
// // //           onClick={onSubmit}
// // //           className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold mt-2 py-2 rounded"
// // //         >Update Password</button>
// // //       </div>
// // //     </div>
// // //   );
// // // // }

// // // export default Profile;
// // import React, {
// //   useState,
// //   useEffect,
// //   useContext,
// //   useRef,
// //   createContext,
// // } from "react";
// // import axios from "axios";

// // import {
// //   FaEdit,
// //   FaSave,
// //   FaBell,
// //   FaCog,
// //   FaSun,
// //   FaMoon,
// //   FaSignOutAlt,
// //   FaTimes,
// //   FaUserCircle,
// //   FaTachometerAlt,
// //   FaCalendarAlt,
// //   FaUsers,
// //   FaBuilding,
// //   FaProjectDiagram,
// //   FaTasks,
// //   FaMoneyBillWave,
// //   FaChartBar,
// //   FaCalendarCheck,
// //   FaChartPie,
// //   FaUserEdit,
// // } from "react-icons/fa";

// // import {
// //   Chart as ChartJS,
// //   CategoryScale,
// //   LinearScale,
// //   BarElement,
// //   Title,
// //   Tooltip,
// //   Legend,
// //   ArcElement,
// // } from "chart.js";
// // import { Bar, Pie } from "react-chartjs-2";


// // import { NavLink } from "react-router-dom";

// // ChartJS.register(
// //   CategoryScale,
// //   LinearScale,
// //   BarElement,
// //   Title,
// //   Tooltip,
// //   Legend,
// //   ArcElement
// // );

// // // --- UserContext ---
// // // In your app, replace this with your actual UserContext/provider setup
// // const UserContext = createContext();

// // export function UserProvider({ children }) {
// //   const [user, setUser] = useState(null);
// //   const [darkMode, setDarkMode] = useState(false);

// //   // Simulate fetch from localStorage or API
// //   useEffect(() => {
// //     const storedUser = JSON.parse(localStorage.getItem("user"));
// //     setUser(
// //       storedUser || {
// //         name: "John Doe",
// //         email: "john@example.com",
// //         phone: "1234567890",
// //         department: "Engineering",
// //         imageUrl: "/default-avatar.png",
// //         role: "Manager",
// //       }
// //     );
// //     setDarkMode(localStorage.getItem("darkMode") === "true");
// //   }, []);

// //   // Persist user and dark mode
// //   useEffect(() => {
// //     if (user) localStorage.setItem("user", JSON.stringify(user));
// //   }, [user]);

// //   useEffect(() => {
// //     localStorage.setItem("darkMode", darkMode);
// //   }, [darkMode]);

// //   return (
// //     <UserContext.Provider value={{ user, setUser, darkMode, setDarkMode }}>
// //       {children}
// //     </UserContext.Provider>
// //   );
// // }

// // // --- SidebarNav with dark mode support ---
// // function SidebarNav({ isOpen, onClose, onLogout, user, darkMode }) {
// //   const lightColors = {
// //     background: "#819A91", // SAGE
// //     brandBg: "#A7C1A8", // PASTEL
// //     brandText: "#213547", // TEXT_DARK
// //     text: "#EEEFE0", // CREAM
// //     activeBg: "#EEEFE0",
// //     activeText: "#213547",
// //     borderColor: "#ffffff33",
// //     logoutBg: "#e53935",
// //     logoutHoverBg: "#d32f2f",
// //   };

// //   const darkColors = {
// //     background: "#1f2a27", // Darker variant of SAGE
// //     brandBg: "#2a3a35", // Darker variant of PASTEL
// //     brandText: "#a7c1a8", // Light greenish text
// //     text: "#c8d6ca", // Light cream text
// //     activeBg: "#a7c1a8", // Lighter pastel green for active item bg
// //     activeText: "#1f2a27", // Dark text for active item
// //     borderColor: "#ffffff33",
// //     logoutBg: "#b71c1c",
// //     logoutHoverBg: "#7f0000",
// //   };

// //   const colors = darkMode ? darkColors : lightColors;

// //   const navItems = [
// //     { path: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
// //     { path: "/attendance", label: "Attendance", icon: <FaCalendarAlt /> },
// //     { path: "/employees", label: "Employees", icon: <FaUsers /> },
// //     { path: "/departments", label: "Departments", icon: <FaBuilding /> },
// //     { path: "/projects", label: "Projects", icon: <FaProjectDiagram /> },
// //     { path: "/tasks", label: "Tasks", icon: <FaTasks /> },
// //     { path: "/payroll", label: "Payroll", icon: <FaMoneyBillWave /> },
// //     { path: "/performance", label: "Performance", icon: <FaChartBar /> },
// //     { path: "/leaves", label: "Leaves", icon: <FaCalendarCheck /> },
// //     { path: "/manager-insights", label: "Manager Insights", icon: <FaChartPie /> },
// //     { path: "/profile", label: "My Profile", icon: <FaUserCircle /> },
// //     { path: "/edit-profile", label: "Edit Profile", icon: <FaUserEdit /> },
// //   ];

// //   return (
// //     <>
// //       {/* Mobile overlay */}
// //       {isOpen && (
// //         <div
// //           className="lg:hidden fixed inset-0 bg-black/40 z-30"
// //           onClick={onClose}
// //           aria-hidden="true"
// //         />
// //       )}

// //       <aside
// //         className={`fixed z-40 inset-y-0 left-0 transform ${
// //           isOpen ? "translate-x-0" : "-translate-x-full"
// //         } transition-transform duration-300 ease-in-out
// //          lg:translate-x-0 lg:static lg:inset-0
// //          w-64 shadow-xl flex flex-col`}
// //         style={{ backgroundColor: colors.background, color: colors.text }}
// //         aria-label="Sidebar Navigation"
// //       >
// //         {/* Brand */}
// //         <div
// //           className="flex items-center justify-center py-5 text-2xl font-bold shadow-md w-full select-none"
// //           style={{ backgroundColor: colors.brandBg, color: colors.brandText }}
// //         >
// //           StaffSphere
// //         </div>

// //         {/* Nav */}
// //         <nav
// //           className="mt-4 flex-1 space-y-1 px-3 overflow-y-auto"
// //           role="menu"
// //           aria-label="Main navigation"
// //         >
// //           {navItems.map((item) => (
// //             <NavLink
// //               key={item.path}
// //               to={item.path}
// //               end
// //               onClick={onClose}
// //               className="block"
// //               role="menuitem"
// //             >
// //               {({ isActive }) => (
// //                 <div
// //                   className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 text-base ${
// //                     isActive ? "font-semibold shadow-md" : "hover:shadow hover:scale-[1.01]"
// //                   }`}
// //                   style={{
// //                     backgroundColor: isActive ? colors.activeBg : "transparent",
// //                     color: isActive ? colors.activeText : colors.text,
// //                     cursor: "pointer",
// //                   }}
// //                   tabIndex={0}
// //                   aria-current={isActive ? "page" : undefined}
// //                 >
// //                   <span
// //                     className="mr-3 text-lg flex-shrink-0"
// //                     style={{ color: isActive ? colors.activeText : colors.text }}
// //                   >
// //                     {item.icon}
// //                   </span>
// //                   <span className="truncate">{item.label}</span>
// //                 </div>
// //               )}
// //             </NavLink>
// //           ))}
// //         </nav>

// //         {/* Footer / Logout */}
// //         <div
// //           className="p-3 border-t w-full select-none"
// //           style={{ borderColor: colors.borderColor }}
// //         >
// //           <button
// //             onClick={onLogout}
// //             className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition text-white shadow"
// //             style={{ backgroundColor: colors.logoutBg }}
// //             onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.logoutHoverBg)}
// //             onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.logoutBg)}
// //             aria-label="Logout button"
// //             type="button"
// //           >
// //             <FaSignOutAlt />
// //             Logout
// //           </button>
// //           {user?.role && (
// //             <p className="mt-3 text-center text-xs opacity-80">
// //               Signed in as <span className="font-semibold">{user.role}</span>
// //             </p>
// //           )}
// //         </div>
// //       </aside>
// //     </>
// //   );
// // }

// // // --- Utility functions ---
// // function validateProfileForm(data) {
// //   const errors = {};
// //   if (!data.name || data.name.trim().length < 2) errors.name = "Name must be at least 2 characters.";
// //   if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) errors.email = "A valid email is required.";
// //   if (!data.phone || !/^\d{7,15}$/.test(data.phone || "")) errors.phone = "Phone must be 7-15 digits.";
// //   if (!data.department) errors.department = "Department is required.";
// //   return errors;
// // }

// // function profileCompleteness(data) {
// //   let score = 0;
// //   if (data.name) score += 25;
// //   if (data.email) score += 25;
// //   if (data.phone) score += 20;
// //   if (data.department) score += 20;
// //   if (data.imageUrl) score += 10;
// //   return Math.min(score, 100);
// // }

// // function passwordStrength(pw) {
// //   let score = 0;
// //   if (!pw) return 0;
// //   if (pw.length >= 8) score++;
// //   if (/[A-Z]/.test(pw)) score++;
// //   if (/[0-9]/.test(pw)) score++;
// //   if (/[^A-Za-z0-9]/.test(pw)) score++;
// //   return score;
// // }

// // // --- Main Profile component ---
// // export default function Profile() {
// //   // Context
// //   const { user: ctxUser, setUser: ctxSetUser, darkMode, setDarkMode } =
// //     useContext(UserContext);

// //   // Sidebar state
// //   const [sidebarOpen, setSidebarOpen] = useState(false);

// //   // Local user state
// //   const [user, setUser] = useState(ctxUser);
// //   const [editMode, setEditMode] = useState(false);
// //   const [formData, setFormData] = useState(user || {});
// //   const [formErrors, setFormErrors] = useState({});
// //   const [profileImage, setProfileImage] = useState(null);
// //   const fileInputRef = useRef(null);

// //   // UI state
// //   const [lang, setLang] = useState("EN");
// //   const [saving, setSaving] = useState(false);
// //   const [showSettings, setShowSettings] = useState(false);
// //   const [showNotifications, setShowNotifications] = useState(false);
// //   const [showPasswordDialog, setShowPasswordDialog] = useState(false);

// //   // Password dialog state
// //   const [passwordFields, setPasswordFields] = useState({
// //     current: "",
// //     next: "",
// //     confirm: "",
// //   });
// //   const [passwordMessage, setPasswordMessage] = useState("");

// //   // Notifications (dummy)
// //   const notifications = [
// //     { id: 1, text: "✔ Task completed", read: false },
// //     { id: 2, text: "📅 Meeting at 3 PM", read: true },
// //     { id: 3, text: "⚠ Leave request pending", read: false },
// //   ];

// //   // Chart data
// //   const barData = {
// //     labels: ["Projects", "Tasks", "Attendance", "Meetings"],
// //     datasets: [
// //       {
// //         label: "Activity Count",
// //         data: [12, 19, 3, 5],
// //         backgroundColor: "#4caf50",
// //       },
// //     ],
// //   };
// //   const pieData = {
// //     labels: ["Completed", "Pending", "In Progress"],
// //     datasets: [
// //       {
// //         data: [60, 25, 15],
// //         backgroundColor: ["#007BFF", "#ff9800", "#f44336"],
// //       },
// //     ],
// //   };

// //   // Sync form data with user
// //   useEffect(() => {
// //     if (user) setFormData(user);
// //   }, [user]);

// //   // Propagate user updates to context
// //   useEffect(() => {
// //     if (ctxSetUser) ctxSetUser(user);
// //   }, [user, ctxSetUser]);

// //   // ESC key closes overlays/modals
// //   useEffect(() => {
// //     function onEsc(e) {
// //       if (e.key === "Escape") {
// //         setShowSettings(false);
// //         setShowPasswordDialog(false);
// //         setShowNotifications(false);
// //         setSidebarOpen(false);
// //       }
// //     }
// //     window.addEventListener("keydown", onEsc);
// //     return () => window.removeEventListener("keydown", onEsc);
// //   }, []);

// //   // Handlers
// //   function toggleTheme() {
// //     setDarkMode(!darkMode);
// //   }

// //   function handleEdit() {
// //     setEditMode(true);
// //   }

// //   async function handleSave() {
// //     const errors = validateProfileForm(formData);
// //     setFormErrors(errors);
// //     if (Object.keys(errors).length > 0) return;
// //     setSaving(true);
// //     try {
// //       // Replace below with actual API call
// //       // const res = await axios.put("/api/profile/update", formData);
// //       // setUser(res.data);
// //       setUser(formData); // Optimistic update
// //       setEditMode(false);
// //       alert("Profile saved!");
// //     } catch {
// //       alert("Failed to save profile.");
// //     }
// //     setSaving(false);
// //   }

// //   async function handleImageChange(e) {
// //     const file = e.target.files?.[0];
// //     if (!file) return;
// //     const form = new FormData();
// //     form.append("image", file);
// //     try {
// //       // Replace with actual API upload call
// //       // const res = await axios.post("/api/profile/upload", form);
// //       // setUser(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
// //       const url = URL.createObjectURL(file);
// //       setProfileImage(url);
// //       setUser((prev) => ({ ...prev, imageUrl: url }));
// //     } catch {
// //       alert("Image upload failed!");
// //     }
// //   }

// //   const pwdStrengthScore = passwordStrength(passwordFields.next);

// //   async function handlePasswordUpdate() {
// //     if (passwordFields.next.length < 8) {
// //       setPasswordMessage("Password too short.");
// //       return;
// //     }
// //     if (passwordFields.next !== passwordFields.confirm) {
// //       setPasswordMessage("Passwords do not match.");
// //       return;
// //     }
// //     try {
// //       // Replace with API call:
// //       // await axios.put("/api/profile/change-password", {
// //       //   currentPassword: passwordFields.current,
// //       //   newPassword: passwordFields.next,
// //       // });
// //       setPasswordMessage("Password updated!");
// //       setTimeout(() => setShowPasswordDialog(false), 1200);
// //       setPasswordFields({ current: "", next: "", confirm: "" });
// //     } catch {
// //       setPasswordMessage("Update failed. Check current password.");
// //     }
// //   }

// //   // Sub-components

// //   function FormField({ label, id, value, onChange, error, type = "text", disabled = false }) {
// //     return (
// //       <div>
// //         <label htmlFor={id} className="block text-sm mb-1">
// //           {label}
// //         </label>
// //         <input
// //           id={id}
// //           type={type}
// //           value={value}
// //           disabled={disabled}
// //           autoComplete="off"
// //           onChange={(e) => onChange(e.target.value)}
// //           className={`w-full p-2 rounded border bg-gray-100 dark:bg-gray-700 ${
// //             error ? "border-red-400" : ""
// //           }`}
// //         />
// //         {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
// //       </div>
// //     );
// //   }

// //   function ProfileCompletenessBar({ completeness, darkMode }) {
// //     let color = "red",
// //       label = "Need Improvement";
// //     if (completeness >= 80) {
// //       color = "green";
// //       label = "Excellent";
// //     } else if (completeness >= 60) {
// //       color = "orange";
// //       label = "Good";
// //     }
// //     return (
// //       <section
// //         aria-label="Profile completeness"
// //         className="rounded p-2 mt-2 mb-6 select-none"
// //         style={{
// //           backgroundColor: darkMode ? "#3c4b4e" : "#d9e4dd",
// //           color: darkMode ? "#f0f0f0" : "#213547",
// //         }}
// //       >
// //         <div className="flex justify-between items-center mb-1 font-semibold">
// //           <span>
// //             Profile Completeness: {completeness}% ({label})
// //           </span>
// //         </div>
// //         <div className="rounded h-2 bg-gray-300 dark:bg-gray-700">
// //           <div
// //             style={{
// //               width: `${completeness}%`,
// //               height: "100%",
// //               backgroundColor: color,
// //               borderRadius: 6,
// //               transition: "width 0.5s ease",
// //             }}
// //           />
// //         </div>
// //       </section>
// //     );
// //   }

// //   function NotificationsModal({ open, onClose }) {
// //     if (!open) return null;
// //     return (
// //       <div
// //         role="dialog"
// //         aria-modal="true"
// //         aria-label="Notifications"
// //         tabIndex={-1}
// //         className="fixed right-4 top-12 w-72 bg-white dark:bg-gray-800 text-black dark:text-white rounded shadow-lg p-4 z-50 animate-fadein"
// //       >
// //         <button
// //           aria-label="Close notifications"
// //           className="absolute top-1 right-2 text-gray-600 dark:text-gray-300 hover:text-red-500"
// //           onClick={onClose}
// //           type="button"
// //         >
// //           <FaTimes />
// //         </button>
// //         <p className="font-semibold mb-2">Notifications</p>
// //         <ul className="space-y-2 text-sm max-h-56 overflow-y-auto">
// //           {notifications.map((n) => (
// //             <li key={n.id}>
// //               <span className={n.read ? "text-gray-400" : "font-bold"}>{n.text}</span>
// //             </li>
// //           ))}
// //         </ul>
// //       </div>
// //     );
// //   }

// //   function SettingsDropdown({
// //     open,
// //     onToggle,
// //     darkMode,
// //     setDarkMode,
// //     lang,
// //     setLang,
// //     onPassword,
// //     onLogout,
// //   }) {
// //     if (!open) return null;
// //     const languageOptions = [
// //       { code: "EN", label: "English" },
// //       { code: "FR", label: "French" },
// //     ];
// //     return (
// //       <div
// //         role="menu"
// //         aria-label="Settings"
// //         tabIndex={-1}
// //         className="fixed right-4 top-16 bg-white dark:bg-gray-800 shadow-lg p-4 rounded w-64 z-50 space-y-3 text-black dark:text-white"
// //       >
// //         <div className="flex items-center justify-between gap-2">
// //           <span>Dark Mode</span>
// //           <button
// //             onClick={() => setDarkMode(!darkMode)}
// //             className="p-1 border rounded-full bg-gray-200 dark:bg-gray-600"
// //             aria-pressed={darkMode}
// //             aria-label="Toggle dark mode"
// //             type="button"
// //           >
// //             {darkMode ? <FaSun /> : <FaMoon />}
// //           </button>
// //         </div>
// //         <div className="flex items-center justify-between gap-2">
// //           <label htmlFor="lang-select">Language</label>
// //           <select
// //             id="lang-select"
// //             className="text-sm bg-gray-100 dark:bg-gray-700 border p-1 rounded"
// //             value={lang}
// //             onChange={(e) => setLang(e.target.value)}
// //           >
// //             {languageOptions.map((opt) => (
// //               <option key={opt.code} value={opt.code}>
// //                 {opt.label}
// //               </option>
// //             ))}
// //           </select>
// //         </div>
// //         <div className="flex items-center justify-between gap-2">
// //           <span>Password</span>
// //           <button
// //             className="text-blue-600 text-sm underline"
// //             onClick={() => {
// //               onPassword();
// //               onToggle();
// //             }}
// //             type="button"
// //           >
// //             Change
// //           </button>
// //         </div>
// //         <div className="flex items-center justify-between gap-2">
// //           <span>Logout</span>
// //           <button
// //             className="text-red-500 text-sm flex items-center gap-1"
// //             onClick={() => {
// //               onLogout();
// //               onToggle();
// //             }}
// //             type="button"
// //           >
// //             <FaSignOutAlt /> Logout
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   function PasswordDialog({
// //     fields,
// //     setFields,
// //     message,
// //     setMessage,
// //     onCancel,
// //     onSubmit,
// //     darkMode,
// //     score,
// //   }) {
// //     const strengthText = ["", "Weak", "Fair", "Good", "Strong"];
// //     const colors = ["", "red", "orange", "yellowgreen", "green"];
// //     return (
// //       <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
// //         <div
// //           className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-sm w-full relative`}
// //           role="dialog"
// //           aria-modal="true"
// //           aria-labelledby="password-dialog-title"
// //         >
// //           <button
// //             aria-label="Close dialog"
// //             className="absolute top-2 right-3 text-gray-500 dark:text-gray-400 hover:text-red-500"
// //             onClick={onCancel}
// //             type="button"
// //           >
// //             <FaTimes />
// //           </button>
// //           <h2 id="password-dialog-title" className="text-lg font-bold mb-4">
// //             Change Password
// //           </h2>
// //           <label className="block mb-1 text-sm" htmlFor="current-password">
// //             Current Password
// //           </label>
// //           <input
// //             id="current-password"
// //             type="password"
// //             className="w-full p-2 mb-2 rounded border bg-gray-100 dark:bg-gray-700"
// //             value={fields.current}
// //             onChange={(e) => setFields((f) => ({ ...f, current: e.target.value }))}
// //             autoComplete="current-password"
// //           />
// //           <label className="block mb-1 text-sm" htmlFor="new-password">
// //             New Password
// //           </label>
// //           <input
// //             id="new-password"
// //             type="password"
// //             className="w-full p-2 mb-2 rounded border bg-gray-100 dark:bg-gray-700"
// //             value={fields.next}
// //             onChange={(e) => setFields((f) => ({ ...f, next: e.target.value }))}
// //             autoComplete="new-password"
// //           />
// //           <div className="flex items-center mb-2" aria-live="polite" aria-atomic="true">
// //             <div
// //               className="flex-1 h-2 rounded overflow-hidden mr-2"
// //               style={{ backgroundColor: "#eee" }}
// //               aria-label={`Password strength: ${strengthText[score] || "None"}`}
// //             >
// //               <div
// //                 style={{
// //                   height: "100%",
// //                   width: `${score * 25}%`,
// //                   backgroundColor: colors[score] || "gray",
// //                   transition: "width 250ms cubic-bezier(.4,0,.2,1)",
// //                 }}
// //               ></div>
// //             </div>
// //             <span className="text-xs" style={{ color: colors[score] }}>
// //               {strengthText[score]}
// //             </span>
// //           </div>
// //           <label className="block mb-1 text-sm" htmlFor="confirm-password">
// //             Confirm New Password
// //           </label>
// //           <input
// //             id="confirm-password"
// //             type="password"
// //             className="w-full p-2 mb-2 rounded border bg-gray-100 dark:bg-gray-700"
// //             value={fields.confirm}
// //             onChange={(e) => setFields((f) => ({ ...f, confirm: e.target.value }))}
// //             autoComplete="new-password"
// //           />
// //           {message && <div className="text-xs text-red-500 mb-2">{message}</div>}
// //           <button
// //             onClick={onSubmit}
// //             className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold mt-2 py-2 rounded"
// //             type="button"
// //           >
// //             Update Password
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   function ChartPanel() {
// //     return (
// //       <>
// //         <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6">
// //           <h2 className="text-lg font-semibold mb-2">Employee Activity</h2>
// //           <Bar data={barData} />
// //         </div>
// //         <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
// //           <h2 className="text-lg font-semibold mb-2">Work Distribution</h2>
// //           <Pie data={pieData} />
// //         </div>
// //       </>
// //     );
// //   }

// //   // Logout handler (simulate)
// //   function handleLogout() {
// //     alert("Logged out (simulate). Clear tokens and redirect in real app.");
// //   }

// //   return (
// //     <div className={`flex min-h-screen font-sans ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
// //       {/* Sidebar */}
// //       <SidebarNav
// //         isOpen={sidebarOpen}
// //         onClose={() => setSidebarOpen(false)}
// //         onLogout={handleLogout}
// //         user={user}
// //         darkMode={darkMode}
// //       />

// //       {/* Main content */}
// //       <div className="flex-1 flex flex-col">
// //         {/* Top bar for mobile menu button */}
// //         <header className="bg-gray-200 dark:bg-gray-800 shadow-md p-3 flex items-center justify-between lg:hidden">
// //           <button
// //             onClick={() => setSidebarOpen(true)}
// //             className="text-gray-700 dark:text-gray-300 focus:outline-none"
// //             aria-label="Open sidebar menu"
// //             type="button"
// //           >
// //             &#9776;
// //           </button>
// //           <span className="font-bold">StaffSphere</span>
// //           {/* Empty right side for symmetry */}
// //           <div className="w-5" />
// //         </header>

// //         <main className="flex-1 p-6 space-y-6" aria-label="Profile Main">
// //           {/* ================= Header =================== */}
// //           <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
// //             <div>
// //               <h1 className="text-3xl font-bold">Employee Profile</h1>
// //               <p className="text-sm text-gray-500 dark:text-gray-400">
// //                 Welcome back, {user?.name}!
// //               </p>
// //             </div>

// //             <div className="flex items-center space-x-3 mt-4 sm:mt-0">
// //               {/* Notifications */}
// //               <div className="relative">
// //                 <button
// //                   aria-label="Show Notifications"
// //                   onClick={() => setShowNotifications((v) => !v)}
// //                   className="text-xl hover:text-blue-600 focus:outline-none"
// //                   type="button"
// //                 >
// //                   <FaBell />
// //                 </button>
// //                 <NotificationsModal
// //                   open={showNotifications}
// //                   onClose={() => setShowNotifications(false)}
// //                 />
// //               </div>

// //               {/* Profile Image Upload */}
// //               <div className="relative">
// //                 <img
// //                   src={profileImage || user?.imageUrl || "/default-avatar.png"}
// //                   alt="avatar"
// //                   className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 cursor-pointer"
// //                   onClick={() => fileInputRef.current?.click()}
// //                   tabIndex={0}
// //                   onKeyDown={(e) => {
// //                     if (e.key === "Enter") fileInputRef.current?.click();
// //                   }}
// //                 />
// //                 <input
// //                   type="file"
// //                   ref={fileInputRef}
// //                   className="hidden"
// //                   accept="image/*"
// //                   onChange={handleImageChange}
// //                   aria-label="Upload profile image"
// //                 />
// //               </div>

// //               {/* Settings Dropdown */}
// //               <div className="relative">
// //                 <button
// //                   aria-label="Toggle Settings Dropdown"
// //                   onClick={() => setShowSettings((v) => !v)}
// //                   className="text-xl hover:text-blue-600 focus:outline-none"
// //                   type="button"
// //                 >
// //                   <FaCog />
// //                 </button>
// //                 <SettingsDropdown
// //                   open={showSettings}
// //                   onToggle={() => setShowSettings((v) => !v)}
// //                   darkMode={darkMode}
// //                   setDarkMode={setDarkMode}
// //                   lang={lang}
// //                   setLang={setLang}
// //                   onPassword={() => {
// //                     setShowPasswordDialog(true);
// //                     setShowSettings(false);
// //                   }}
// //                   onLogout={() => {
// //                     handleLogout();
// //                     setShowSettings(false);
// //                   }}
// //                 />
// //               </div>
// //             </div>
// //           </header>

// //           {/* ================= Main Profile =================== */}
// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //             {/* Profile Details */}
// //             <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
// //               <div className="flex justify-between items-center">
// //                 <h2 className="text-xl font-semibold">Personal Details</h2>
// //                 {editMode ? (
// //                   <button
// //                     onClick={handleSave}
// //                     disabled={saving}
// //                     className={`bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 flex items-center ${
// //                       saving ? "opacity-60" : ""
// //                     }`}
// //                     type="button"
// //                   >
// //                     <FaSave className="mr-1" />
// //                     {saving ? "Saving..." : "Save"}
// //                   </button>
// //                 ) : (
// //                   <button
// //                     onClick={handleEdit}
// //                     className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 flex items-center"
// //                     type="button"
// //                   >
// //                     <FaEdit className="mr-1" />
// //                     Edit
// //                   </button>
// //                 )}
// //               </div>
// //               <form
// //                 onSubmit={(e) => {
// //                   e.preventDefault();
// //                   handleSave();
// //                 }}
// //                 className="space-y-3"
// //                 autoComplete="off"
// //                 aria-label="Edit profile form"
// //               >
// //                 <FormField
// //                   label="Name"
// //                   id="name"
// //                   value={formData.name || ""}
// //                   disabled={!editMode}
// //                   onChange={(val) => setFormData({ ...formData, name: val })}
// //                   error={formErrors.name}
// //                 />
// //                 <FormField
// //                   label="Email"
// //                   id="email"
// //                   type="email"
// //                   value={formData.email || ""}
// //                   disabled={!editMode}
// //                   onChange={(val) => setFormData({ ...formData, email: val })}
// //                   error={formErrors.email}
// //                 />
// //                 <FormField
// //                   label="Phone"
// //                   id="phone"
// //                   value={formData.phone || ""}
// //                   disabled={!editMode}
// //                   onChange={(val) => setFormData({ ...formData, phone: val })}
// //                   error={formErrors.phone}
// //                 />
// //                 <FormField
// //                   label="Department"
// //                   id="department"
// //                   value={formData.department || ""}
// //                   disabled={!editMode}
// //                   onChange={(val) => setFormData({ ...formData, department: val })}
// //                   error={formErrors.department}
// //                 />
// //               </form>
// //               <ProfileCompletenessBar
// //                 completeness={profileCompleteness(formData)}
// //                 darkMode={darkMode}
// //               />
// //             </section>

// //             {/* Analytics + Password Dialog */}
// //             <section>
// //               <ChartPanel />
// //               {showPasswordDialog && (
// //                 <PasswordDialog
// //                   fields={passwordFields}
// //                   setFields={setPasswordFields}
// //                   message={passwordMessage}
// //                   setMessage={setPasswordMessage}
// //                   onCancel={() => setShowPasswordDialog(false)}
// //                   onSubmit={() => {
// //                     handlePasswordUpdate();
// //                   }}
// //                   darkMode={darkMode}
// //                   score={pwdStrengthScore}
// //                 />
// //               )}
// //             </section>
// //           </div>
// //         </main>
// //       </div>
// //     </div>
// //   );
// // }

// // src/pages/Profile.jsx

// // Profile.jsx
// // A large, full-featured profile page with sidebar navigation

// // ProfilePage.jsx
// import React, { useState, useEffect, useRef } from "react";

// // ============= CSS-in-JS Styling =============
// // Just for demo: you probably want CSS modules/Tailwind for prod
// const vars = {
//   primary: "#4169e1",
//   primaryDark: "#253573",
//   bgSidebar: "#192041",
//   bgMain: "#f6f8fc",
//   border: "#dde3f4",
//   danger: "#ff2d55",
//   success: "#23bb4b",
// };

// const useProfileStyles = (() => {
//   let styleTag;
//   return () => {
//     if (styleTag) return;
//     styleTag = document.createElement("style");
//     styleTag.type = "text/css";
//     styleTag.innerHTML = `
//     .prf-container {display:flex;min-height:100vh;background:${vars.bgMain};font-family:sans-serif;font-size:16px;}
//     .prf-sidebar {width:266px;min-width:190px;background:${vars.bgSidebar};color:#fff;display:flex;flex-direction:column;align-items:stretch;}
//     .prf-sidebar .prf-logo {margin:36px auto 48px;font-size:2.2em;font-weight:bold;letter-spacing:2px;}
//     .prf-nav-btn {display:flex;align-items:center;text-align:left;padding:17px 28px;cursor:pointer;font-size:1.07em;margin-bottom:2px;border:none;background:none;transition:.12s;background:0;}
//     .prf-nav-btn.prf-active, .prf-nav-btn:hover {background:rgba(255,255,255,.08);}
//     .prf-nav-btn span {margin-left:17px;}
//     .prf-main {flex:1;max-width:calc(100vw - 260px);margin-left:0;box-sizing:border-box;padding:48px 48px 24px 48px;}
//     .prf-title {font-size:2em;font-weight:600;margin-bottom:20px;}
//     .prf-tabs {display:flex;gap:28px;margin-bottom:28px;border-bottom:2.1px solid #e8e9f2;}
//     .prf-tab {font-size:1em;padding:11px 0;background:none;border:none;border-bottom:2.6px solid transparent;color:#222;cursor:pointer;font-weight:500;}
//     .prf-tab.prf-tabactive {border-color:${vars.primary};color:${vars.primary};}
//     /* Main sections */
//     .prf-section {max-width:700px;}
//     .prf-flex-gap {display:flex;align-items:center;gap:30px;}
//     .prf-avatar {width:98px;height:98px;border-radius:50%;border:2.4px solid #e8e9f2;object-fit:cover;}
//     .prf-upload-label {display:inline-block;padding:7px 21px;margin-top:6px;background:#eef4fe;color:${vars.primaryDark};border:1.2px solid #c3d2f6;border-radius:5px;cursor:pointer;font-weight:500;}
//     .prf-avatar-input {display:none;}
//     .prf-list {margin:0;padding:0;}
//     .prf-list li {margin-bottom:11px;}
//     /* Inputs */
//     .prf-form-row {margin-bottom:19px;}
//     .prf-label {display:block;margin-bottom:3px;color:#38405c;font-size:.98em;font-weight:500;}
//     .prf-input, .prf-textarea {width:100%;padding:10px 13px;border-radius:5px;border:1px solid #c5cbe6;font-size:1em;background:#fff;}
//     .prf-textarea {min-height:60px;resize:vertical;}
//     .prf-btnrow {display:flex;gap:13px;margin-top:18px;}
//     .prf-btn {padding:10px 28px;background:${vars.primary};color:#fff;border:none;font-weight:600;font-size:1.04em;border-radius:6px;cursor:pointer;transition:.1s;}
//     .prf-btn:disabled {background:#cbd0df;cursor:not-allowed;}
//     .prf-btn.prf-danger {background:${vars.danger};}
//     .prf-btn.prf-success {background:${vars.success};}
//     .prf-btn.prf-second {background:#f3f5fc;color:#2a355c;}
//     .prf-err {color:${vars.danger};font-size:.99em;margin-top:5px;}
//     .prf-success {color:${vars.success};font-size:1em;margin-top:5px;}
//     /* Table/Logs */
//     .prf-activity-log {padding:0;margin:0;list-style:none;}
//     .prf-activity-log li {background:#f1f4fa;border-left:3.1px solid ${vars.primary};margin-bottom:11px;padding:11px 17px;border-radius:0 12px 12px 0;color:#272f43;}
//     /* Modals */
//     .prf-modal-bg {position:fixed;inset:0;background:rgba(24,30,44,0.41);z-index:110;display:flex;justify-content:center;align-items:center;}
//     .prf-modal {background:#fff;min-width:337px;max-width:97vw;border-radius:13px;padding:36px 32px;position:relative;box-shadow:0 8px 64px 0 #54567a23;}
//     .prf-close {position:absolute;top:13px;right:22px;font-size:1.33em;border:none;background:none;color:#132;font-weight:bold;cursor:pointer;}
//     .prf-modal-title {font-size:1.14em;font-weight:700;margin-bottom:17px;}
//     .prf-modal-actions {display:flex;gap:13px;justify-content:flex-end;margin-top:26px;}
//     /* Responsive */
//     @media (max-width:900px){.prf-sidebar{width:58px;min-width:0;}.prf-sidebar .prf-logo{font-size:1.2em;}.prf-nav-btn span{display:none;}.prf-main{padding-left:15px;}}
//     @media (max-width:600px){.prf-main{padding:12px;}.prf-title{font-size:1.25em;}}
//     `;
//     document.head.appendChild(styleTag);
//   };
// })();

// // ======== Sidebar Nav Items ========
// const NAV = [
//   { key: "overview", label: "Overview", icon: "🏠" },
//   { key: "settings", label: "Settings", icon: "⚙️" },
//   { key: "security", label: "Security", icon: "🔒" },
//   { key: "activity", label: "Activity", icon: "📜" },
// ];

// // ============= Main ProfilePage Component =============
// export default function ProfilePage() {
//   useProfileStyles();

//   // ---- State ----
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const [nav, setNav] = useState("overview");
//   const [tab, setTab] = useState("overview");

//   // User and activity data (fetched from backend)
//   const [user, setUser] = useState(null);
//   const [activity, setActivity] = useState([]);

//   // Edit state
//   const [editing, setEditing] = useState(false);
//   // Profile edit form:
//   const [form, setForm] = useState({ name: "", username: "", email: "", bio: "", location: "" });

//   // Avatar uploading
//   const [avatarUpload, setAvatarUpload] = useState(false);
//   const [avatarMsg, setAvatarMsg] = useState('');
//   const [avatarError, setAvatarError] = useState('');

//   // Password/Deletion Modals
//   const [showPwdModal, setShowPwdModal] = useState(false);
//   const [showDelModal, setShowDelModal] = useState(false);

//   // Password change form
//   const [pwdForm, setPwdForm] = useState({ current: "", next: "", confirm: "" });
//   const [pwdError, setPwdError] = useState('');
//   const [pwdSuccess, setPwdSuccess] = useState('');

//   // Save state for settings/profile save
//   const [saving, setSaving] = useState(false);
//   const [saveMsg, setSaveMsg] = useState('');
//   const [saveErr, setSaveErr] = useState('');

//   // Delete confirmation
//   const [delWord, setDelWord] = useState('');
//   const [deleting, setDeleting] = useState(false);
//   const [delMsg, setDelMsg] = useState('');

//   // ==== Fetch profile/activity data from backend ====
//   useEffect(() => {
//     setLoading(true);
//     setError('');
//     // Replace with your REAL API calls. Here we mock it:
//     setTimeout(() => {
//       // Simulate a logged-in user
//       setUser({
//         id: "u10001",
//         name: "Priya Sharma",
//         username: "priya.sharma",
//         email: "priya.sharma@yourcompany.com",
//         bio: "React/Node developer and open source enthusiast.",
//         avatar: "https://randomuser.me/api/portraits/women/65.jpg",
//         location: "Banglore, India",
//         joined: "2023-06-11",
//       });
//       setActivity([
//         { date: "2024-07-10 10:14", detail: "Enabled two-factor authentication." },
//         { date: "2024-06-20 17:33", detail: "Changed password." },
//         { date: "2024-05-18 20:41", detail: "Uploaded a new avatar." },
//         { date: "2024-04-01 13:41", detail: "Updated profile info." },
//         { date: "2024-03-19 09:26", detail: "Signed in from new device." },
//       ]);
//       setLoading(false);
//     }, 1300); // simulate loading
//   }, []);

//   // Init form fields on user load
//   useEffect(() => {
//     if (user) {
//       setForm({
//         name: user.name,
//         username: user.username,
//         email: user.email,
//         bio: user.bio || "",
//         location: user.location || "",
//       });
//     }
//   }, [user]);

//   // Switch tab/nav
//   const handleNavClick = (k) => {
//     setTab(k);
//     setNav(k);
//     setEditing(false);
//     setSaveMsg('');
//     setSaveErr('');
//     setAvatarMsg('');
//     setAvatarError('');
//     setPwdSuccess('');
//     setPwdError('');
//   };

//   // ========== Avatar Upload ==========
//   const avatarInput = useRef();
//   const handleAvatarChange = e => {
//     const file = e.target.files?.[0];
//     setAvatarError('');
//     setAvatarMsg('');
//     if (!file) return;
//     if (!file.type.startsWith('image/')) {
//       setAvatarError('Select an image file.');
//       return;
//     }
//     if (file.size > 3*1024*1024) {
//       setAvatarError('Max 3MB image allowed.');
//       return;
//     }
//     setAvatarUpload(true);
//     // Preview upload / Simulate backend upload
//     setTimeout(() => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setUser(u => ({...u, avatar: reader.result}));
//         setAvatarMsg("Avatar uploaded.");
//         setAvatarUpload(false);
//         setActivity(a => [
//           {detail:"Uploaded new avatar.", date: (new Date()).toLocaleString()},
//           ...a,
//         ]);
//       };
//       reader.readAsDataURL(file);
//     }, 1300);
//   };

//   // ========== Profile Save ==========
//   const handleFormChange = e => {
//     setForm({...form, [e.target.name]: e.target.value});
//   };
//   const handleProfileSave = async()=>{
//     setSaving(true);
//     setSaveErr('');
//     setSaveMsg('');
//     setTimeout(() => {
//       // Simulate API request/update
//       if (!form.name.trim()) {
//         setSaveErr("Name must not be empty.");
//         setSaving(false);
//         return;
//       }
//       setUser(u => ({
//         ...u,
//         name: form.name,
//         username: form.username,
//         bio: form.bio,
//         location: form.location,
//       }));
//       setEditing(false);
//       setActivity(a => [{
//         date: (new Date()).toLocaleString(),
//         detail: "Updated profile info.",
//       }, ...a]);
//       setSaveMsg("Profile updated.");
//       setSaving(false);
//     }, 1200);
//   };

//   // ========== Password Save ==========
//   const handlePwdChange = e => {
//     setPwdForm({...pwdForm, [e.target.name]: e.target.value});
//     setPwdError('');
//   };
//   const handlePwdSubmit = ()=>{
//     setPwdError('');
//     setPwdSuccess('');
//     if(!pwdForm.current||!pwdForm.next||!pwdForm.confirm){
//       setPwdError("All fields required.");
//       return;
//     }
//     if (pwdForm.next !== pwdForm.confirm) {
//       setPwdError("Passwords don't match.");
//       return;
//     }
//     if (pwdForm.next.length < 6){
//       setPwdError("Password must be at least 6 chars.");
//       return;
//     }
//     setTimeout(()=>{
//       setPwdSuccess("Password changed.");
//       setPwdForm({current:"", next:"", confirm:""});
//       setShowPwdModal(false);
//       setActivity(a=>[
//         {date: (new Date()).toLocaleString(), detail:"Changed password."},...a
//       ]);
//     }, 1100);
//   };

//   // ========== Account Deletion ==========
//   const handleDelete = ()=>{
//     setDelMsg('');
//     if(delWord !== "DELETE"){
//       setDelMsg('Type DELETE to confirm.');
//       return;
//     }
//     setDeleting(true);
//     setTimeout(()=>{
//       setDeleting(false);
//       setShowDelModal(false);
//       alert("Account deleted! (simulation)");
//     }, 1500);
//   };

//   // ========== UI Sections ==========
//   // ---- Sidebar ----
//   function SidebarNav() {
//     return (
//       <nav className="prf-sidebar">
//         <div className="prf-logo">EMS</div>
//         {NAV.map(({key,label,icon})=>(
//           <button key={key} className={`prf-nav-btn${nav===key?" prf-active":""}`}
//             onClick={()=>handleNavClick(key)}>
//             <span style={{fontSize:"1.22em"}}>{icon}</span>
//             <span>{label}</span>
//           </button>
//         ))}
//         <div style={{flex:1}}></div>
//       </nav>
//     );
//   }
//   // ---- Tabs ----
//   function Tabs() {
//     return (
//       <div className="prf-tabs">
//         {NAV.map(({key,label})=>(
//           <button key={key} className={`prf-tab${tab===key?" prf-tabactive":""}`}
//             onClick={()=>setTab(key)}>
//             {label}
//           </button>
//         ))}
//       </div>
//     );
//   }

//   // ---- Overview ----
//   function Overview() {
//     return (
//       <div className="prf-section">
//         <div className="prf-flex-gap">
//           <img className="prf-avatar" src={user.avatar} alt="avatar" />
//           <div>
//             <h2 style={{margin:0,fontWeight:600}}>{user.name ?? ""}</h2>
//             <div style={{color:"#546087",fontSize:".96em"}}>@{user.username}</div>
//             <div style={{marginTop:7,color:"#8590b7",fontSize:"1em"}}>{user.location}</div>
//           </div>
//         </div>
//         <div style={{marginTop:24}}>
//           <h4 style={{marginBottom:4,fontWeight:600,color:"#2a355c"}}>Bio</h4>
//           <div>{user.bio||<span style={{color:"#9ca5bf"}}>No bio.</span>}</div>
//         </div>
//         <div style={{marginTop:14}}>
//           <h4 style={{marginBottom:4,fontWeight:600,color:"#2a355c"}}>Email</h4>
//           <div>{user.email}</div>
//         </div>
//         <div style={{marginTop:14}}>
//           <h4 style={{marginBottom:4,fontWeight:600,color:"#2a355c"}}>Joined</h4>
//           <div>{user.joined}</div>
//         </div>
//       </div>
//     );
//   }

//   // ---- Settings/Edit ----
//   function Settings() {
//     return (
//       <form className="prf-section" onSubmit={e=>{e.preventDefault();}}>
//         <div style={{marginBottom:15}}>
//           <label className="prf-label" htmlFor="avatar">Avatar</label>
//           <div className="prf-flex-gap">
//             <img className="prf-avatar" src={user.avatar} alt="avatar" />
//             <label className="prf-upload-label">
//               {avatarUpload ? 'Uploading...' : 'Change Avatar'}
//               <input type="file" accept="image/*" className="prf-avatar-input"
//                 onChange={handleAvatarChange}
//                 ref={avatarInput}
//                 disabled={avatarUpload}/>
//             </label>
//           </div>
//           {avatarError && <div className="prf-err">{avatarError}</div>}
//           {avatarMsg && <div className="prf-success">{avatarMsg}</div>}
//         </div>
//         <div className="prf-form-row">
//           <label className="prf-label" htmlFor="name">Full Name</label>
//           <input className="prf-input" id="name" name="name"
//             value={form.name}
//             onChange={handleFormChange}
//             disabled={!editing} autoComplete="off"/>
//         </div>
//         <div className="prf-form-row">
//           <label className="prf-label" htmlFor="username">Username</label>
//           <input className="prf-input" id="username" name="username"
//             value={form.username}
//             onChange={handleFormChange}
//             disabled={!editing} autoComplete="off"/>
//         </div>
//         <div className="prf-form-row">
//           <label className="prf-label" htmlFor="email">Email</label>
//           <input className="prf-input" id="email" name="email"
//             value={form.email}
//             disabled readOnly/>
//         </div>
//         <div className="prf-form-row">
//           <label className="prf-label" htmlFor="bio">Bio</label>
//           <textarea className="prf-textarea" id="bio" name="bio"
//             maxLength={200}
//             value={form.bio}
//             onChange={handleFormChange}
//             disabled={!editing}/>
//         </div>
//         <div className="prf-form-row">
//           <label className="prf-label" htmlFor="location">Location</label>
//           <input className="prf-input" id="location" name="location"
//             value={form.location}
//             onChange={handleFormChange}
//             disabled={!editing}/>
//         </div>
//         <div className="prf-btnrow">
//           {!editing
//             ? <button className="prf-btn" type="button" onClick={()=>setEditing(true)}>Edit</button>
//             : (
//               <>
//                 <button className="prf-btn prf-success" type="button" onClick={handleProfileSave} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
//                 <button className="prf-btn prf-second" type="button" onClick={() => { setEditing(false); setForm({ ...user }); }}>Cancel</button>
//               </>
//             )
//           }
//         </div>
//         {saveMsg && <div className="prf-success">{saveMsg}</div>}
//         {saveErr && <div className="prf-err">{saveErr}</div>}
//       </form>
//     );
//   }

//   // ---- Security ----
//   function Security() {
//     return (
//       <div className="prf-section">
//         <h4 style={{color:"#20307e",fontWeight:600}}>Security</h4>
//         <ul className="prf-list">
//           <li>
//             <button className="prf-btn" type="button" onClick={()=>setShowPwdModal(true)}>
//               Change Password
//             </button>
//           </li>
//         </ul>
//         <div style={{margin:'20px 0'}}></div>
//         <h4 style={{color:"#b9002c",fontWeight:600}}>Delete account</h4>
//         <span style={{color:"#914858",fontSize:".96em"}}>Irreversible. Deletes all data. Proceed with caution.</span>
//         <div style={{marginTop:'10px'}}>
//           <button className="prf-btn prf-danger"
//             type="button"
//             onClick={()=>setShowDelModal(true)}>
//             Delete Account
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ---- Activity ----
//   function Activity() {
//     return (
//       <div className="prf-section">
//         <div style={{fontWeight:600,color:"#222",fontSize:"1.13em",marginBottom:"9px"}}>Activity log</div>
//         <ul className="prf-activity-log">
//           {activity?.length? activity.slice(0,16).map((item,idx)=>(
//             <li key={idx}>
//               <div style={{fontWeight:550}}>{item.detail}</div>
//               <div style={{fontSize:".97em",color:"#817da0"}}>{item.date}</div>
//             </li>
//           )): <div style={{color:"#bbb"}}>No activity yet.</div>}
//         </ul>
//       </div>
//     );
//   }

//   // ---- Password Modal ----
//   function PasswordModal() {
//     return (
//       <div className="prf-modal-bg" tabIndex={-1}>
//         <div className="prf-modal">
//           <button className="prf-close" title="Close" aria-label="Close"
//             onClick={()=>setShowPwdModal(false)}>&times;</button>
//           <div className="prf-modal-title">Change password</div>
//           <div className="prf-form-row">
//             <label className="prf-label">Current Password</label>
//             <input className="prf-input" name="current" type="password"
//               value={pwdForm.current}
//               onChange={handlePwdChange}
//               autoComplete="current-password"/>
//           </div>
//           <div className="prf-form-row">
//             <label className="prf-label">New Password</label>
//             <input className="prf-input" name="next" type="password"
//               value={pwdForm.next}
//               onChange={handlePwdChange}
//               autoComplete="new-password"/>
//           </div>
//           <div className="prf-form-row">
//             <label className="prf-label">Confirm New Password</label>
//             <input className="prf-input" name="confirm" type="password"
//               value={pwdForm.confirm}
//               onChange={handlePwdChange}
//               autoComplete="new-password"/>
//           </div>
//           {pwdError && <div className="prf-err">{pwdError}</div>}
//           <div className="prf-modal-actions">
//             <button className="prf-btn"
//               onClick={handlePwdSubmit}>
//               Change
//             </button>
//             <button className="prf-btn prf-second"
//               onClick={()=>setShowPwdModal(false)}>Cancel</button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ---- Delete Modal ----
//   function DeleteModal() {
//     return (
//       <div className="prf-modal-bg" tabIndex={-1}>
//         <div className="prf-modal">
//           <button className="prf-close" title="Close" aria-label="Close"
//             onClick={()=>setShowDelModal(false)}>&times;</button>
//           <div className="prf-modal-title" style={{color:vars.danger}}>Delete account</div>
//           <div style={{color:vars.danger,paddingBottom:7}}>Type <b>DELETE</b> below to confirm account deletion. This cannot be undone!</div>
//           <input className="prf-input" type="text" placeholder='Type "DELETE"'
//             value={delWord} disabled={deleting}
//             onChange={e=>setDelWord(e.target.value)}/>
//           {delMsg && <div className="prf-err">{delMsg}</div>}
//           <div className="prf-modal-actions">
//             <button className="prf-btn prf-danger"
//               disabled={deleting||delWord!=="DELETE"}
//               onClick={handleDelete}>{deleting? "Deleting..." : "Delete"}</button>
//             <button className="prf-btn prf-second"
//               disabled={deleting}
//               onClick={()=>setShowDelModal(false)}>Cancel</button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ---- Main Render ----
//   if (loading) return (
//     <div className="prf-container"><SidebarNav/>
//       <main className="prf-main">
//         <div style={{marginTop:"40vh",fontSize:"1.31em",color:vars.primary}}>Loading profile...</div>
//       </main>
//     </div>
//   );
//   if (error) return (
//     <div className="prf-container"><SidebarNav/>
//       <main className="prf-main">
//         <div className="prf-err" style={{marginTop:"36vh",fontSize:"1.31em"}}>{error}</div>
//       </main>
//     </div>
//   );
//   if (!user) return null;

//   return (
//     <div className="prf-container">
//       <SidebarNav/>
//       <main className="prf-main">
//         <div className="prf-title">Profile</div>
//         <Tabs/>
//         {tab==="overview"? <Overview/>:
//          tab==="settings"? <Settings/>:
//          tab==="security"? <Security/>:
//          <Activity/>}
//         {showPwdModal && <PasswordModal/>}
//         {showDelModal && <DeleteModal/>}
//       </main>
//     </div>
//   );
// }

