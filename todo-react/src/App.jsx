import { useEffect, useMemo, useState } from "react";
import WeekList, { formatDateKey, getMonday } from "./WeekList";
import TodoInput from "./TodoInput";
import FilterTabs from "./FilterTabs";
import TodoList from "./TodoList";

const STORAGE_KEY = "todos";

function loadTodosFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((todo) => {
      return (
        todo &&
        typeof todo.id !== "undefined" &&
        typeof todo.text === "string" &&
        typeof todo.completed === "boolean" &&
        typeof todo.date === "string"
      );
    });
  } catch {
    return [];
  }
}

function formatDateDisplay(date) {
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  return `${date.getFullYear()}년 ${
    date.getMonth() + 1
  }월 ${date.getDate()}일 (${dayNames[date.getDay()]})`;
}

function isSameWeek(a, b) {
  return formatDateKey(getMonday(a)) === formatDateKey(getMonday(b));
}

function getWeekOffsetFromToday(date) {
  const todayMonday = getMonday(new Date());
  const targetMonday = getMonday(date);
  const diffDays = Math.round(
    (targetMonday.getTime() - todayMonday.getTime()) / (1000 * 60 * 60 * 24)
  );

  return Math.round(diffDays / 7);
}

export default function App() {
  const [todos, setTodos] = useState(() => loadTodosFromStorage());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentFilter, setCurrentFilter] = useState("all");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const selectedDateKey = formatDateKey(selectedDate);

  const selectedDateTodos = useMemo(() => {
    return todos.filter((todo) => todo.date === selectedDateKey);
  }, [todos, selectedDateKey]);

  const filteredTodos = useMemo(() => {
    return selectedDateTodos.filter((todo) => {
      if (currentFilter === "active") return !todo.completed;
      if (currentFilter === "completed") return todo.completed;
      return true;
    });
  }, [selectedDateTodos, currentFilter]);

  const completedCount = selectedDateTodos.filter((todo) => todo.completed).length;
  const totalCount = selectedDateTodos.length;

  const handleSelectDate = (date) => {
    setSelectedDate(date);

    if (!isSameWeek(date, selectedDate)) {
      setWeekOffset(getWeekOffsetFromToday(date));
    }
  };

  const handleAddTodo = (text) => {
    const newTodo = {
      id: Date.now(),
      text,
      completed: false,
      date: selectedDateKey,
    };

    setTodos((prevTodos) => [newTodo, ...prevTodos]);
  };

  const handleToggleComplete = (id) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleUpdateTodo = (id, text) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) => (todo.id === id ? { ...todo, text } : todo))
    );
  };

  const handleDeleteTodo = (id) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  };

  return (
    <main className="min-h-screen bg-[#f7f5fb] px-4 py-6 text-[#1a1625]">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-normal">Todo</h1>
          <p className="text-sm font-medium text-[#8c82a3]">
            {formatDateDisplay(selectedDate)}
          </p>
        </header>

        <WeekList
          selectedDate={selectedDate}
          weekOffset={weekOffset}
          todos={todos}
          onSelectDate={handleSelectDate}
          onChangeWeek={setWeekOffset}
        />

        <section className="rounded-2xl border border-[#e4dfef] bg-white p-4 shadow-[0_4px_24px_rgba(103,43,224,0.07)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold">오늘의 할 일</h2>
            <span className="text-xs font-semibold text-[#8c82a3]">
              완료 {completedCount} / 전체 {totalCount}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <TodoInput onAddTodo={handleAddTodo} />

            <FilterTabs
              currentFilter={currentFilter}
              onChangeFilter={setCurrentFilter}
            />

            <TodoList
              todos={filteredTodos}
              currentFilter={currentFilter}
              onToggleComplete={handleToggleComplete}
              onUpdateTodo={handleUpdateTodo}
              onDeleteTodo={handleDeleteTodo}
            />
          </div>
        </section>
      </div>
    </main>
  );
}