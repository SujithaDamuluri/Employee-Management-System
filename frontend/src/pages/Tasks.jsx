/**
 * Tasks.jsx
 * ------------------------------------------------------------------
 * StaffSphere - Project Tasks Workspace
 *
 * Features:
 *  - Per-project Kanban board (TO_DO / IN_PROGRESS / DONE)
 *  - Add / Edit / Delete tasks (title, description, due date, priority)
 *  - Assign to employee
 *  - Subtasks (add / toggle / delete)
 *  - Comments drawer w/ lazy load (placeholder API endpoints recommended)
 *  - Activity timeline (basic)
 *  - Attachments stub (UI only; wire later)
 *  - Drag & Drop between columns (@hello-pangea/dnd)
 *  - Bulk select + bulk status + bulk delete
 *  - Search (title / desc), filter by priority / assignee / overdue
 *  - Sort by due date / priority / title
 *  - Project progress header (% done) + stats chips
 *  - Mini trend chart (completed tasks over last 14 days) using Recharts
 *  - Optimistic UI with rollback on error
 *  - Toasty inline alerts
 *  - Keyboard shortcuts ("/" focus search, "n" new task, "esc" close modals)
 *  - Responsive (grid auto stacks on small screens)
 *  - Pastel theme from your palette (#819A91, #A7C1A8, #D1D8BE, #EEEFE0)
 *
 * Integration assumptions:
 *  - Back-end /api/tasks  (POST create, GET /:projectId, PUT /:id, DELETE /:id)
 *  - Task model fields: title, description, priority, status, dueDate, assignedTo, projectId
 *  - Optionally: subtasks[], comments[], attachments[] endpoints (stubs below)
 *  - /api/projects (GET list) to confirm project exists (optional; safe fallback)
 *  - /api/employees for assignee list
 *
 * NOTE: Some advanced features (comments, attachments) include placeholder
 *       API calls; adjust backend paths if needed.
 * ------------------------------------------------------------------
 */

/* eslint-disable react/prop-types */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import Layout from "../components/Layout";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";


import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaTasks,
  FaCheck,
  FaTimes,
  FaUser,
  FaUserPlus,
  FaSortAmountUp,
  FaSortAmountDown,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp,
  FaInfoCircle,
  FaPaperclip,
  FaCommentDots,
  FaExclamationTriangle,
  FaClock,
  FaLayerGroup,
  FaCheckSquare,
  FaMinusSquare,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* ------------------------------------------------------------------
 * THEME (aligned to your chosen palette)
 * ---------------------------------------------------------------- */
const COLOR_SAGE = "#819A91";
const COLOR_MINT = "#A7C1A8";
const COLOR_OLIVE = "#D1D8BE";
const COLOR_CREAM = "#EEEFE0";
const COLOR_TEXT = "#213547";

/* Column config (MUST MATCH BACKEND enum strings) */
const KANBAN_COLUMNS = ["TO_DO", "IN_PROGRESS", "DONE"];
const KANBAN_LABELS = {
  TO_DO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};
/* Column Pastel background overlays */
const KANBAN_BG = {
  TO_DO: "bg-[#fffbe6]",
  IN_PROGRESS: "bg-[#e0f2fe]",
  DONE: "bg-[#d1fadf]",
};

/* Priority meta */
const PRIORITY_META = {
  LOW: { label: "Low", cls: "bg-green-100 text-green-700" },
  MEDIUM: { label: "Medium", cls: "bg-yellow-100 text-yellow-700" },
  HIGH: { label: "High", cls: "bg-red-100 text-red-700" },
};

/* Bulk selection helper color */
const BULK_SELECTED_RING = "ring-2 ring-offset-2 ring-[#819A91]";

/* LocalStorage keys (offline / draft caching) */
const LS_TASK_DRAFT_KEY = (projectId) => `staffsph_taskdraft_${projectId}`;
const LS_FILTER_KEY = (projectId) => `staffsph_taskfilters_${projectId}`;

/* Utility ---------------------------------------------------------------- */

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((n) => n[0]?.toUpperCase() || "")
    .slice(0, 2)
    .join("");

const fmtDateShort = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—";

