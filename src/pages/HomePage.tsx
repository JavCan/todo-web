import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getTodos, createTodo, updateTodo, deleteTodo,
  getCategories, createCategory, deleteCategory,
  type TodoResponse, type CategoryResponse,
} from "../services/todos/todoService";
import { getFriendlyDate, isPastDue, type Task, type Subtask, type Category } from "../types/task";
import TaskDetailPanel from "../components/TaskDetailPanel";
import CreateTaskModal from "../components/CreateTaskModal";
import CreateCategoryModal from "../components/CreateCategoryModal";

const BUILTIN_CATEGORIES = ["Trabajo", "Salud", "Hogar"];

const CATEGORY_THEME: Record<string, { color: string; bg: string }> = {
  Trabajo: { color: "#38bdf8", bg: "#102a45" },
  Salud: { color: "#c084fc", bg: "#291b3b" },
  Hogar: { color: "#94a3b8", bg: "#1e2235" },
};

function getCategoryTheme(cat?: Category): { color: string; bg: string } {
  if (!cat) return { color: "#94a3b8", bg: "#1e2235" };
  if (CATEGORY_THEME[cat.name]) return CATEGORY_THEME[cat.name];
  const c = cat.color || "#94a3b8";
  return { color: c, bg: c + "20" };
}

const PRIORITY_THEME: Record<string, { color: string; bg: string; label: string }> = {
  baja: { color: "#34d399", bg: "#032413", label: "Baja" },
  media: { color: "#fbbf24", bg: "#1c1500", label: "Media" },
  alta: { color: "#f87171", bg: "#1f0a0a", label: "Alta" },
};

