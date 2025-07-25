// src/pages/Projects.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import Layout from "../components/Layout";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { FaPlus, FaTrash, FaEdit, FaTasks } from "react-icons/fa";

/* ----------------------------------
 * Column config
 * -------------------------------- */
const COLUMN_ORDER = ["Pending", "Ongoing", "Completed"];
const COLUMN_COLORS = {
  Pending: "#fce7f3", // soft pink
  Ongoing: "#fff7cd", // soft yellow
  Completed: "#d1fadf", // soft green
};

/* ----------------------------------
 * Component
 * -------------------------------- */
export default function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "Pending",
  });
  const [editing, setEditing] = useState(null); // project object being edited
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  /* ------------------ load projects ------------------ */
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/projects");
      setProjects(res.data || []);
    } catch (err) {
      console.error("Fetch projects error:", err);
      setMsg({ type: "error", text: "Failed to load projects." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /* ------------------ derived columns ------------------ */
  const columns = useMemo(() => {
    return COLUMN_ORDER.reduce((acc, status) => {
      acc[status] = projects.filter((p) => p.status === status);
      return acc;
    }, {});
  }, [projects]);

  /* ------------------ helpers ------------------ */
  const flash = (type, text, ms = 2500) => {
    setMsg({ type, text });
    if (ms) {
      setTimeout(() => setMsg({ type: "", text: "" }), ms);
    }
  };

  const resetForm = () => {
    setForm({ name: "", description: "", status: "Pending" });
    setEditing(null);
  };

  /* ------------------ form change ------------------ */
  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  /* ------------------ add/update submit ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      flash("error", "Project name required.");
      return;
    }

    try {
      if (editing) {
        await api.put(`/projects/${editing._id}`, form);
        flash("success", "Project updated.");
      } else {
        await api.post("/projects", form);
        flash("success", "Project added.");
      }
      resetForm();
      fetchProjects();
    } catch (err) {
      console.error("Save project error:", err);
      flash("error", err.response?.data?.message || "Failed to save project.");
    }
  };

  /* ------------------ edit fill ------------------ */
  const handleEdit = (project) => {
    setEditing(project);
    setForm({
      name: project.name,
      description: project.description || "",
      status: project.status,
    });
  };

  /* ------------------ delete ------------------ */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/projects/${id}`);
      flash("success", "Project deleted.");
      fetchProjects();
    } catch (err) {
      console.error("Delete project error:", err);
      flash("error", "Failed to delete project.");
    }
  };

  /* ------------------ update status from drag ------------------ */
  const updateProjectStatus = async (id, newStatus) => {
    // optimistic UI
    setProjects((prev) =>
      prev.map((p) => (p._id === id ? { ...p, status: newStatus } : p))
    );
    try {
      await api.put(`/projects/${id}`, { status: newStatus });
    } catch (err) {
      console.error("Failed to update project status:", err);
      flash("error", "Could not move project.");
      fetchProjects(); // rollback
    }
  };

  /* ------------------ dnd handler ------------------ */
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination, source } = result;
    const from = source.droppableId;
    const to = destination.droppableId;
    if (from === to) return;
    updateProjectStatus(draggableId, to);
  };

  /* ------------------ render ------------------ */
  const content = (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-[#819A91]">Projects</h1>

      {/* Alerts */}
      {msg.text && (
        <div
          className={`mb-4 p-2 rounded text-sm ${
            msg.type === "error"
              ? "bg-red-100 text-red-700"
              : msg.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-[#D1D8BE] p-4 rounded-lg shadow-sm"
      >
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Project Name"
          className="p-2 border rounded focus:ring-2 focus:ring-[#819A91] outline-none"
        />
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="p-2 border rounded focus:ring-2 focus:ring-[#819A91] outline-none"
        />
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="p-2 border rounded focus:ring-2 focus:ring-[#819A91] outline-none"
        >
          <option>Pending</option>
          <option>Ongoing</option>
          <option>Completed</option>
        </select>
        <button
          type="submit"
          className="bg-[#819A91] text-white p-2 rounded hover:bg-[#A7C1A8] transition flex items-center justify-center"
        >
          {editing ? "Update" : "Add"} <FaPlus className="ml-2" />
        </button>
      </form>

      {/* Kanban Board */}
      {loading ? (
        <p className="text-center py-10">Loading projects...</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLUMN_ORDER.map((status) => (
              <Droppable droppableId={status} key={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="rounded-lg p-4 min-h-[300px] shadow-inner transition"
                    style={{
                      backgroundColor: COLUMN_COLORS[status],
                      outline: snapshot.isDraggingOver
                        ? "2px dashed #819A91"
                        : "none",
                    }}
                  >
                    <h2 className="text-lg font-bold mb-3 text-[#213547]">
                      {status}
                    </h2>

                    {columns[status].map((project, index) => (
                      <Draggable
                        key={project._id}
                        draggableId={project._id}
                        index={index}
                      >
                        {(provided, snap) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={[
                              "bg-white p-3 mb-3 rounded-lg shadow hover:shadow-md cursor-grab active:cursor-grabbing transition",
                              snap.isDragging ? "ring-2 ring-[#819A91]" : "",
                            ].join(" ")}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h3 className="font-bold text-gray-700">
                                  {project.name}
                                </h3>
                                {project.description && (
                                  <p className="text-sm text-gray-500">
                                    {project.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Action Row */}
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(project)}
                                className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1"
                              >
                                <FaEdit />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(project._id)}
                                className="px-2 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600 flex items-center gap-1"
                              >
                                <FaTrash />
                                Del
                              </button>
                              {/* View Tasks button (correct projectId link) */}
                              <Link
                                to={`/projects/${project._id}/tasks`}
                                className="px-2 py-1 text-xs rounded bg-[#819A91] text-white hover:bg-[#A7C1A8] flex items-center gap-1"
                              >
                                <FaTasks />
                                Tasks
                              </Link>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );

  return <Layout pageTitle="Projects">{content}</Layout>;
}
