export type Priority = "baja" | "media" | "alta";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category?: Category;
  completed: boolean;
  subtasks: Subtask[];
  dueDate?: string;       // "YYYY-MM-DD"
  priority?: Priority;
  createdAt: string;
}

export const formatSpanishDate = (dateStr: string): string => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;
};

export const getFriendlyDate = (dueDate: string | undefined): string => {
  if (!dueDate) return "";
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

  if (dueDate === todayStr) return "Hoy";
  if (dueDate === tomorrowStr) return "Mañana";
  return formatSpanishDate(dueDate);
};

export const isPastDue = (dueDate: string | undefined): boolean => {
  if (!dueDate) return false;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return dueDate < todayStr;
};
