import Link from "next/link";

import { formatDateKey } from "@/lib/date";

type WeekCalendarDayProps = {
  date: Date;
  dateKey: string;
  selectedDate: string;
  count: number;
  href: string;
};

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

export default function WeekCalendarDay({
  date,
  dateKey,
  selectedDate,
  count,
  href,
}: WeekCalendarDayProps) {
  const todayKey = formatDateKey(new Date());
  const isToday = dateKey === todayKey;
  const isSelected = dateKey === selectedDate;

  const cellStyle = isSelected
    ? "bg-[rgba(103,43,224,0.08)] border-[#672be0]"
    : "border-transparent hover:border-[#672be0] hover:bg-[rgba(103,43,224,0.08)]";

  const numberStyle =
    isToday || isSelected
      ? "bg-[#672be0] text-white"
      : "bg-transparent text-[#1a1625]";

  const dayNameStyle =
    isToday || isSelected
      ? "text-[#672be0] font-medium"
      : "text-[#8c82a3] font-normal";

  return (
    <Link
      href={href}
      aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일`}
      aria-current={isSelected ? "date" : undefined}
      className={`
        flex flex-col items-center gap-[5px] rounded-xl border-[1.5px]
        px-1 py-2 transition duration-200
        ${cellStyle}
      `}
    >
      <span className={`text-[0.72rem] ${dayNameStyle}`}>
        {DAY_NAMES[date.getDay()]}
      </span>

      <span
        className={`
          flex h-7 w-7 items-center justify-center rounded-full
          font-mono text-[0.9rem] font-medium transition duration-200
          ${numberStyle}
        `}
      >
        {date.getDate()}
      </span>

      <span
        className={`
          min-h-[14px] font-mono text-[0.68rem]
          ${count > 0 ? "font-medium text-[#672be0]" : "text-transparent"}
        `}
      >
        {count > 0 ? count : 0}
      </span>
    </Link>
  );
}