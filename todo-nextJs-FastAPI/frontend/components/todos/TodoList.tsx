import type { Todo } from "@/lib/type";

import TodoEmptyState from "./TodoEmptyState";
import TodoItem from "./TodoItem";

type TodoListProps = {
  todos: Todo[];
  status: string;
  q?: string;
};

export default function TodoList({ todos, status, q }: TodoListProps) {
  if (todos.length === 0) {
    return <TodoEmptyState status={status} q={q} />;
  }

  return (
    <ul className="flex list-none flex-col gap-2.5">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}