// routes/tasks.js

import express from "express";
import mongoose from "mongoose";
import Task from "../models/Task.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

/* ----------------------------------------------------------------------
 * Utility Functions
 * ---------------------------------------------------------------------- */

/**
 * Check if the given ID is a valid MongoDB ObjectId.
 * @param {string} id
 * @returns {boolean}
 */
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Build filter object based on query parameters.
 */
function buildTaskFilter(query) {
  const filter = {};
  if (query.status) {
    filter.status = query.status;
  }
  if (query.priority) {
    filter.priority = query.priority;
  }
  if (query.assignedTo && isValidId(query.assignedTo)) {
    filter.assignedTo = query.assignedTo;
  }
  if (query.projectId && isValidId(query.projectId)) {
    filter.projectId = query.projectId;
  }
  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filter.$or = [{ title: regex }, { description: regex }];
  }
  return filter;
}

/**
 * Pagination helper
 */
function getPaginationOptions(query) {
  const page = parseInt(query.page) > 0 ? parseInt(query.page) : 1;
  const limit = parseInt(query.limit) > 0 ? parseInt(query.limit) : 10;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/* ----------------------------------------------------------------------
 * ROUTES
 * ---------------------------------------------------------------------- */

/**
 * CREATE - Create a new Task
 */
router.post("/", verifyToken, async (req, res) => {
  console.log("POST /api/tasks body:", req.body);
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      projectId,
    } = req.body;

    if (!title || !projectId) {
      return res
        .status(400)
        .json({ message: "Title and projectId are required." });
    }

    if (!isValidId(projectId)) {
      return res
        .status(400)
        .json({ message: `Invalid projectId: ${projectId}` });
    }

    if (assignedTo && !isValidId(assignedTo)) {
      return res
        .status(400)
        .json({ message: `Invalid assignedTo id: ${assignedTo}` });
    }

    const newTask = await Task.create({
      title: title.trim(),
      description: description?.trim() || "",
      status: status || "TO_DO",
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      assignedTo: assignedTo || undefined,
      projectId,
      createdBy: req.user.id, // track who created it
    });

    const populated = await newTask.populate("assignedTo", "name department");
    res.status(201).json(populated);
  } catch (err) {
    console.error("POST /tasks error:", err);
    res
      .status(500)
      .json({ message: "Failed to create task", error: err.message });
  }
});

/**
 * READ - Get all tasks (with filters, search, pagination)
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const filter = buildTaskFilter(req.query);
    const { page, limit, skip } = getPaginationOptions(req.query);
    const sort = req.query.sort || "-createdAt";

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate("assignedTo", "name department")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      tasks,
    });
  } catch (err) {
    console.error("GET /tasks error:", err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

/**
 * READ by Project ID
 */
router.get("/:projectId", verifyToken, async (req, res) => {
  const { projectId } = req.params;
  if (!isValidId(projectId)) {
    return res
      .status(400)
      .json({ message: `Invalid projectId: ${projectId}` });
  }
  try {
    const tasks = await Task.find({ projectId })
      .populate("assignedTo", "name department")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("GET /tasks/:projectId error:", err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

/**
 * READ single Task by ID
 */
router.get("/detail/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ message: `Invalid task id: ${id}` });
  }
  try {
    const task = await Task.findById(id).populate(
      "assignedTo",
      "name department email"
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    console.error("GET /tasks/detail/:id error:", err);
    res.status(500).json({ message: "Failed to fetch task" });
  }
});

/**
 * UPDATE Task
 */
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ message: `Invalid task id: ${id}` });
  }
  if (req.body.assignedTo && !isValidId(req.body.assignedTo)) {
    return res
      .status(400)
      .json({ message: `Invalid assignedTo id: ${req.body.assignedTo}` });
  }
  if (req.body.projectId && !isValidId(req.body.projectId)) {
    return res
      .status(400)
      .json({ message: `Invalid projectId: ${req.body.projectId}` });
  }

  try {
    const updated = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignedTo", "name department");

    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("PUT /tasks/:id error:", err);
    res.status(500).json({ message: "Failed to update task" });
  }
});

/**
 * DELETE Task
 */
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ message: `Invalid task id: ${id}` });
  }
  try {
    const deleted = await Task.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("DELETE /tasks/:id error:", err);
    res.status(500).json({ message: "Failed to delete task" });
  }
});

/* ----------------------------------------------------------------------
 * EXTRA FEATURES
 * ---------------------------------------------------------------------- */

/**
 * BULK DELETE tasks
 */
router.post("/bulk-delete", verifyToken, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.some((id) => !isValidId(id))) {
      return res.status(400).json({ message: "Invalid task IDs" });
    }
    const result = await Task.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${result.deletedCount} tasks deleted` });
  } catch (err) {
    console.error("POST /tasks/bulk-delete error:", err);
    res.status(500).json({ message: "Failed to delete tasks" });
  }
});

/**
 * UPDATE status of multiple tasks
 */
router.post("/bulk-update-status", verifyToken, async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.some((id) => !isValidId(id))) {
      return res.status(400).json({ message: "Invalid task IDs" });
    }
    const result = await Task.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );
    res.json({ message: `${result.modifiedCount} tasks updated` });
  } catch (err) {
    console.error("POST /tasks/bulk-update-status error:", err);
    res.status(500).json({ message: "Failed to update tasks" });
  }
});

/**
 * GET Task Statistics
 */
router.get("/stats/overview", verifyToken, async (req, res) => {
  try {
    const [byStatus, byPriority] = await Promise.all([
      Task.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Task.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
    ]);
    res.json({ byStatus, byPriority });
  } catch (err) {
    console.error("GET /tasks/stats/overview error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

/**
 * SEARCH tasks
 */
router.get("/search/query", verifyToken, async (req, res) => {
  try {
    const { search } = req.query;
    const regex = new RegExp(search, "i");
    const tasks = await Task.find({
      $or: [{ title: regex }, { description: regex }],
    }).populate("assignedTo", "name");
    res.json(tasks);
  } catch (err) {
    console.error("GET /tasks/search/query error:", err);
    res.status(500).json({ message: "Failed to search tasks" });
  }
});

/**
 * GET overdue tasks
 */
router.get("/overdue/list", verifyToken, async (req, res) => {
  try {
    const now = new Date();
    const overdueTasks = await Task.find({
      dueDate: { $lt: now },
      status: { $ne: "DONE" },
    }).populate("assignedTo", "name");
    res.json(overdueTasks);
  } catch (err) {
    console.error("GET /tasks/overdue/list error:", err);
    res.status(500).json({ message: "Failed to fetch overdue tasks" });
  }
});

/**
 * Assign a task to a user
 */
router.post("/:id/assign", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  if (!isValidId(id) || !isValidId(userId)) {
    return res.status(400).json({ message: "Invalid task or user ID" });
  }
  try {
    const task = await Task.findByIdAndUpdate(
      id,
      { assignedTo: userId },
      { new: true }
    ).populate("assignedTo", "name");
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    console.error("POST /tasks/:id/assign error:", err);
    res.status(500).json({ message: "Failed to assign task" });
  }
});

export default router;