function backendToTask(t: TodoResponse): Task {
  return {
    id: t.uuid,
    title: t.title,
    description: t.description,
    category: t.category,
    completed: t.completed,
    subtasks: t.subtasks || [],
    dueDate: t.dueTo,
    priority: t.priority,
    createdAt: t.createdAt,
  };
}

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() ?? "U";

  // Close user menu on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [todosData, catsData] = await Promise.all([getTodos(), getCategories()]);
      setTasks(todosData.map(backendToTask));
      setCategories(catsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Filtered tasks
  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "pending" && t.completed) return false;
    if (filter === "completed" && !t.completed) return false;
    if (catFilter && t.category?.name !== catFilter) return false;
    return true;
  });

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  // Handlers
  const handleToggle = async (task: Task) => {
    const next = !task.completed;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
            ...t, completed: next,
            subtasks: t.subtasks.map((s) => ({ ...s, completed: next })),
          }
          : t
      )
    );
    if (selectedTask?.id === task.id) {
      setSelectedTask((prev) => prev ? {
        ...prev, completed: next,
        subtasks: prev.subtasks.map((s) => ({ ...s, completed: next })),
      } : null);
    }
    try {
      await updateTodo(task.id, { completed: next });
    } catch {
      loadData();
    }
  };

  const handleDelete = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTask?.id === taskId) setSelectedTask(null);
    try { await deleteTodo(taskId); } catch { loadData(); }
  };

  const handleCreate = async (
    title: string, description: string, categoryId: string | undefined,
    subtasks: Omit<Subtask, "id">[], dueDate: string, priority: "baja" | "media" | "alta"
  ) => {
    setShowCreateModal(false);
    try {
      const created = await createTodo(title, description, categoryId, subtasks, dueDate, priority);
      const task = backendToTask(created);
      setTasks((prev) => [task, ...prev]);
      setSelectedTask(task);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTask = async (taskId: string, data: Partial<Task> & { categoryId?: string }) => {
    // 1. Find the old task for reverting
    const oldTask = tasks.find(t => t.id === taskId);
    if (!oldTask) return;

    // 2. Apply optimistic update immediately
    const optimisticTask = { ...oldTask, ...data };
    setTasks((prev) => prev.map((t) => t.id === taskId ? optimisticTask : t));
    if (selectedTask?.id === taskId) {
      setSelectedTask(optimisticTask);
    }

    try {
      const payload: Parameters<typeof updateTodo>[1] = {};
      if (data.title !== undefined) payload.title = data.title;
      if (data.description !== undefined) payload.description = data.description;
      if (data.completed !== undefined) payload.completed = data.completed;
      if (data.categoryId !== undefined) payload.categoryId = data.categoryId;
      if (data.subtasks !== undefined) payload.subtasks = data.subtasks;
      if (data.dueDate !== undefined) payload.dueTo = data.dueDate;
      if (data.priority !== undefined) payload.priority = data.priority;

      const updated = await updateTodo(taskId, payload);
      const task = backendToTask(updated);
      
      // Update with definitive data from server
      setTasks((prev) => prev.map((t) => t.id === taskId ? task : t));
      if (selectedTask?.id === taskId) {
        setSelectedTask(task);
      }
    } catch (e) {
      console.error("Update failed, reverting state:", e);
      // Revert on failure
      setTasks((prev) => prev.map((t) => t.id === taskId ? oldTask : t));
      if (selectedTask?.id === taskId) {
        setSelectedTask(oldTask);
      }
    }
  };

  const handleCreateCategory = async (name: string, color: string, icon: string) => {
    try {
      const cat = await createCategory(name, color, icon);
      setCategories((prev) => [...prev, cat]);
    } catch (e) { console.error(e); }
    setShowCatModal(false);
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (e) { console.error(e); }
  };

  const allCategories = [
    ...BUILTIN_CATEGORIES.map((name) => ({ id: name, name, color: CATEGORY_THEME[name]?.color })),
    ...categories.filter((c) => !BUILTIN_CATEGORIES.includes(c.name)),
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0B0D19" }}>
      <div className="orb" />

      {/* Header */}
      <header className="relative z-20 border-b px-6 py-4 flex items-center gap-4"
        style={{ borderColor: "#1F243A", background: "#0B0D19dd", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-2.5 mr-auto">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#38bdf812", border: "1px solid #38bdf830" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 11l3 3L22 4" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-bold text-base" style={{ color: "#F0EBF8" }}>ToDo</span>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl w-64 transition-smooth"
          style={{ background: "#151827", border: "1px solid #1F243A" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7A6E8A" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tarea..."
            className="bg-transparent outline-none text-sm flex-1"
            style={{ color: "#F0EBF8" }} />
        </div>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-smooth"
            style={{ background: "#38bdf820", color: "#38bdf8", border: "1px solid #38bdf840" }}>
            {initials}
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-12 w-52 rounded-xl shadow-xl z-50 animate-scale-in"
              style={{ background: "#151827", border: "1px solid #1F243A" }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: "#1F243A" }}>
                <p className="text-xs font-medium" style={{ color: "#7A6E8A" }}>Sesión iniciada como</p>
                <p className="text-sm font-medium truncate" style={{ color: "#F0EBF8" }}>{user?.email}</p>
              </div>
              <button onClick={logout}
                className="w-full px-4 py-3 text-sm text-left flex items-center gap-2.5 transition-smooth rounded-b-xl"
                style={{ color: "#f87171" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f8717115"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex relative z-10 overflow-hidden" style={{ maxHeight: "calc(100vh - 65px)" }}>
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-60 border-r shrink-0 overflow-y-auto"
          style={{ borderColor: "#1F243A", background: "#0d0f1a" }}>
          <div className="p-4">
            {/* Stats */}
            <div className="glass-card p-3 mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: "#7A6E8A" }}>Progreso</span>
                <span className="text-xs font-semibold" style={{ color: "#38bdf8" }}>
                  {tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1F243A" }}>
                <div className="h-full rounded-full transition-smooth"
                  style={{ background: "#38bdf8", width: `${tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0}%` }} />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs" style={{ color: "#7A6E8A" }}>{pending.length} pendientes</span>
                <span className="text-xs" style={{ color: "#7A6E8A" }}>{completed.length} completadas</span>
              </div>
            </div>

            {/* Filters */}
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "#7A6E8A" }}>Filtros</p>
            {(["all", "pending", "completed"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-smooth flex items-center gap-2.5"
                style={{
                  background: filter === f ? "#38bdf815" : "transparent",
                  color: filter === f ? "#38bdf8" : "#7A6E8A",
                  border: filter === f ? "1px solid #38bdf820" : "1px solid transparent",
                }}>
                <div className="w-1.5 h-1.5 rounded-full"
                  style={{ background: filter === f ? "#38bdf8" : "#7A6E8A" }} />
                {f === "all" ? "Todas" : f === "pending" ? "Pendientes" : "Completadas"}
                <span className="ml-auto text-xs">
                  {f === "all" ? tasks.length : f === "pending" ? pending.length : completed.length}
                </span>
              </button>
            ))}

            {/* Categories */}
            <div className="mt-4 mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#7A6E8A" }}>Categorías</p>
              <button onClick={() => setShowCatModal(true)}
                className="w-6 h-6 rounded-md flex items-center justify-center transition-smooth"
                style={{ background: "#38bdf815", color: "#38bdf8" }}
                title="Nueva categoría">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>

            <button onClick={() => setCatFilter(null)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-smooth"
              style={{
                background: catFilter === null ? "#38bdf815" : "transparent",
                color: catFilter === null ? "#38bdf8" : "#7A6E8A",
                border: catFilter === null ? "1px solid #38bdf820" : "1px solid transparent",
              }}>
              Todas
            </button>

            {allCategories.map((cat) => {
              const theme = getCategoryTheme({ id: cat.id, name: cat.name, color: cat.color });
              const isCustom = !BUILTIN_CATEGORIES.includes(cat.name);
              return (
                <div key={cat.id} className="flex items-center group mb-1">
                  <button onClick={() => setCatFilter(catFilter === cat.name ? null : cat.name)}
                    className="flex-1 text-left px-3 py-2 rounded-lg text-sm transition-smooth flex items-center gap-2"
                    style={{
                      background: catFilter === cat.name ? `${theme.color}15` : "transparent",
                      color: catFilter === cat.name ? theme.color : "#7A6E8A",
                    }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: theme.color }} />
                    <span className="truncate flex-1">{cat.name}</span>
                    <span className="text-xs">{tasks.filter((t) => t.category?.name === cat.name).length}</span>
                  </button>
                  {isCustom && (
                    <button onClick={() => handleDeleteCategory(cat.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded transition-smooth ml-1"
                      style={{ color: "#f87171" }}
                      title="Eliminar categoría">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#F0EBF8" }}>
                {catFilter || (filter === "all" ? "Todas las tareas" : filter === "pending" ? "Pendientes" : "Completadas")}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "#7A6E8A" }}>
                {filtered.length} {filtered.length === 1 ? "tarea" : "tareas"}
              </p>
            </div>
            <button onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-smooth"
              style={{ background: "#38bdf8", color: "#0B0D19" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#7dd3fc"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#38bdf8"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nueva tarea
            </button>
          </div>

          {/* Mobile search */}
          <div className="flex md:hidden items-center gap-2 px-3 py-2 rounded-xl mb-4"
            style={{ background: "#151827", border: "1px solid #1F243A" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7A6E8A" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tarea..."
              className="bg-transparent outline-none text-sm flex-1"
              style={{ color: "#F0EBF8" }} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "#38bdf8", borderTopColor: "transparent" }} />
                <p className="text-sm" style={{ color: "#7A6E8A" }}>Cargando tareas...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "#151827", border: "1px solid #1F243A" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7A6E8A" strokeWidth="1.5">
                  <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="font-medium" style={{ color: "#7A6E8A" }}>
                {search ? "Sin resultados" : "No hay tareas aquí"}
              </p>
              {!search && (
                <button onClick={() => setShowCreateModal(true)}
                  className="text-sm font-medium transition-smooth"
                  style={{ color: "#38bdf8" }}>
                  + Crear primera tarea
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((task, idx) => {
                const theme = getCategoryTheme(task.category);
                const pTheme = task.priority ? PRIORITY_THEME[task.priority] : null;
                const friendlyDate = getFriendlyDate(task.dueDate);
                const pastDue = !task.completed && isPastDue(task.dueDate);
                const subtasksDone = task.subtasks.filter((s) => s.completed).length;
                const progress = task.subtasks.length > 0 ? (subtasksDone / task.subtasks.length) * 100 : 0;

                return (
                  <div key={task.id}
                    className="glass-card p-4 cursor-pointer group transition-smooth animate-fade-in-up"
                    style={{
                      animationDelay: `${idx * 30}ms`,
                      border: selectedTask?.id === task.id ? "1px solid #38bdf840" : "1px solid #1F243A",
                      background: selectedTask?.id === task.id ? "#38bdf808" : "#151827",
                    }}
                    onClick={() => setSelectedTask(task)}
                    onMouseEnter={(e) => {
                      if (selectedTask?.id !== task.id) {
                        (e.currentTarget as HTMLDivElement).style.borderColor = "#38bdf825";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTask?.id !== task.id) {
                        (e.currentTarget as HTMLDivElement).style.borderColor = "#1F243A";
                      }
                    }}>
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div className="mt-0.5" onClick={(e) => { e.stopPropagation(); handleToggle(task); }}>
                        <input type="checkbox" className="task-checkbox" checked={task.completed} onChange={() => {}} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium transition-smooth ${task.completed ? "line-through" : ""}`}
                            style={{ color: task.completed ? "#7A6E8A" : "#F0EBF8" }}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            {pTheme && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ color: pTheme.color, background: pTheme.bg }}>
                                {pTheme.label}
                              </span>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded transition-smooth"
                              style={{ color: "#7A6E8A" }}
                              onMouseEnter={(e) => e.currentTarget.style.color = "#f87171"}
                              onMouseLeave={(e) => e.currentTarget.style.color = "#7A6E8A"}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center flex-wrap gap-2 mt-2">
                          {task.category && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ color: theme.color, background: theme.bg }}>
                              {task.category.name}
                            </span>
                          )}
                          {friendlyDate && (
                            <span className="text-xs flex items-center gap-1"
                              style={{ color: pastDue ? "#f87171" : "#7A6E8A" }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                              {friendlyDate}
                            </span>
                          )}
                          {task.subtasks.length > 0 && (
                            <span className="text-xs" style={{ color: "#7A6E8A" }}>
                              {subtasksDone}/{task.subtasks.length} subtareas
                            </span>
                          )}
                        </div>

                        {/* Subtask progress bar */}
                        {task.subtasks.length > 0 && (
                          <div className="mt-2.5 h-1 rounded-full overflow-hidden" style={{ background: "#1F243A" }}>
                            <div className="h-full rounded-full transition-smooth"
                              style={{ background: task.completed ? "#34d399" : "#38bdf8", width: `${progress}%` }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Detail panel */}
        {selectedTask && (
          <TaskDetailPanel
            task={selectedTask}
            categories={allCategories}
            onClose={() => setSelectedTask(null)}
            onToggle={() => handleToggle(selectedTask)}
            onDelete={() => handleDelete(selectedTask.id)}
            onUpdate={handleUpdateTask}
          />
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateTaskModal
          categories={allCategories}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}
      {showCatModal && (
        <CreateCategoryModal
          onClose={() => setShowCatModal(false)}
          onCreate={handleCreateCategory}
        />
      )}
    </div>
  );
};

export default HomePage;
