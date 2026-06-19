import type {
  CreateTodoPayload,
  GetTodosParams,
  Todo,
  UpdateTodoPayload,
} from "./type";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "요청 처리 중 오류가 발생했습니다.";

    try {
      const errorBody = await response.json();
      message = errorBody.detail ?? message;
    } catch {
      // JSON 응답이 아닌 경우 기본 메시지를 사용한다.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function getTodos({
  date,
  status = "all",
  q,
}: GetTodosParams = {}): Promise<Todo[]> {
  const params = new URLSearchParams();

  if (date) params.set("date", date);
  if (status) params.set("status", status);
  if (q) params.set("q", q);

  const queryString = params.toString();

  return request<Todo[]>(`/todos${queryString ? `?${queryString}`: ""}`);
}

export async function getTodo(todoId: number | string): Promise<Todo> {
  return request<Todo>(`/todos/${todoId}`);
}

export async function createTodo(payload: CreateTodoPayload): Promise<Todo> {
  return request<Todo>("/todos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTodo(
  todoId: number | string,
  payload: UpdateTodoPayload,
): Promise<Todo> {
  return request<Todo>(`/todos/${todoId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTodo(todoId: number | string): Promise<{
  message: string;
  id: number;
}> {
  return request(`/todos/${todoId}`, {
    method: "DELETE",
  });
}