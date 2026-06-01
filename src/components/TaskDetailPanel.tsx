import React, { useState } from "react";
import type { Task, Subtask } from "../types/task";
import { getFriendlyDate, isPastDue } from "../types/task";

interface Category {
  id: string;
  name: string;
  color?: string;
}

const BUILTIN = ["Trabajo", "Salud", "Hogar"];
const CAT_THEME: Record<string, { color: string; bg: string }> = {
  Trabajo: { color: "#38bdf8", bg: "#102a45" },
  Salud: { color: "#c084fc", bg: "#291b3b" },
  Hogar: { color: "#94a3b8", bg: "#1e2235" },
};
const PRIORITY_THEME: Record<string, { color: string; bg: string; label: string }> = {
  baja: { color: "#34d399", bg: "#032413", label: "Baja" },
  media: { color: "#fbbf24", bg: "#1c1500", label: "Media" },
  alta: { color: "#f87171", bg: "#1f0a0a", label: "Alta" },
};

function getCatTheme(name: string, color?: string) {
  if (CAT_THEME[name]) return CAT_THEME[name];
  const c = color || "#94a3b8";
  return { color: c, bg: c + "20" };
}

interface Props {
  task: Task;
  categories: Category[];
  onClose: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (id: string, data: any) => Promise<void>;
}

