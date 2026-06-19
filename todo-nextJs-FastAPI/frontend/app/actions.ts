"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createTodo as createTodoRequest,
  deleteTodo as deleteTodoRequest,
  getTodo as getTodoRequest,
  getTodos as getTodosRequest,
  updateTodo as updateTodoRequest,
} from "@/lib/api";
import type { GetTodosParams } from "@/lib/type";

function getRequiredString(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string") {
    throw new Error("잘못된 요청입니다.");
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error("할 일을 입력해 주세요.");
  }

  return trimmed;
}

function getOptionalString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);

  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed || undefined;
}

function getRedirectPath(formData: FormData): string {
  const redirectTo = getOptionalString(formData, "redirectTo");

  if (!redirectTo) return "/todos";

  if (!redirectTo.startsWith("/todos")) return "/todos";

  return redirectTo;
}

export async function getTodos(params: GetTodosParams = {}) {
  return getTodosRequest(params);
}

export async function getTodo(todoId: number | string) {
  return getTodoRequest(todoId);
}

export async function createTodo(formData: FormData) {
  const text = getRequiredString(formData, "text");
  const date = getRequiredString(formData, "date");
  const redirectTo = getRedirectPath(formData);

  await createTodoRequest({
    text,
    date,
  });

  revalidatePath("/todos");
  redirect(redirectTo);
}

export async function updateTodo(todoId: number | string, formData: FormData) {
  const text = getRequiredString(formData, "text");
  const redirectTo = getRedirectPath(formData);

  await updateTodoRequest(todoId, {
    text,
  });

  revalidatePath("/todos");
  revalidatePath(`/todos/${todoId}`);

  redirect(redirectTo);
}

export async function deleteTodo(todoId: number | string) {
  await deleteTodoRequest(todoId);

  revalidatePath("/todos");
}

export async function toggleTodo(
  todoId: number | string,
  completed: boolean,
) {
  await updateTodoRequest(todoId, {
    completed,
  });

  revalidatePath("/todos");
}
