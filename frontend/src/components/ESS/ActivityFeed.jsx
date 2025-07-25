import React from "react";

const ActivityFeed = ({ activities }) => {
  return (
    <div className="max-h-[450px] overflow-y-auto p-4 bg-white dark:bg-gray-900 shadow rounded-md border dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Recent Activity</h3>
      <ul className="space-y-4">
        {activities.length === 0 ? (
          <li className="text-gray-500 dark:text-gray-400">No activity found.</li>
        ) : (
          activities.map((activity, index) => (
            <li key={index} className="border-b pb-2 dark:border-gray-700">
              <div className="text-sm text-gray-700 dark:text-white">
                {activity.message}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(activity.timestamp).toLocaleString()}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ActivityFeed;
