// /components/ESS/ViewUpdateProfile.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const ViewUpdateProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/api/ess/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProfile(res.data);
      setFormData(res.data);
    } catch (error) {
      console.error("Error fetching profile", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async () => {
    try {
      await axios.put("/api/ess/profile", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setEditMode(false);
      fetchProfile(); // Refresh profile
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  if (!profile) return <div className="text-center py-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md mt-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">👤 My Profile</h2>

      <div className="grid grid-cols-2 gap-4">
        {["name", "email", "phone", "address", "department", "jobTitle"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-600 capitalize">{field}</label>
            <input
              type="text"
              name={field}
              value={formData[field] || ""}
              disabled={!editMode}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                editMode ? "bg-white" : "bg-gray-100"
              }`}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4 mt-6">
        {!editMode ? (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setEditMode(true)}
          >
            ✏️ Edit
          </button>
        ) : (
          <>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleUpdate}
            >
              💾 Save
            </button>
            <button
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => {
                setFormData(profile);
                setEditMode(false);
              }}
            >
              ❌ Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewUpdateProfile;
