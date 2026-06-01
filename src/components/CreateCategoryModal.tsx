import React, { useState } from "react";

interface Props {
  onClose: () => void;
  onCreate: (name: string, color: string, icon: string) => void;
}

const COLOR_OPTIONS = ["#fb923c", "#34d399", "#f472b6", "#a78bfa", "#fbbf24", "#22d3ee", "#f87171"];
const ICON_OPTIONS = ["💼", "❤️", "🏠", "🛒", "📚", "🎮", "🎵", "✈️", "💪"];

const CreateCategoryModal: React.FC<Props> = ({ onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [error, setError] = useState("");

  const handleCreate = () => {
    if (!name.trim()) { setError("El nombre es obligatorio"); return; }
    onCreate(name.trim(), color, icon);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "#000000aa" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm glass-card p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-base" style={{ color: "#F0EBF8" }}>Nueva categoría</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-smooth" style={{ color: "#7A6E8A" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#1F243A"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-xl text-xs"
            style={{ background: "#1f0a0a", color: "#f87171", border: "1px solid #f8717130" }}>
            {error}
          </div>
        )}

        {/* Preview */}
        <div className="flex items-center gap-3 mb-5 p-3 rounded-xl"
          style={{ background: color + "15", border: `1px solid ${color}30` }}>
          <span className="text-xl">{icon}</span>
          <span className="font-medium text-sm" style={{ color }}>{name || "Mi categoría"}</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "#7A6E8A" }}>Nombre</label>
            <input autoFocus value={name} onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="Ej. Personal" onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-smooth"
              style={{ background: "#0B0D19", border: "1px solid #1F243A", color: "#F0EBF8" }}
              onFocus={(e) => e.currentTarget.style.borderColor = "#38bdf850"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#1F243A"} />
          </div>

          <div>
            <label className="block text-xs mb-2" style={{ color: "#7A6E8A" }}>Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button key={c} onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-smooth"
                  style={{
                    background: c,
                    outline: color === c ? `2px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }} />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs mb-2" style={{ color: "#7A6E8A" }}>Icono</label>
            <div className="flex gap-2 flex-wrap">
              {ICON_OPTIONS.map((ic) => (
                <button key={ic} onClick={() => setIcon(ic)}
                  className="w-9 h-9 rounded-xl text-base transition-smooth flex items-center justify-center"
                  style={{
                    background: icon === ic ? color + "30" : "#0B0D19",
                    border: `1px solid ${icon === ic ? color + "60" : "#1F243A"}`,
                  }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
        </div>

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
            style={{ background: color, color: "#0B0D19" }}>
            Crear
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCategoryModal;
