// 📁 components/TabNavigation.jsx

import React from "react";

const TabNavigation = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition-colors duration-300 focus:outline-none
            ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-600 dark:text-gray-400"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
