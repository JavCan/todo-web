import api from "../api";

export interface CategoryResponse {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface SubtaskResponse {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoResponse {
  uuid: string;
  title: string;
  description: string;
  category?: CategoryResponse;
  subtasks?: SubtaskResponse[];
  dueTo?: string;
  priority?: "baja" | "media" | "alta";
  completed: boolean;
  createdAt: string;
  userId: string;
}

export const getCategories = async (): Promise<CategoryResponse[]> => {
  const response = await api.get<CategoryResponse[]>("/categories");
  return response.data;
};

export const createCategory = async (name: string, color?: string, icon?: string): Promise<CategoryResponse> => {
  const response = await api.post<CategoryResponse>("/categories", { name, color, icon });
  return response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`);
};

export const getTodos = async (): Promise<TodoResponse[]> => {
  const response = await api.get<TodoResponse[]>("/todo");
  return response.data;
};

export const createTodo = async (
  title: string,
  description: string,
  categoryId?: string,
  subtasks?: Omit<SubtaskResponse, "id">[],
  dueTo?: string,
  priority?: "baja" | "media" | "alta"
): Promise<TodoResponse> => {
  const response = await api.post<TodoResponse>("/todo", {
    title, description, categoryId, subtasks, dueTo, priority,
  });
  return response.data;
};

export const updateTodo = async (
  uuid: string,
  data: {
    title?: string;
    description?: string;
    completed?: boolean;
    categoryId?: string;
    subtasks?: { id?: string; title: string; completed: boolean }[];
    dueTo?: string;
    priority?: "baja" | "media" | "alta";
  }
): Promise<TodoResponse> => {
  const response = await api.put<TodoResponse>(`/todo/${uuid}`, data);
  return response.data;
};

export const deleteTodo = async (uuid: string): Promise<void> => {
  await api.delete(`/todo/${uuid}`);
};
