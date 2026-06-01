import React, { useState } from "react";
import type { Subtask } from "../types/task";

interface Category {
  id: string;
  name: string;
  color?: string;
}



interface Props {
  categories: Category[];
  onClose: () => void;
  onCreate: (
    title: string,
    description: string,
    categoryId: string | undefined,
    subtasks: Omit<Subtask, "id">[],
    dueDate: string,
    priority: "baja" | "media" | "alta"
  ) => void;
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const CreateTaskModal: React.FC<Props> = ({ categories, onClose, onCreate }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [priority, setPriority] = useState<"baja" | "media" | "alta">("media");
  const [dueDate, setDueDate] = useState(today());
  const [subtasks, setSubtasks] = useState<{ title: string; completed: boolean }[]>([]);
  const [newSub, setNewSub] = useState("");
  const [error, setError] = useState("");

  const handleCreate = () => {
    if (!title.trim()) { setError("El nombre es obligatorio"); return; }
    onCreate(title.trim(), description, categoryId || undefined, subtasks, dueDate, priority);
  };

  const addSubtask = () => {
    if (!newSub.trim()) return;
    setSubtasks((prev) => [...prev, { title: newSub.trim(), completed: false }]);
    setNewSub("");
  };

  const removeSubtask = (idx: number) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== idx));
  };

  const PRIORITY_OPTS = [
    { val: "baja" as const, label: "Baja", color: "#34d399", bg: "#032413" },
    { val: "media" as const, label: "Media", color: "#fbbf24", bg: "#1c1500" },
    { val: "alta" as const, label: "Alta", color: "#f87171", bg: "#1f0a0a" },
  ];

  const inputStyle = {
    background: "#0B0D19", border: "1px solid #1F243A", color: "#F0EBF8",
  };
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    e.currentTarget.style.borderColor = "#38bdf850";
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    e.currentTarget.style.borderColor = "#1F243A";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "#000000aa" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md glass-card p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-base" style={{ color: "#F0EBF8" }}>Nueva tarea</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-smooth"
            style={{ color: "#7A6E8A" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#1F243A"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-xl text-xs animate-fade-in"
            style={{ background: "#1f0a0a", color: "#f87171", border: "1px solid #f8717130" }}>
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "#7A6E8A" }}>Título *</label>
            <input autoFocus value={title} onChange={(e) => { setTitle(e.target.value); setError(""); }}
              placeholder="¿Qué necesitas hacer?" onFocus={handleFocus} onBlur={handleBlur}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-smooth"
              style={inputStyle}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
          </div>

          {/* Category + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#7A6E8A" }}>Categoría</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                onFocus={handleFocus} onBlur={handleBlur}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-smooth"
                style={{ ...inputStyle, colorScheme: "dark" }}>
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#7A6E8A" }}>Prioridad</label>
              <div className="flex gap-1">
                {PRIORITY_OPTS.map((p) => (
                  <button key={p.val} onClick={() => setPriority(p.val)}
                    className="flex-1 text-xs py-2.5 rounded-xl font-medium transition-smooth"
                    style={{
                      color: priority === p.val ? p.color : "#7A6E8A",
                      background: priority === p.val ? p.bg : "#0B0D19",
                      border: `1px solid ${priority === p.val ? p.color + "40" : "#1F243A"}`,
                    }}>
                    {p.label[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "#7A6E8A" }}>Fecha límite</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              onFocus={handleFocus} onBlur={handleBlur}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-smooth"
              style={{ ...inputStyle, colorScheme: "dark" }} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "#7A6E8A" }}>Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade detalles..." rows={2} onFocus={handleFocus} onBlur={handleBlur}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-smooth resize-none"
              style={inputStyle} />
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "#7A6E8A" }}>Subtareas</label>
            {subtasks.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {subtasks.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: "#0B0D19", border: "1px solid #1F243A" }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#38bdf8" }} />
                    <span className="flex-1 text-xs" style={{ color: "#F0EBF8" }}>{s.title}</span>
                    <button onClick={() => removeSubtask(i)} style={{ color: "#7A6E8A" }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#f87171"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#7A6E8A"}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input value={newSub} onChange={(e) => setNewSub(e.target.value)}
                placeholder="Nueva subtarea..." onFocus={handleFocus} onBlur={handleBlur}
                onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none transition-smooth"
                style={inputStyle} />
              <button onClick={addSubtask}
                className="p-2 rounded-xl transition-smooth"
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

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-smooth"
            style={{ color: "#7A6E8A", border: "1px solid #1F243A" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#1F243A"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            Cancelar
          </button>
          <button onClick={handleCreate}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-smooth"
            style={{ background: "#38bdf8", color: "#0B0D19" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#7dd3fc"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#38bdf8"}>
            Crear tarea
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
