import Link from "next/link";

import { addDays, formatDateKey, getWeekDates } from "@/lib/date";
import type { Todo } from "@/lib/type";

import WeekCalendarDay from "./WeekCalendarDay";

type WeekCalendarProps = {
  selectedDate: string;
  calendarBaseDate: string;
  todos: Todo[];
  status?: string;
  q?: string;
};

function createWeekHref({
  week,
  selectedDate,
  status,
  q,
}: {
  week: string;
  selectedDate?: string;
  status?: string;
  q?: string;
}) {
  const params = new URLSearchParams();

  params.set("week", week);

  if (selectedDate) {
    params.set("date", selectedDate);
  }

  if (status && status !== "all") {
    params.set("status", status);
  }

  if (q) {
    params.set("q", q);
  }

  return `/todos?${params.toString()}`;
}

function createDateHref({
  date,
  status,
  q,
}: {
  date: string;
  status?: string;
  q?: string;
}) {
  const params = new URLSearchParams();

  params.set("date", date);

  if (status && status !== "all") {
    params.set("status", status);
  }

  if (q) {
    params.set("q", q);
  }

  return `/todos?${params.toString()}`;
}

function getTodoCountByDate(todos: Todo[]) {
  return todos.reduce<Record<string, number>>((acc, todo) => {
    acc[todo.date] = (acc[todo.date] ?? 0) + 1;
    return acc;
  }, {});
}

export default function WeekCalendar({
  selectedDate,
  calendarBaseDate,
  todos,
  status = "all",
  q,
}: WeekCalendarProps) {
  const baseDate = new Date(`${calendarBaseDate}T00:00:00`);
  const weekDates = getWeekDates(baseDate);
  const monday = weekDates[0];
  const sunday = weekDates[6];

  const prevWeekDate = formatDateKey(addDays(baseDate, -7));
  const nextWeekDate = formatDateKey(addDays(baseDate, 7));

  const todoCountByDate = getTodoCountByDate(todos);

  const weekRangeLabel = `${monday.getFullYear()}.${
    monday.getMonth() + 1
  }.${monday.getDate()} ~ ${sunday.getFullYear()}.${
    sunday.getMonth() + 1
  }.${sunday.getDate()}`;

  return (
    <section
      className="
        rounded-[20px] border border-[#e4dfef] bg-white px-5 py-4
        shadow-[0_4px_24px_rgba(103,43,224,0.07)]
      "
    >
      <div className="mb-3.5 flex items-center justify-between">
        <Link
          href={createWeekHref({
            week: prevWeekDate,
            selectedDate,
            status,
            q,
          })}
          aria-label="이전 주"
          className="
            flex h-7 w-7 items-center justify-center rounded-md
            border-[1.5px] border-[#e4dfef] text-[1.2rem] leading-none
            text-[#8c82a3] transition duration-200
            hover:border-[#672be0] hover:bg-[rgba(103,43,224,0.08)]
            hover:text-[#672be0]
          "
        >
          ‹
        </Link>

        <span className="font-mono text-[0.82rem] tracking-[0.3px] text-[#8c82a3]">
          {weekRangeLabel}
        </span>

        <Link
          href={createWeekHref({
            week: nextWeekDate,
            selectedDate,
            status,
            q,
          })}
          aria-label="다음 주"
          className="
            flex h-7 w-7 items-center justify-center rounded-md
            border-[1.5px] border-[#e4dfef] text-[1.2rem] leading-none
            text-[#8c82a3] transition duration-200
            hover:border-[#672be0] hover:bg-[rgba(103,43,224,0.08)]
            hover:text-[#672be0]
          "
        >
          ›
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weekDates.map((date) => {
          const dateKey = formatDateKey(date);

          return (
            <WeekCalendarDay
              key={dateKey}
              date={date}
              dateKey={dateKey}
              selectedDate={selectedDate}
              count={todoCountByDate[dateKey] ?? 0}
              href={createDateHref({
                date: dateKey,
                status,
                q,
              })}
            />
          );
        })}
      </div>
    </section>
  );
}