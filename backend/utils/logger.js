// backend/utils/logger.js
import fs from "fs";
import path from "path";

export const logActivity = (userId, action) => {
  const logLine = `${new Date().toISOString()} - User: ${userId} - ${action}\n`;
  const logPath = path.join("logs", "activity.log");

  fs.appendFile(logPath, logLine, (err) => {
    if (err) console.error("Failed to write log:", err);
  });
};
