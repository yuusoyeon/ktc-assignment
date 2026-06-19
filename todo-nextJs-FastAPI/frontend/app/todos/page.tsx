import Link from "next/link";

import { getTodos } from "@/app/actions";
import AppHeader from "@/components/layout/AppHeader";
import PageShell from "@/components/layout/PageShell";
import TodoList from "@/components/todos/TodoList";
import TodoToolbar from "@/components/todos/TodoToolbar";
import WeekCalendar from "@/components/todos/WeekCalendar";
import { formatDateKey } from "@/lib/date";
import type { TodoStatus } from "@/lib/type";

type TodosPageProps = {
  searchParams?: {
    date?: string;
    week?: string;
    status?: TodoStatus;
    q?: string;
  };
};

function normalizeStatus(status?: string): TodoStatus {
  if (status === "active" || status === "completed") return status;
  return "all";
}

export default async function TodosPage({ searchParams }: {searchParams: Promise<{ date?: string; week?: string; status?: string; q?: string}>} ) {
  const today = formatDateKey(new Date());
  const resolvedSearchParams = await searchParams;

  const selectedDate = resolvedSearchParams?.date ?? today;
  const calendarBaseDate = resolvedSearchParams?.week ?? selectedDate;
  const status = normalizeStatus(resolvedSearchParams?.status);
  const q = resolvedSearchParams?.q?.trim() || undefined;

  const todos = await getTodos({
    date: selectedDate,
    status,
    q,
  });

  const allTodos = await getTodos({
    status: "all",
  });

  const selectedDateTodos = allTodos.filter(
    (todo) => todo.date === selectedDate,
  );

  const totalCount = selectedDateTodos.length;
  const completedCount = selectedDateTodos.filter(
    (todo) => todo.completed,
  ).length;

  const createHref = `/todos/new?date=${selectedDate}`;

  return (
    <PageShell>
      <AppHeader totalCount={totalCount} completedCount={completedCount} />

      <WeekCalendar
        selectedDate={selectedDate}
        calendarBaseDate={calendarBaseDate}
        todos={allTodos}
        status={status}
        q={q}
      />

      <section
        className="
          flex items-center justify-between rounded-[20px] border border-[#e4dfef]
          bg-white px-5 py-3.5 shadow-[0_4px_24px_rgba(103,43,224,0.07)]
        "
      >
        <span className="font-mono text-[0.95rem] font-medium tracking-[0.3px] text-[#1a1625]">
          {selectedDate}
        </span>

        <Link
          href={createHref}
          className="
            flex h-9 items-center justify-center rounded-xl bg-[#672be0]
            px-4 text-[0.88rem] font-medium text-[#ffffff]
            shadow-[0_2px_10px_rgba(103,43,224,0.28)]
            transition duration-200
            hover:-translate-y-px hover:bg-[#8a55e8]
            hover:shadow-[0_4px_14px_rgba(103,43,224,0.38)]
            active:translate-y-0
          "
        >
        <span className="text-white">
          Todo 추가
        </span>
        </Link>
      </section>

      <TodoToolbar selectedDate={selectedDate} status={status} q={q} />

      <TodoList todos={todos} status={status} q={q} />
    </PageShell>
  );
}