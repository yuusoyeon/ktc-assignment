export type TodoStatus = "all" | "active" | "completed";

export type Todo = {
  id: number;
  text: string;
  completed: boolean;
  date: string;
  created_at: string;
  updated_at: string;
}; 

export type GetTodosParams = {
  date?: string;
  status?: TodoStatus;
  q?: string;
};

export type CreateTodoPayload = {
  text: string;
  date: string;
};

export type UpdateTodoPayload = {
  text?: string;
  completed?: boolean;
  date?: string;
};