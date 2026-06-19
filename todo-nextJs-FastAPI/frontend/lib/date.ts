export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getMonday(date: Date): Date {
  const copied = new Date(date);
  const day = copied.getDay();
  const diff = (day + 6) % 7;

  copied.setDate(copied.getDate() - diff);
  copied.setHours(0, 0, 0, 0);

  return copied;
}

export function getWeekDates(baseDate: Date): Date[] {
  const monday = getMonday(baseDate);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

export function addDays(date: Date, days: number): Date {
  const copied = new Date(date);
  copied.setDate(copied.getDate() + days);
  return copied;
}

export function formatDateDisplay(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`);
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  return `${date.getFullYear()}년 ${
    date.getMonth() + 1
  }월 ${date.getDate()}일 (${dayNames[date.getDay()]})`;
}

export function isToday(dateKey: string): boolean {
  return dateKey === formatDateKey(new Date());
}