const TaskDetailPanel: React.FC<Props> = ({ task, categories, onClose, onToggle, onDelete, onUpdate }) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(task.title);
  const [editingDesc, setEditingDesc] = useState(false);
  const [descVal, setDescVal] = useState(task.description);
  const [newSubtask, setNewSubtask] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const theme = task.category
    ? getCatTheme(task.category.name, task.category.color)
    : { color: "#94a3b8", bg: "#1e2235" };

  const friendlyDate = getFriendlyDate(task.dueDate);
  const pastDue = !task.completed && isPastDue(task.dueDate);

  const handleSaveTitle = () => {
    setEditingTitle(false);
    if (titleVal.trim() && titleVal !== task.title) {
      onUpdate(task.id, { title: titleVal.trim() });
    }
  };

  const handleSaveDesc = () => {
    setEditingDesc(false);
    if (descVal !== task.description) {
      onUpdate(task.id, { description: descVal });
    }
  };

  const handleToggleSubtask = (sub: Subtask) => {
    const updated = task.subtasks.map((s) =>
      s.id === sub.id ? { ...s, completed: !s.completed } : s
    );
    onUpdate(task.id, { subtasks: updated.map((s) => ({ id: s.id, title: s.title, completed: s.completed })) });
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    const updated = [...task.subtasks, { id: "", title: newSubtask.trim(), completed: false }];
    onUpdate(task.id, { subtasks: updated.map((s) => ({ id: s.id || undefined, title: s.title, completed: s.completed })) });
    setNewSubtask("");
  };

  const handleDeleteSubtask = (id: string) => {
    const updated = task.subtasks.filter((s) => s.id !== id);
    onUpdate(task.id, { subtasks: updated.map((s) => ({ id: s.id, title: s.title, completed: s.completed })) });
  };

  const handleChangeCat = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    onUpdate(task.id, { categoryId: cat ? (BUILTIN.includes(cat.name) ? undefined : catId) : undefined, ...(cat ? {} : {}) });
    // actually we just send categoryId
    onUpdate(task.id, { categoryId: catId });
  };

  const handleChangePriority = (p: "baja" | "media" | "alta") => {
    onUpdate(task.id, { priority: p });
  };

  const handleChangeDue = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(task.id, { dueDate: e.target.value });
  };

  const done = task.subtasks.filter((s) => s.completed).length;
  const progress = task.subtasks.length > 0 ? (done / task.subtasks.length) * 100 : 0;

  return (
    <aside className="w-80 xl:w-96 border-l flex flex-col shrink-0 overflow-y-auto animate-fade-in"
      style={{ borderColor: "#1F243A", background: "#0d0f1a" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10"
        style={{ borderColor: "#1F243A", background: "#0d0f1a" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: theme.color }} />
          <span className="text-xs font-medium" style={{ color: theme.color }}>
            {task.category?.name || "Sin categoría"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {confirmDelete ? (
            <>
              <button onClick={() => setConfirmDelete(false)}
                className="text-xs px-2 py-1 rounded-lg transition-smooth"
                style={{ color: "#7A6E8A" }}>Cancelar</button>
              <button onClick={onDelete}
                className="text-xs px-2 py-1 rounded-lg transition-smooth font-medium"
                style={{ background: "#1f0a0a", color: "#f87171" }}>Eliminar</button>
            </>
          ) : (
            <>
              <button onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-lg transition-smooth"
                style={{ color: "#7A6E8A" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#f87171"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#7A6E8A"}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </button>
              <button onClick={onClose}
                className="p-1.5 rounded-lg transition-smooth"
                style={{ color: "#7A6E8A" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#1F243A"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5 flex-1">
        {/* Title */}
        <div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5" onClick={onToggle}>
              <input type="checkbox" className="task-checkbox cursor-pointer" checked={task.completed} onChange={() => {}} />
            </div>
            {editingTitle ? (
              <input
                autoFocus
                value={titleVal}
                onChange={(e) => setTitleVal(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                className="flex-1 bg-transparent outline-none text-base font-semibold"
                style={{ color: "#F0EBF8", borderBottom: "1px solid #38bdf8" }}
              />
            ) : (
              <h2
                className={`flex-1 text-base font-semibold cursor-text leading-snug ${task.completed ? "line-through" : ""}`}
                style={{ color: task.completed ? "#7A6E8A" : "#F0EBF8" }}
                onClick={() => { setEditingTitle(true); setTitleVal(task.title); }}>
                {task.title}
              </h2>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3">
          {/* Priority */}
          <div>
            <p className="text-xs mb-1.5" style={{ color: "#7A6E8A" }}>Prioridad</p>
            <div className="flex gap-1">
              {(["baja", "media", "alta"] as const).map((p) => {
                const pt = PRIORITY_THEME[p];
                return (
                  <button key={p} onClick={() => handleChangePriority(p)}
                    className="flex-1 text-xs py-1 rounded-lg font-medium transition-smooth"
                    style={{
                      color: task.priority === p ? pt.color : "#7A6E8A",
                      background: task.priority === p ? pt.bg : "transparent",
                      border: `1px solid ${task.priority === p ? pt.color + "40" : "#1F243A"}`,
                    }}>
                    {pt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due date */}
          <div>
            <p className="text-xs mb-1.5" style={{ color: "#7A6E8A" }}>Fecha límite</p>
            <input type="date" value={task.dueDate || ""} onChange={handleChangeDue}
              className="w-full px-2 py-1.5 rounded-lg text-xs outline-none transition-smooth"
              style={{
                background: "#151827", border: "1px solid #1F243A",
                color: pastDue ? "#f87171" : "#F0EBF8",
                colorScheme: "dark",
              }} />
          </div>
        </div>

        {/* Category */}
        <div>
          <p className="text-xs mb-1.5" style={{ color: "#7A6E8A" }}>Categoría</p>
          <select value={task.category?.id || ""} onChange={(e) => handleChangeCat(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-smooth"
            style={{ background: "#151827", border: "1px solid #1F243A", color: "#F0EBF8", colorScheme: "dark" }}>
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs mb-1.5" style={{ color: "#7A6E8A" }}>Descripción</p>
          {editingDesc ? (
            <textarea
              autoFocus
              value={descVal}
              onChange={(e) => setDescVal(e.target.value)}
              onBlur={handleSaveDesc}
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none transition-smooth"
              style={{ background: "#151827", border: "1px solid #38bdf850", color: "#F0EBF8" }}
            />
          ) : (
            <p
              className="text-sm px-3 py-2 rounded-lg cursor-text min-h-[3rem] transition-smooth"
              style={{
                color: task.description ? "#F0EBF8" : "#7A6E8A",
                background: "#151827", border: "1px solid #1F243A",
              }}
              onClick={() => { setEditingDesc(true); setDescVal(task.description); }}>
              {task.description || "Añadir descripción..."}
            </p>
          )}
        </div>

        {/* Subtasks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs" style={{ color: "#7A6E8A" }}>
              Subtareas · {done}/{task.subtasks.length}
            </p>
            {task.subtasks.length > 0 && (
              <span className="text-xs font-medium" style={{ color: "#38bdf8" }}>
                {Math.round(progress)}%
              </span>
            )}
          </div>

          {task.subtasks.length > 0 && (
            <div className="h-1 rounded-full overflow-hidden mb-3" style={{ background: "#1F243A" }}>
              <div className="h-full rounded-full transition-smooth"
                style={{ background: "#38bdf8", width: `${progress}%` }} />
            </div>
          )}

          <div className="space-y-2">
            {task.subtasks.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2.5 group">
                <input type="checkbox" className="task-checkbox cursor-pointer"
                  style={{ width: 16, height: 16 }}
                  checked={sub.completed} onChange={() => handleToggleSubtask(sub)} />
                <span className={`flex-1 text-sm ${sub.completed ? "line-through" : ""}`}
                  style={{ color: sub.completed ? "#7A6E8A" : "#F0EBF8" }}>
                  {sub.title}
                </span>
                <button onClick={() => handleDeleteSubtask(sub.id)}
                  className="opacity-0 group-hover:opacity-100 transition-smooth p-0.5 rounded"
                  style={{ color: "#7A6E8A" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#f87171"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#7A6E8A"}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Add subtask */}
          <div className="flex items-center gap-2 mt-3">
            <input value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="Añadir subtarea..."
              onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
              className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none transition-smooth"
              style={{ background: "#151827", border: "1px solid #1F243A", color: "#F0EBF8" }}
              onFocus={(e) => e.currentTarget.style.borderColor = "#38bdf850"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#1F243A"}
            />
            <button onClick={handleAddSubtask}
              className="p-1.5 rounded-lg transition-smooth"
              style={{ background: "#38bdf815", color: "#38bdf8" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#38bdf825"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#38bdf815"}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Date info */}
      {friendlyDate && (
        <div className="px-5 py-3 border-t"
          style={{ borderColor: "#1F243A" }}>
          <p className="text-xs flex items-center gap-1.5"
            style={{ color: pastDue ? "#f87171" : "#7A6E8A" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {pastDue ? "Vencida: " : "Vence: "}{friendlyDate}
          </p>
        </div>
      )}
    </aside>
  );
};

export default TaskDetailPanel;