const fmtDateLong = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const isPast = (d) => {
  if (!d) return false;
  const dd = new Date(d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dd.setHours(0, 0, 0, 0);
  return dd < today;
};

const isToday = (d) => {
  if (!d) return false;
  const dd = new Date(d);
  const today = new Date();
  return (
    dd.getFullYear() === today.getFullYear() &&
    dd.getMonth() === today.getMonth() &&
    dd.getDate() === today.getDate()
  );
};

/* Sort comparators */
const sorters = {
  TITLE_ASC: (a, b) => a.title.localeCompare(b.title),
  TITLE_DESC: (a, b) => b.title.localeCompare(a.title),
  DUE_ASC: (a, b) => {
    const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    return da - db;
  },
  DUE_DESC: (a, b) => {
    const da = a.dueDate ? new Date(a.dueDate).getTime() : -Infinity;
    const db = b.dueDate ? new Date(b.dueDate).getTime() : -Infinity;
    return db - da;
  },
  PRIORITY_ASC: (a, b) =>
    ["LOW", "MEDIUM", "HIGH"].indexOf(a.priority) -
    ["LOW", "MEDIUM", "HIGH"].indexOf(b.priority),
  PRIORITY_DESC: (a, b) =>
    ["LOW", "MEDIUM", "HIGH"].indexOf(b.priority) -
    ["LOW", "MEDIUM", "HIGH"].indexOf(a.priority),
};

/* ------------------------------------------------------------------
 * API HELPERS (wrappers so you can centralize error handling)
 * ---------------------------------------------------------------- */

async function apiFetchTasks(projectId) {
  const res = await api.get(`/tasks/${projectId}`);
  return res.data;
}
async function apiCreateTask(payload) {
  const res = await api.post("/tasks", payload);
  return res.data;
}
async function apiUpdateTask(id, payload) {
  const res = await api.put(`/tasks/${id}`, payload);
  return res.data;
}
async function apiDeleteTask(id) {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
}

/* Subtasks (placeholder endpoints; adjust to match backend if different) ---- */
async function apiAddSubtask(taskId, title) {
  // Example: POST /tasks/:id/subtasks {title}
  const res = await api.post(`/tasks/${taskId}/subtasks`, { title });
  return res.data;
}
async function apiToggleSubtask(taskId, subtaskId, done) {
  // PATCH /tasks/:id/subtasks/:sid {done}
  const res = await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}`, { done });
  return res.data;
}
async function apiDeleteSubtask(taskId, subtaskId) {
  const res = await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
  return res.data;
}

/* Comments (placeholder) --------------------------------------------------- */
async function apiFetchComments(taskId) {
  const res = await api.get(`/tasks/${taskId}/comments`);
  return res.data;
}
async function apiAddComment(taskId, text) {
  const res = await api.post(`/tasks/${taskId}/comments`, { text });
  return res.data;
}
async function apiDeleteComment(taskId, commentId) {
  const res = await api.delete(`/tasks/${taskId}/comments/${commentId}`);
  return res.data;
}

/* Attachments (placeholder) ------------------------------------------------ */
async function apiUploadAttachment(taskId, file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await api.post(`/tasks/${taskId}/attachments`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
async function apiDeleteAttachment(taskId, attachmentId) {
  const res = await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
  return res.data;
}

/* ------------------------------------------------------------------
 * MAIN COMPONENT
 * ---------------------------------------------------------------- */
export default function Tasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const badId = !projectId || projectId === ":projectId";

  /* ------------------ data state ------------------ */
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]); // all tasks for project
  const [employees, setEmployees] = useState([]);

  /* ------------------ UI state ------------------ */
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  /* Filters / search / sort (persist to localStorage) */
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [sortMode, setSortMode] = useState("DUE_ASC");

  /* Bulk selection */
  const [selected, setSelected] = useState(new Set());

  /* Modal / Drawer state */
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewTask, setViewTask] = useState(null); // full detail drawer
  const [commentsOpen, setCommentsOpen] = useState(false); // comment drawer
  const [activeCommentTask, setActiveCommentTask] = useState(null);

  /* Refs --------------------------------------------------------------- */
  const searchRef = useRef(null);

  /* ------------------------------------------------------------------
   * load employees once
   * ---------------------------------------------------------------- */
  const loadEmployees = useCallback(async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data || []);
    } catch (err) {
      console.error("loadEmployees error:", err);
    }
  }, []);

  /* ------------------------------------------------------------------
   * load project (optional; we may not need detail if we came from Projects)
   * We'll just fetch all and find the match; safe fallback
   * ---------------------------------------------------------------- */
  const loadProject = useCallback(async () => {
    if (badId) return;
    try {
      const res = await api.get("/projects");
      const proj = (res.data || []).find((p) => p._id === projectId) || null;
      setProject(proj);
    } catch (err) {
      console.error("loadProject error:", err);
    }
  }, [projectId, badId]);

  /* ------------------------------------------------------------------
   * load tasks
   * ---------------------------------------------------------------- */
  const loadTasks = useCallback(async () => {
    if (badId) return;
    setLoading(true);
    try {
      const data = await apiFetchTasks(projectId);
      setTasks(data || []);
    } catch (err) {
      console.error("loadTasks error:", err);
      flash("error", "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [projectId, badId]);

  /* ------------------------------------------------------------------
   * flash helper
   * ---------------------------------------------------------------- */
  const flash = (type, text, ms = 2500) => {
    setMsg({ type, text });
    if (ms) {
      setTimeout(() => setMsg({ type: "", text: "" }), ms);
    }
  };

  /* ------------------------------------------------------------------
   * Load persisted filters from localStorage
   * ---------------------------------------------------------------- */
  useEffect(() => {
    if (badId) return;
    try {
      const stored = JSON.parse(localStorage.getItem(LS_FILTER_KEY(projectId)));
      if (stored) {
        setSearch(stored.search ?? "");
        setPriorityFilter(stored.priority ?? "ALL");
        setAssigneeFilter(stored.assignee ?? "ALL");
        setOverdueOnly(!!stored.overdueOnly);
        setSortMode(stored.sortMode ?? "DUE_ASC");
      }
    } catch {
      /* ignore */
    }
  }, [projectId, badId]);

  /* ------------------------------------------------------------------
   * Persist filters when changed
   * ---------------------------------------------------------------- */
  useEffect(() => {
    if (badId) return;
    const v = {
      search,
      priority: priorityFilter,
      assignee: assigneeFilter,
      overdueOnly,
      sortMode,
    };
    localStorage.setItem(LS_FILTER_KEY(projectId), JSON.stringify(v));
  }, [projectId, badId, search, priorityFilter, assigneeFilter, overdueOnly, sortMode]);

  /* ------------------------------------------------------------------
   * Initial load
   * ---------------------------------------------------------------- */
  useEffect(() => {
    loadEmployees();
    loadProject();
    loadTasks();
  }, [loadEmployees, loadProject, loadTasks]);

  /* ------------------------------------------------------------------
   * Derived: Filtered + Sorted Tasks
   * ---------------------------------------------------------------- */
  const filteredSortedTasks = useMemo(() => {
    let arr = tasks.slice();

    /* search */
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      arr = arr.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          (t.description?.toLowerCase().includes(s) ?? false)
      );
    }

    /* priority filter */
    if (priorityFilter !== "ALL") {
      arr = arr.filter((t) => t.priority === priorityFilter);
    }

    /* assignee filter */
    if (assigneeFilter !== "ALL") {
      arr = arr.filter(
        (t) => t.assignedTo?._id === assigneeFilter || t.assignedTo === assigneeFilter
      );
    }

    /* overdue filter */
    if (overdueOnly) {
      arr = arr.filter((t) => isPast(t.dueDate) && t.status !== "DONE");
    }

    /* sort */
    const sorter = sorters[sortMode] || sorters.DUE_ASC;
    arr.sort(sorter);

    return arr;
  }, [tasks, search, priorityFilter, assigneeFilter, overdueOnly, sortMode]);

  /* ------------------------------------------------------------------
   * Derived: Column groupings for Kanban
   * ---------------------------------------------------------------- */
  const columns = useMemo(() => {
    return KANBAN_COLUMNS.reduce((acc, col) => {
      acc[col] = filteredSortedTasks.filter((t) => t.status === col);
      return acc;
    }, {});
  }, [filteredSortedTasks]);

  /* ------------------------------------------------------------------
   * Derived: Stats & Progress
   * ---------------------------------------------------------------- */
  const totalTasks = tasks.length;
  const doneCount = tasks.filter((t) => t.status === "DONE").length;
  const progressPct = totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0;

  const overdueCount = tasks.filter((t) => isPast(t.dueDate) && t.status !== "DONE").length;
  const todayDue = tasks.filter((t) => isToday(t.dueDate) && t.status !== "DONE").length;

  /* Chart: last 14 days completions */
  const completionTrend = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }
    const doneByDay = {};
    tasks.forEach((t) => {
      if (t.status !== "DONE") return;
      const dd = t.updatedAt ? new Date(t.updatedAt) : new Date(t.createdAt);
      dd.setHours(0, 0, 0, 0);
      const key = dd.toISOString();
      doneByDay[key] = (doneByDay[key] || 0) + 1;
    });
    return days.map((d) => ({
      day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      done: doneByDay[d.toISOString()] || 0,
    }));
  }, [tasks]);

  /* ------------------------------------------------------------------
   * Bulk selection handlers
   * ---------------------------------------------------------------- */
  const toggleSelect = (taskId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };
  const selectAllVisible = () => {
    setSelected(new Set(filteredSortedTasks.map((t) => t._id)));
  };
  const clearSelected = () => setSelected(new Set());

  const bulkDelete = async () => {
    if (!selected.size) return;
    if (!window.confirm(`Delete ${selected.size} selected tasks?`)) return;
    try {
      await Promise.all([...selected].map((id) => apiDeleteTask(id)));
      flash("success", "Selected tasks deleted.");
      clearSelected();
      loadTasks();
    } catch (err) {
      console.error("bulkDelete error:", err);
      flash("error", "Failed bulk delete.");
    }
  };

  const bulkMove = async (newStatus) => {
    if (!selected.size) return;
    try {
      await Promise.all(
        [...selected].map((id) => apiUpdateTask(id, { status: newStatus }))
      );
      flash("success", `Moved ${selected.size} tasks to ${KANBAN_LABELS[newStatus]}.`);
      clearSelected();
      loadTasks();
    } catch (err) {
      console.error("bulkMove error:", err);
      flash("error", "Failed bulk move.");
    }
  };

  /* ------------------------------------------------------------------
   * Add / Edit Task modal open
   * ---------------------------------------------------------------- */
  const openAddModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };
  const openEditModal = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  /* ------------------------------------------------------------------
   * Save Task (from modal)
   * ---------------------------------------------------------------- */
  const handleSaveTask = async (payload) => {
    // payload includes: title, description, status, priority, dueDate, assignedTo
    if (!projectId || badId) {
      flash("error", "Invalid project. Re-open from Projects.");
      return;
    }
    try {
      if (editingTask) {
        await apiUpdateTask(editingTask._id, payload);
        flash("success", "Task updated.");
      } else {
        await apiCreateTask({ ...payload, projectId });
        flash("success", "Task added.");
      }
      setModalOpen(false);
      setEditingTask(null);
      loadTasks();
    } catch (err) {
      console.error("handleSaveTask error:", err);
      flash("error", err.response?.data?.message || "Failed to save task.");
    }
  };

  /* ------------------------------------------------------------------
   * Delete single task
   * ---------------------------------------------------------------- */
  const handleDeleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await apiDeleteTask(id);
      flash("success", "Task deleted.");
      loadTasks();
    } catch (err) {
      console.error("handleDeleteTask error:", err);
      flash("error", "Failed to delete task.");
    }
  };

  /* ------------------------------------------------------------------
   * Drag & Drop
   * ---------------------------------------------------------------- */
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, source, destination } = result;
    const from = source.droppableId;
    const to = destination.droppableId;
    if (from === to) return;

    // optimistic
    setTasks((prev) =>
      prev.map((t) => (t._id === draggableId ? { ...t, status: to } : t))
    );
    try {
      await apiUpdateTask(draggableId, { status: to });
    } catch (err) {
      console.error("DnD update error:", err);
      flash("error", "Failed to move task; reloading.");
      loadTasks();
    }
  };

  /* ------------------------------------------------------------------
   * Comments Drawer
   * ---------------------------------------------------------------- */
  const openComments = (task) => {
    setActiveCommentTask(task);
    setCommentsOpen(true);
  };
  const closeComments = () => {
    setCommentsOpen(false);
    setActiveCommentTask(null);
  };

  /* ------------------------------------------------------------------
   * Keyboard shortcuts
   * "/" focus search, "n" new task, "esc" close modals/drawers
   * ---------------------------------------------------------------- */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        openAddModal();
      } else if (e.key === "Escape") {
        if (modalOpen) setModalOpen(false);
        if (commentsOpen) closeComments();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalOpen, commentsOpen]);

  /* ------------------------------------------------------------------
   * Invalid project guard
   * ---------------------------------------------------------------- */
  if (badId) {
    return (
      <Layout pageTitle="Tasks">
        <div className="max-w-xl mx-auto mt-16 text-center">
          <p className="text-red-600 font-semibold mb-4">
            Invalid project. Please go back and select a project.
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#819A91] text-white hover:bg-[#A7C1A8] transition"
          >
            ← Back to Projects
          </Link>
        </div>
      </Layout>
    );
  }

  /* ------------------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------------- */
  return (
    <Layout pageTitle="Tasks">
      {/* Inline flash message */}
      {msg.text && (
        <div className="max-w-7xl mx-auto w-full mb-4 px-4">
          <div
            className={[
              "px-4 py-2 rounded border text-sm",
              msg.type === "error"
                ? "bg-red-100 border-red-400 text-red-700"
                : msg.type === "success"
                ? "bg-green-100 border-green-400 text-green-700"
                : "bg-gray-100 border-gray-300 text-gray-700",
            ].join(" ")}
          >
            {msg.text}
          </div>
        </div>
      )}

      {/* Content wrapper */}
      <div className="max-w-7xl mx-auto w-full px-4 pb-20">
        {/* Back link + header row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <Link
            to="/projects"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Projects
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-lg text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition bg-gradient-to-r from-[#819A91] to-[#A7C1A8] flex items-center gap-2"
            >
              <FaPlus /> New Task
            </button>
          </div>
        </div>

        {/* Title + project name */}
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLOR_SAGE }}>
          {project?.name || "Project Tasks"}
        </h1>
        {project?.description && (
          <p className="text-sm text-gray-500 mb-6">{project.description}</p>
        )}

        {/* Stats Header */}
        <StatsHeader
          progress={progressPct}
          total={totalTasks}
          done={doneCount}
          overdue={overdueCount}
          today={todayDue}
          trend={completionTrend}
        />

        {/* Filters & BulkBar */}
        <FiltersBar
          search={search}
          setSearch={setSearch}
          searchRef={searchRef}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          assigneeFilter={assigneeFilter}
          setAssigneeFilter={setAssigneeFilter}
          overdueOnly={overdueOnly}
          setOverdueOnly={setOverdueOnly}
          sortMode={sortMode}
          setSortMode={setSortMode}
          employees={employees}
        />

        {selected.size > 0 && (
          <BulkActionBar
            count={selected.size}
            onClear={clearSelected}
            onDelete={bulkDelete}
            onMove={(st) => bulkMove(st)}
          />
        )}

        {/* Kanban Board */}
        {loading ? (
          <p className="text-center text-gray-500 py-20">Loading tasks...</p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              {KANBAN_COLUMNS.map((col) => (
                <Droppable droppableId={col} key={col}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={[
                        "rounded-2xl p-4 min-h-[300px] shadow-inner transition border border-transparent",
                        KANBAN_BG[col],
                        snapshot.isDraggingOver ? "border-[#819A91]" : "",
                      ].join(" ")}
                    >
                      <ColumnHeader
                        label={KANBAN_LABELS[col]}
                        count={columns[col].length}
                        status={col}
                      />

                      {columns[col].map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided, snap) => (
                            <TaskCard
                              task={task}
                              provided={provided}
                              isDragging={snap.isDragging}
                              selected={selected.has(task._id)}
                              onToggleSelect={() => toggleSelect(task._id)}
                              onEdit={() => openEditModal(task)}
                              onDelete={() => handleDeleteTask(task._id)}
                              onOpenComments={() => openComments(task)}
                              onOpenView={() => setViewTask(task)}
                            />
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

      {/* Add/Edit Modal */}
      {modalOpen && (
        <TaskModal
          employees={employees}
          editingTask={editingTask}
          onClose={() => {
            setModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
        />
      )}

      {/* Task Detail Drawer */}
      {viewTask && (
        <TaskDetailDrawer
          taskId={viewTask._id}
          initialTask={viewTask}
          employees={employees}
          onClose={() => setViewTask(null)}
          onUpdate={(payload) => handleSaveTask(payload)}
          onDelete={() => handleDeleteTask(viewTask._id)}
          onOpenComments={() => openComments(viewTask)}
        />
      )}

      {/* Comments Drawer */}
      {commentsOpen && activeCommentTask && (
        <CommentsDrawer
          task={activeCommentTask}
          onClose={closeComments}
        />
      )}
    </Layout>
  );
}

/* ========================================================================
 * STATS HEADER
 * ====================================================================== */
function StatsHeader({ progress, total, done, overdue, today, trend }) {
  return (
    <div className="w-full mb-8 bg-white rounded-2xl shadow-md p-6 border border-[#D1D8BE]">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatChip
          label="Total"
          value={total}
          color="bg-[#D1D8BE]"
          text="text-[#213547]"
          icon={<FaTasks />}
        />
        <StatChip
          label="Done"
          value={done}
          color="bg-green-200"
          text="text-green-800"
          icon={<FaCheck />}
        />
        <StatChip
          label="Due Today"
          value={today}
          color="bg-blue-200"
          text="text-blue-800"
          icon={<FaCalendarAlt />}
        />
        <StatChip
          label="Overdue"
          value={overdue}
          color="bg-red-200"
          text="text-red-800"
          icon={<FaExclamationTriangle />}
        />
      </div>

      <ProjectProgress percent={progress} />

      {/* Trend chart */}
      <div className="mt-6 h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="done"
              stroke={COLOR_SAGE}
              strokeWidth={3}
              dot={{ r: 3, fill: COLOR_MINT }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatChip({ label, value, color, text, icon }) {
  return (
    <div
      className={`rounded-xl p-4 flex flex-col items-center justify-center shadow-sm ${color} ${text} transition hover:shadow-md`}
    >
      <div className="text-xl">{icon}</div>
      <div className="text-sm mt-1 font-semibold uppercase tracking-wide">
        {label}
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function ProjectProgress({ percent }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Progress</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full h-3 rounded-full bg-[#EEEFE0] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#819A91] to-[#A7C1A8]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/* ========================================================================
 * FILTER BAR
 * ====================================================================== */
function FiltersBar({
  search,
  setSearch,
  searchRef,
  priorityFilter,
  setPriorityFilter,
  assigneeFilter,
  setAssigneeFilter,
  overdueOnly,
  setOverdueOnly,
  sortMode,
  setSortMode,
  employees,
}) {
  return (
    <div className="w-full mb-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4 lg:gap-6">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <input
            ref={searchRef}
            type="text"
            placeholder="Search tasks... ( / )"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#819A91] outline-none"
          />
          <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Priority
          </label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#819A91] outline-none text-sm"
          >
            <option value="ALL">All</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Assignee
          </label>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#819A91] outline-none text-sm"
          >
            <option value="ALL">All</option>
            {employees.map((e) => (
              <option key={e._id} value={e._id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>

        {/* Overdue */}
        <div className="flex items-center gap-2">
          <input
            id="overdueOnly"
            type="checkbox"
            checked={overdueOnly}
            onChange={(e) => setOverdueOnly(e.target.checked)}
            className="w-4 h-4"
          />
          <label
            htmlFor="overdueOnly"
            className="text-sm text-gray-700 select-none cursor-pointer flex items-center gap-1"
          >
            <FaFilter /> Overdue only
          </label>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Sort
          </label>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
            className="px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#819A91] outline-none text-sm"
          >
            <option value="DUE_ASC">Due ↑</option>
            <option value="DUE_DESC">Due ↓</option>
            <option value="TITLE_ASC">Title A→Z</option>
            <option value="TITLE_DESC">Title Z→A</option>
            <option value="PRIORITY_ASC">Priority Low→High</option>
            <option value="PRIORITY_DESC">Priority High→Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================
 * BULK ACTION BAR
 * ====================================================================== */
function BulkActionBar({ count, onClear, onDelete, onMove }) {
  return (
    <div className="sticky top-[72px] z-20 w-full max-w-7xl mx-auto px-4 mb-4">
      <div className="bg-white border border-[#D1D8BE] rounded-lg shadow p-3 flex flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold">{count} selected</span>
        <button
          onClick={() => onMove("TO_DO")}
          className="px-2 py-1 rounded bg-[#fffbe6] hover:bg-yellow-200 transition"
        >
          To Do
        </button>
        <button
          onClick={() => onMove("IN_PROGRESS")}
          className="px-2 py-1 rounded bg-[#e0f2fe] hover:bg-blue-200 transition"
        >
          In Progress
        </button>
        <button
          onClick={() => onMove("DONE")}
          className="px-2 py-1 rounded bg-[#d1fadf] hover:bg-green-200 transition"
        >
          Done
        </button>
        <button
          onClick={onDelete}
          className="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition flex items-center gap-1"
        >
          <FaTrash /> Delete
        </button>
        <button
          onClick={onClear}
          className="ml-auto px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

/* ========================================================================
 * COLUMN HEADER
 * ====================================================================== */
function ColumnHeader({ label, count, status }) {
  const icon =
    status === "TO_DO"
      ? <FaTasks />
      : status === "IN_PROGRESS"
      ? <FaClock />
      : <FaCheck />;
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-bold text-[#213547] flex items-center gap-2">
        {icon} {label}
      </h2>
      <span className="text-xs px-2 py-0.5 rounded bg-white/70 shadow-sm">
        {count}
      </span>
    </div>
  );
}

/* ========================================================================
 * TASK CARD
 * ====================================================================== */
function TaskCard({
  task,
  provided,
  isDragging,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
  onOpenComments,
  onOpenView,
}) {
  const overdue = isPast(task.dueDate) && task.status !== "DONE";
  const initials = getInitials(task.assignedTo?.name);
  const priorityCls = PRIORITY_META[task.priority]?.cls || "bg-gray-100 text-gray-600";

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={[
        "relative group p-4 mb-3 rounded-xl shadow bg-white/90 cursor-grab active:cursor-grabbing transition hover:shadow-lg hover:-translate-y-0.5 border",
        isDragging ? "border-[#819A91]" : "border-transparent",
        selected ? BULK_SELECTED_RING : "",
        overdue ? "ring-1 ring-red-300" : "",
      ].join(" ")}
    >
      {/* Bulk select checkbox */}
      <button
        title={selected ? "Deselect" : "Select"}
        onClick={onToggleSelect}
        className={[
          "absolute top-2 left-2 w-4 h-4 rounded border border-gray-300 flex items-center justify-center text-[10px] leading-none",
          selected ? "bg-[#819A91] text-white" : "bg-white text-transparent",
        ].join(" ")}
      >
        ✓
      </button>

      {/* Title row */}
      <div className="pl-6 pr-6 flex justify-between items-start gap-2">
        <h3
          className="font-semibold text-gray-800 cursor-pointer hover:underline"
          onClick={onOpenView}
        >
          {task.title}
        </h3>
        <div className="flex gap-2 text-gray-400">
          <button
            onClick={onEdit}
            className="hover:text-[#819A91] transition"
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={onDelete}
            className="hover:text-red-500 transition"
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p
          className="mt-1 text-sm text-gray-600 line-clamp-3 cursor-pointer"
          onClick={onOpenView}
        >
          {task.description}
        </p>
      )}

      {/* Meta */}
      <div className="mt-2 flex flex-wrap gap-2 text-xs items-center">
        {/* Priority */}
        <span className={`px-2 py-0.5 rounded-full font-medium ${priorityCls}`}>
          {PRIORITY_META[task.priority]?.label || task.priority}
        </span>

        {/* Due */}
        <span
          className={[
            "px-2 py-0.5 rounded-full font-medium border",
            overdue
              ? "bg-red-100 text-red-700 border-red-200"
              : "bg-gray-100 text-gray-600 border-gray-200",
          ].join(" ")}
        >
          Due: {fmtDateShort(task.dueDate)}
        </span>

        {/* Assignee pill */}
        {task.assignedTo ? (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#A7C1A8]/30 text-[#213547] font-medium border border-[#A7C1A8]/50"
            title={task.assignedTo.name}
          >
            <span className="w-5 h-5 rounded-full bg-[#A7C1A8] text-white flex items-center justify-center text-[10px]">
              {initials}
            </span>
            {task.assignedTo.name}
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 border text-[10px]">
            Unassigned
          </span>
        )}

        {/* Comments button */}
        <button
          onClick={onOpenComments}
          title="Comments"
          className="ml-auto text-gray-400 hover:text-[#819A91] transition flex items-center gap-1"
        >
          <FaCommentDots />
        </button>
      </div>
    </div>
  );
}

/* ========================================================================
 * TASK MODAL (ADD / EDIT)
 * ====================================================================== */
function TaskModal({ employees, editingTask, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    title: editingTask?.title || "",
    description: editingTask?.description || "",
    status: editingTask?.status || "TO_DO",
    priority: editingTask?.priority || "MEDIUM",
    dueDate: editingTask?.dueDate ? editingTask.dueDate.slice(0, 10) : "",
    assignedTo: editingTask?.assignedTo?._id || "",
  }));
  const [saving, setSaving] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate ? new Date(form.dueDate) : null,
      assignedTo: form.assignedTo || null,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-xl p-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold" style={{ color: COLOR_SAGE }}>
            {editingTask ? "Edit Task" : "Add Task"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            title="Close"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            type="text"
            name="title"
            required
            placeholder="Task Title"
            value={form.title}
            onChange={update}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#819A91] outline-none"
          />

          <textarea
            name="description"
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={update}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#819A91] outline-none resize-y"
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              name="status"
              value={form.status}
              onChange={update}
              className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#819A91] outline-none"
            >
              <option value="TO_DO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>

            <select
              name="priority"
              value={form.priority}
              onChange={update}
              className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#819A91] outline-none"
            >
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={update}
            className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#819A91] outline-none"
          />

          <select
            name="assignedTo"
            value={form.assignedTo}
            onChange={update}
            className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#819A91] outline-none"
          >
            <option value="">Unassigned</option>
            {employees.map((e) => (
              <option key={e._id} value={e._id}>
                {e.name} {e.department ? `(${e.department})` : ""}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded text-sm bg-[#819A91] text-white hover:bg-[#A7C1A8] transition"
            >
              {saving ? "Saving..." : editingTask ? "Save Changes" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ========================================================================
 * TASK DETAIL DRAWER (full view w/ subtasks, attachments)
 * ====================================================================== */
function TaskDetailDrawer({
  taskId,
  initialTask,
  employees,
  onClose,
  onUpdate,
  onDelete,
  onOpenComments,
}) {
  const [task, setTask] = useState(initialTask);
  const [editing, setEditing] = useState(false); // inline editing
  const [form, setForm] = useState({
    title: initialTask?.title || "",
    description: initialTask?.description || "",
    status: initialTask?.status || "TO_DO",
    priority: initialTask?.priority || "MEDIUM",
    dueDate: initialTask?.dueDate ? initialTask.dueDate.slice(0, 10) : "",
    assignedTo: initialTask?.assignedTo?._id || "",
  });

  const [subtasks, setSubtasks] = useState(initialTask?.subtasks || []);
  const [subtaskText, setSubtaskText] = useState("");
  const [attachments, setAttachments] = useState(initialTask?.attachments || []);
  const [uploading, setUploading] = useState(false);

  /* On open, optionally refetch fresh task detail (if you have endpoint) */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // If you have GET /tasks/detail/:id you can call here.
        // We'll just trust initialTask for now.
      } catch {
        /* ignore */
      }
      if (!mounted) return;
    })();
    return () => {
      mounted = false;
    };
  }, [taskId]);

  /* Update local state if initialTask changes (rare) */
  useEffect(() => {
    setTask(initialTask);
    setForm({
      title: initialTask?.title || "",
      description: initialTask?.description || "",
      status: initialTask?.status || "TO_DO",
      priority: initialTask?.priority || "MEDIUM",
      dueDate: initialTask?.dueDate ? initialTask.dueDate.slice(0, 10) : "",
      assignedTo: initialTask?.assignedTo?._id || "",
    });
    setSubtasks(initialTask?.subtasks || []);
    setAttachments(initialTask?.attachments || []);
  }, [initialTask]);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const saveEdits = async () => {
    await onUpdate({
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate ? new Date(form.dueDate) : null,
      assignedTo: form.assignedTo || null,
    });
    setEditing(false);
  };

  const cancelEdits = () => {
    setEditing(false);
    setForm({
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "TO_DO",
      priority: task?.priority || "MEDIUM",
      dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : "",
      assignedTo: task?.assignedTo?._id || "",
    });
  };

  /* Subtasks */
  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!subtaskText.trim()) return;
    try {
      const updated = await apiAddSubtask(taskId, subtaskText.trim());
      setSubtasks(updated.subtasks || updated); // depends on backend return
      setSubtaskText("");
    } catch (err) {
      console.error("handleAddSubtask error:", err);
      // fallback local
      setSubtasks((prev) => [
        ...prev,
        { _id: Math.random().toString(36), title: subtaskText.trim(), done: false },
      ]);
      setSubtaskText("");
    }
  };
  const toggleSubtask = async (sub) => {
    try {
      const updated = await apiToggleSubtask(taskId, sub._id, !sub.done);
      setSubtasks(updated.subtasks || updated);
    } catch (err) {
      console.error("toggleSubtask error:", err);
      setSubtasks((prev) =>
        prev.map((s) => (s._id === sub._id ? { ...s, done: !s.done } : s))
      );
    }
  };
  const deleteSubtask = async (sub) => {
    try {
      const updated = await apiDeleteSubtask(taskId, sub._id);
      setSubtasks(updated.subtasks || updated);
    } catch (err) {
      console.error("deleteSubtask error:", err);
      setSubtasks((prev) => prev.filter((s) => s._id !== sub._id));
    }
  };

  /* Attachments */
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const updated = await apiUploadAttachment(taskId, file);
      setAttachments(updated.attachments || updated);
    } catch (err) {
      console.error("uploadAttachment error:", err);
      // fallback local
    }
    setUploading(false);
  };
  const deleteAttachment = async (att) => {
    try {
      const updated = await apiDeleteAttachment(taskId, att._id);
      setAttachments(updated.attachments || updated);
    } catch (err) {
      console.error("deleteAttachment error:", err);
      setAttachments((prev) => prev.filter((a) => a._id !== att._id));
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative ml-auto h-full w-full max-w-lg bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: COLOR_SAGE }}>
            Task Details
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            title="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Top row: edit / delete / comments */}
          <div className="flex flex-wrap gap-2">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600 flex items-center gap-1"
              >
                <FaEdit /> Edit
              </button>
            )}
            {!editing && (
              <button
                onClick={onDelete}
                className="px-3 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600 flex items-center gap-1"
              >
                <FaTrash /> Delete
              </button>
            )}
            <button
              onClick={onOpenComments}
              className="px-3 py-1 rounded bg-[#819A91] text-white text-sm hover:bg-[#A7C1A8] flex items-center gap-1"
            >
              <FaCommentDots /> Comments
            </button>
          </div>

          {/* Editing form */}
          {editing ? (
            <div className="space-y-4">
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={update}
                placeholder="Task Title"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#819A91] outline-none"
              />
              <textarea
                name="description"
                value={form.description}
                onChange={update}
                rows={4}
                placeholder="Description"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#819A91] outline-none resize-y"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  name="status"
                  value={form.status}
                  onChange={update}
                  className="p-2 border rounded focus:ring-2 focus:ring-[#819A91] outline-none text-sm"
                >
                  <option value="TO_DO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={update}
                  className="p-2 border rounded focus:ring-2 focus:ring-[#819A91] outline-none text-sm"
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={update}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#819A91] outline-none text-sm"
              />

              <select
                name="assignedTo"
                value={form.assignedTo}
                onChange={update}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#819A91] outline-none text-sm"
              >
                <option value="">Unassigned</option>
                {employees.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.name} {e.department ? `(${e.department})` : ""}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelEdits}
                  className="px-4 py-2 rounded border text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdits}
                  className="px-5 py-2 rounded text-sm bg-[#819A91] text-white hover:bg-[#A7C1A8] transition"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Static details */}
              <div>
                <h3 className="text-xl font-bold text-gray-800">{task?.title}</h3>
                {task?.description && (
                  <p className="mt-1 text-gray-600 whitespace-pre-line">
                    {task.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <DetailField label="Status" value={KANBAN_LABELS[task?.status] || task?.status} />
                <DetailField label="Priority" value={task?.priority} />
                <DetailField label="Due Date" value={fmtDateLong(task?.dueDate)} />
                <DetailField
                  label="Assignee"
                  value={task?.assignedTo?.name || "Unassigned"}
                />
              </div>
            </>
          )}

          {/* Subtasks */}
          <section>
            <SectionHeader icon={<FaLayerGroup />} title="Subtasks" />
            <SubtaskList
              subtasks={subtasks}
              onToggle={toggleSubtask}
              onDelete={deleteSubtask}
            />
            <form onSubmit={handleAddSubtask} className="mt-2 flex gap-2">
              <input
                type="text"
                value={subtaskText}
                onChange={(e) => setSubtaskText(e.target.value)}
                placeholder="New subtask"
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-[#819A91] outline-none text-sm"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded bg-[#819A91] text-white text-sm hover:bg-[#A7C1A8]"
              >
                Add
              </button>
            </form>
          </section>

          {/* Attachments */}
          <section>
            <SectionHeader icon={<FaPaperclip />} title="Attachments" />
            <AttachmentList
              attachments={attachments}
              onDelete={deleteAttachment}
            />
            <div className="mt-2">
              <input
                type="file"
                onChange={onFileChange}
                disabled={uploading}
                className="text-sm"
              />
            </div>
          </section>

          {/* Activity timeline placeholder */}
          <section>
            <SectionHeader icon={<FaInfoCircle />} title="Activity" />
            <ActivityTimeline task={task} />
          </section>
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
      <div className="font-medium text-gray-700">{value}</div>
    </div>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <h4 className="flex items-center gap-2 font-semibold text-gray-700 mb-2 mt-4">
      {icon} {title}
    </h4>
  );
}

/* ========================================================================
 * SUBTASK LIST
 * ====================================================================== */
function SubtaskList({ subtasks, onToggle, onDelete }) {
  if (!subtasks?.length) {
    return <p className="text-sm text-gray-400">No subtasks yet.</p>;
  }
  return (
    <ul className="space-y-1">
      {subtasks.map((s) => (
        <li
          key={s._id}
          className="flex items-center gap-2 text-sm bg-gray-50 rounded px-2 py-1"
        >
          <button
            title={s.done ? "Mark incomplete" : "Mark complete"}
            onClick={() => onToggle(s)}
            className={[
              "w-5 h-5 rounded border flex items-center justify-center text-[10px]",
              s.done
                ? "bg-[#819A91] border-[#819A91] text-white"
                : "bg-white border-gray-300 text-transparent",
            ].join(" ")}
          >
            ✓
          </button>
          <span
            className={[
              "flex-1",
              s.done ? "line-through text-gray-400" : "text-gray-700",
            ].join(" ")}
          >
            {s.title}
          </span>
          <button
            title="Delete subtask"
            onClick={() => onDelete(s)}
            className="text-red-500 hover:text-red-700"
          >
            <FaTrash />
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ========================================================================
 * ATTACHMENT LIST
 * ====================================================================== */
function AttachmentList({ attachments, onDelete }) {
  if (!attachments?.length) {
    return <p className="text-sm text-gray-400">No attachments.</p>;
  }
  return (
    <ul className="space-y-1 text-sm">
      {attachments.map((a) => (
        <li
          key={a._id || a.url}
          className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1"
        >
          <FaPaperclip className="text-gray-500" />
          <a
            href={a.url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline truncate max-w-[200px]"
          >
            {a.name || a.url}
          </a>
          <button
            onClick={() => onDelete(a)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <FaTrash />
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ========================================================================
 * ACTIVITY TIMELINE (placeholder)
 * ====================================================================== */
function ActivityTimeline({ task }) {
  // For now just show creation + last update
  if (!task) return null;
  return (
    <ul className="space-y-1 text-sm text-gray-600">
      <li>
        Created: {fmtDateLong(task.createdAt)}{" "}
        {task.createdBy?.name ? `by ${task.createdBy.name}` : ""}
      </li>
      <li>
        Updated: {fmtDateLong(task.updatedAt)}{" "}
        {task.updatedBy?.name ? `by ${task.updatedBy.name}` : ""}
      </li>
    </ul>
  );
}

/* ========================================================================
 * COMMENTS DRAWER
 * ====================================================================== */
function CommentsDrawer({ task, onClose }) {
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);

  const loadComments = useCallback(async () => {
    try {
      const data = await apiFetchComments(task._id);
      setComments(data || []);
    } catch (err) {
      console.error("loadComments error:", err);
    } finally {
      setLoading(false);
    }
  }, [task._id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    try {
      const updated = await apiAddComment(task._id, draft.trim());
      setComments(updated.comments || updated);
      setDraft("");
    } catch (err) {
      console.error("addComment error:", err);
      // fallback local
      setComments((prev) => [
        ...prev,
        {
          _id: Math.random().toString(36),
          text: draft.trim(),
          createdAt: new Date().toISOString(),
          author: { name: "You" },
        },
      ]);
      setDraft("");
    }
  };

  const delComment = async (c) => {
    try {
      const updated = await apiDeleteComment(task._id, c._id);
      setComments(updated.comments || updated);
    } catch (err) {
      console.error("delComment error:", err);
      setComments((prev) => prev.filter((x) => x._id !== c._id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: COLOR_SAGE }}>
            Comments – {task.title}
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            title="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-gray-500">Loading comments...</p>
          ) : comments.length ? (
            comments.map((c) => (
              <div
                key={c._id}
                className="p-3 rounded-md bg-gray-50 border border-gray-200 relative"
              >
                <button
                  onClick={() => delComment(c)}
                  className="absolute top-1 right-1 text-xs text-red-500 hover:text-red-700"
                  title="Delete comment"
                >
                  <FaTimes />
                </button>
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {c.text}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {c.author?.name || "Unknown"} •{" "}
                  {fmtDateLong(c.createdAt)}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No comments yet.</p>
          )}
        </div>

        {/* Add comment */}
        <form onSubmit={addComment} className="p-4 border-t flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a comment…"
            className="flex-1 p-2 border rounded focus:ring-2 focus:ring-[#819A91] outline-none text-sm"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded bg-[#819A91] text-white text-sm hover:bg-[#A7C1A8]"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
