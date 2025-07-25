// backend/routes/projectRoutes.js
import express from "express";
import Project from "../models/Project.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all projects
router.get("/", verifyToken, async (req, res) => {
  try {
    const projects = await Project.find().populate("members", "name email");
    res.json(projects);
  } catch (err) {
    console.error("GET /projects error:", err);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

// Create a new project
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, description, status, members } = req.body;
    const project = await Project.create({ name, description, status, members });
    res.status(201).json(project);
  } catch (err) {
    console.error("POST /projects error:", err);
    res.status(500).json({ message: "Failed to create project" });
  }
});

// Partial update
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const update = {};
    if (req.body.name !== undefined) update.name = req.body.name;
    if (req.body.description !== undefined) update.description = req.body.description;
    if (req.body.status !== undefined) update.status = req.body.status;
    if (req.body.members !== undefined) update.members = req.body.members;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );
    res.json(project);
  } catch (err) {
    console.error("PUT /projects/:id error:", err);
    res.status(500).json({ message: "Failed to update project" });
  }
});

// Delete a project
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (err) {
    console.error("DELETE /projects/:id error:", err);
    res.status(500).json({ message: "Failed to delete project" });
  }
});

export default router;
