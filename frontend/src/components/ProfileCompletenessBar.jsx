// src/components/ProfileCompletenessBar.jsx
import React from "react";

const ProfileCompletenessBar = ({ completeness, darkMode }) => {
  let color = "red";
  let label = "Needs Improvement";

  if (completeness >= 80) {
    color = "green";
    label = "Excellent";
  } else if (completeness >= 50) {
    color = "orange";
    label = "Good";
  }

  return (
    <section
      aria-label="Profile completeness"
      className="rounded p-2 mb-6"
      style={{
        backgroundColor: darkMode ? "#3c4b4e" : "#d9e4dd",
        color: darkMode ? "#f0f0f0" : "#213547",
      }}
    >
      <p className="mb-1 font-semibold">
        Profile Completeness: <span>{completeness}%</span> ({label})
      </p>
      <div
        className="rounded h-4"
        style={{ backgroundColor: darkMode ? "#566c70" : "#b5c9ae" }}
      >
        <div
          style={{
            width: `${completeness}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: 6,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </section>
  );
};

export default ProfileCompletenessBar;
