import TodoItem from "./TodoItem";

function getEmptyMessage(currentFilter) {
  if (currentFilter === "active") return "진행 중인 할 일이 없습니다.";
  if (currentFilter === "completed") return "완료한 할 일이 없습니다.";
  return "이 날의 할 일이 없어요.";
}

export default function TodoList({
  todos,
  currentFilter,
  onToggleComplete,
  onUpdateTodo,
  onDeleteTodo,
}) {
  if (todos.length === 0) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-[#d8d1e6] bg-[#faf9fd] px-4 text-center">
        <p className="text-sm font-medium text-[#8c82a3]">
          {getEmptyMessage(currentFilter)}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggleComplete={onToggleComplete}
          onUpdateTodo={onUpdateTodo}
          onDeleteTodo={onDeleteTodo}
        />
      ))}
    </ul>
  );
}