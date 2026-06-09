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
    <main
      className="
        min-h-screen px-4 pb-20 pt-[60px] text-[#1a1625]
        bg-[#f7f6fb]
        [background-image:radial-gradient(circle,#c4b5e8_1px,transparent_1px)]
        [background-size:28px_28px]
      "
    >
      <div >
        {/* ── 1. 헤더 영역 ── */}
        <header
          className="
          relative overflow-hidden rounded-[20px] border border-[#e4dfef]
          bg-[#ffffff] py-8 pl-12 pr-9 shadow-[0_4px_24px_rgba(103,43,224,0.07)]
          "
        >
          <div className="absolute left-0 top-0 h-full w-[5px] bg-gradient-to-b from-[#672be0] to-[#8a55e8]" />

          <div style={{ paddingLeft: "12px" }}>
            <h1 className="font-mono text-[2.4rem] font-medium leading-none text-[#672be0] italic">
              Todo List
            </h1>

            <p className="mt-2.5 break-words font-mono text-[0.82rem] font-normal tracking-[0.5px] text-[#8c82a3]">
              {completedCount}
              {" / "}
              {totalCount} completed
            </p>
          </div>
        </header>

        {/* ── 2. 주간 달력 ── */}
        <WeekList
          selectedDate={selectedDate}
          weekOffset={weekOffset}
          todos={todos}
          onSelectDate={handleSelectDate}
          onChangeWeek={setWeekOffset}
        />

        {/* ── 3. 선택된 날짜 및 오늘 표시 뱃지 영역 ── */}
        <section
          className="
            flex items-center justify-evenly rounded-[20px] border border-[#e4dfef]
            bg-[#ffffff] px-5 py-3.5 shadow-[0_4px_24px_rgba(103,43,224,0.07)]
          "
        >
          <span style= {{color: "#404040" }} className="font-mono text-[0.95rem] font-medium tracking-[0.3px] text -[#8c82a3]">
            {formatDateDisplay(selectedDate)}
          </span>

          {selectedDateKey === formatDateKey(new Date()) && (
            <span className="rounded-full bg-[rgba(103,43,224,0.08)] px-2 py-0.5 text-[0.72rem] font-medium tracking-[0.3px] text-[#672be0]">
              오늘
            </span>
          )}
        </section>

        {/* ── 4. 할 일 입력창 ── */}
        <TodoInput onAddTodo={handleAddTodo} />

        {/* ── 5. 필터 탭 ── */}
        <FilterTabs
          currentFilter={currentFilter}
          onChangeFilter={setCurrentFilter}
        />

        {/* ── 6. 할 일 리스트 ── */}
        <TodoList
          todos={filteredTodos}
          currentFilter={currentFilter}
          onToggleComplete={handleToggleComplete}
          onUpdateTodo={handleUpdateTodo}
          onDeleteTodo={handleDeleteTodo}
        />
      </div>
    </main>
  );
}