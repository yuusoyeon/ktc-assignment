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
      <section className="rounded-[20px] border border-[#e4dfef] bg-[#ffffff] px-6 py-[52px] text-center text-[0.9rem] leading-[1.7] text-[#8c82a3] shadow-[0_4px_24px_rgba(103,43,224,0.07)]">
        <span className="mb-3 block text-[1.6rem] text-[#672be0] opacity-40">
          +
        </span>
        <p className="whitespace-pre-line">{getEmptyMessage(currentFilter)}</p>
      </section>
    );
  }

  return (
    <ul style={{ paddingLeft: "0px" }} className="flex justify-start list-none flex-col gap-2.5">
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