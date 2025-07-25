import React, { useEffect, useState } from "react";
import axios from "axios";
import TabNavigation from "../components/TabNavigation";
import EditableField from "../components/EditableField";
import ActivityFeed from "../components/ActivityFeed";

const ProfileView = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState({});
  const [activities, setActivities] = useState([]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/api/profile");
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const updateField = async (field, value) => {
    try {
      const res = await axios.put("/api/profile/update", { [field]: value });
      setProfile((prev) => ({ ...prev, [field]: value }));
    } catch (err) {
      console.error("Failed to update profile field:", err);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await axios.get("/api/profile/activity");
      setActivities(res.data);
    } catch (err) {
      console.error("Failed to fetch activity:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchActivity();
  }, []);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "activity", label: "Activity" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">My Profile</h1>
      <TabNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="mt-6">
        {activeTab === "overview" && (
          <div>
            <EditableField label="Name" value={profile.name || ""} onSave={(val) => updateField("name", val)} />
            <EditableField label="Email" value={profile.email || ""} onSave={(val) => updateField("email", val)} />
            <EditableField label="Phone" value={profile.phone || ""} onSave={(val) => updateField("phone", val)} />
            <EditableField label="Title" value={profile.title || ""} onSave={(val) => updateField("title", val)} />
          </div>
        )}

        {activeTab === "activity" && <ActivityFeed activities={activities} />}

        {activeTab === "settings" && (
          <p className="text-gray-600 dark:text-gray-400">Settings tab (coming soon)</p>
        )}
      </div>
    </div>
  );
};

export default ProfileView;