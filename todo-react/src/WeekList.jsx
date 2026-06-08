import {useMemo} from "react";

// ── 날짜 유틸리티 ─────────────────────────────────────────

/**
 * Date 객체를 'YYYY-MM-DD' 키 문자열로 변환
 * Todo의 date 필드 및 날짜 비교에 사용
 * @param {Date} date
 * @returns {string} 'YYYY-MM-DD'
 */
export function formatDateKey(date) {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1, 2자리로 만들되 빈 자리는 0 채워넣기
  const day   = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 기준 날짜가 속한 주의 월요일 Date 객체를 반환
 * JS의 getDay(): 0=일, 1=월 ... 6=토
 * (요일 + 6) % 7 → 월요일로부터 며칠 뒤인지 계산
 * @param {Date} date
 * @returns {Date} 해당 주 월요일 (시간은 00:00:00으로 초기화)
 */
export function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7; // 월요일로부터의 거리
  d.setDate(d.getDate() - diff);
  d.setHours(0,0,0,0);
  return d;
}

/**
 * 월요일 기준으로 해당 주의 날짜 7개 배열 생성 (월 ~ 일)
 * @param {Date} monday - 해당 주 월요일
 * @returns {Date[]} 7개의 Date 객체 배열
 */
export function getWeekDates(monday) {
  return Array.from({ length : 7}, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

// ── 상수 ─────────────────────────────────────────────────

const DAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"];

// ── WeekList 컴포넌트 ─────────────────────────────────────

/**
 * WeekList
 * 주간 캘린더 UI를 담당하는 컴포넌트
 *
 * Props:
 * @param {Date}     selectedDate   - 현재 선택된 날짜 (App에서 관리)
 * @param {number}   weekOffset     - 주차 오프셋 (0=이번 주, -1=지난 주, ...)
 * @param {object[]} todos          - 전체 todos 배열 (날짜별 개수 계산용)
 * @param {function} onSelectDate   - 날짜 셀 클릭 시 selectedDate 업데이트 콜백
 * @param {function} onChangeWeek   - 이전/다음 주 버튼 클릭 시 weekOffset 업데이트 콜백
 */
export default function WeekList({
  selectedDate,
  weekOffset,
  todos,
  onSelectDate,
  onChangeWeek,
}) {
  // ── 주간 날짜 계산 (weekOffset이 바뀔 때만 재계산) ──────
  // useMemo <-> useState
  const { monday, sunday, weekDates } = useMemo(() => {
    // 오늘 기준으로 weekOffset 주만큼 이동한 날의 월요일 계산
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7);
    const monday = getMonday(base);
    const weekDates = getWeekDates(monday);
    const sunday = weekDates[6];
    return { monday, sunday, weekDates };
  }, [weekOffset]);

  const todayKey = formatDateKey(new Date());
  const selectedKey = formatDateKey(selectedDate);

  // 주차 범위 텍스트 (예: 2026.6.2 ~ 2026.6.8)
  const weekRangeLabel = `${monday.getFullYear()}.${monday.getMonth() + 1}.${monday.getDate()} ~ ${sunday.getFullYear()}.${sunday.getMonth() + 1}.${sunday.getDate()}`;

  return (
    <div className="bg-white rounded-2xl border border-[#e4dfef] shadow-[0_4px_24px_rgba(103,43,224,0.07)] p-4">
      {/* ── 주차 헤더: 이전/다음 버튼 + 범위 텍스트 ── */}
      <div className="flex items-center justify-between mb-4">
        <button
          className="w-8 h-8 flex items-center justify-center
            border border-[#e4dfef] rounded-md
            text-[#8c82a3] text-xl leading-none
            transition-colors duration-200
            hover:bg-[rgba(103,43,224,0.08)] hover:text-[#672be0] hover:border-[#672be0]
            cursor-pointer
          "
          onClick={() => onChangeWeek(weekOffset - 1)}
          title="이전 주"
        >
          ‹
        </button>

        {/* 주차 범위 텍스트 */}
        <span className="font-mono text-sm font-medium text-[#1a1625] tracking-tight">{weekRangeLabel}</span>

        <button
          className="
            w-8 h-8 flex items-center justify-center
            border border-[#e4dfef] rounded-md
            text-[#8c82a3] text-xl leading-none
            transition-colors duration-200
            hover:bg-[rgba(103,43,224,0.08)] hover:text-[#672be0] hover:border-[#672be0]
            cursor-pointer
          "
          onClick={() => onChangeWeek(weekOffset + 1)}
          title="다음 주"
        >
          ›
        </button>
      </div>

      {/* ── 날짜 셀 7개 (월 ~ 일) ── */}
      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((date, i) => {
          const dateKey = formatDateKey(date);

          // 해당 날짜의 Todo 개수
          const count = todos.filter((t) => t.date === dateKey).length;

          // 날짜 상태에 따른 클래스 결정
          // 우선 순위 : is-selected > is-today > (기본)
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedKey;

          let numStyle = "";
          if (isSelected) {
            // [선택된 날짜] 강조: 진한 보라 배경 + 흰 글자
            numStyle = "bg-[#672be0] text-white";
          } else if (isToday) {
            // [오늘이지만 미선택] 독자적 하이라이트: 연보라 배경 + 보라 글자
            numStyle = "bg-[rgba(103,43,224,0.12)] text-[#672be0]";
          } else {
            // [그 외 날짜] 기본 무채색
            numStyle = "text-[#1a1625]";
          }

          const cellBg = isSelected
          ? "bg-[rgba(103,43,224,0.05)]"
            : "hover:bg-[rgba(103,43,224,0.04)]";

          return (
            <div
              key={dateKey}
              onClick={() => onSelectDate(new Date(date))}
              role="button"
              tabIndex={0}

              // 키보드 접근성: Enter / Space 키로도 선택 가능
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectDate(new Date(date));
                }
              }}
              aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일${isToday ? " (오늘)" : ""}${isSelected ? " (선택됨)" : ""}`}
              aria-pressed={isSelected}
              className={`
                flex flex-col items-center gap-1 py-2 px-1
                rounded-xl cursor-pointer
                transition-colors duration-200
                ${cellBg}
              `}
            >
              {/* 요일 텍스트 */}
              <span className="text-[11px] font-medium text-[#8c82a3] tracking-wide uppercase">{DAY_NAMES[i]}</span>

              {/* 날짜 숫자 */}
              <span className={`
                  w-8 h-8 flex items-center justify-center
                  rounded-full text-sm font-semibold
                  transition-colors duration-200
                  ${numStyle}
                `}>{date.getDate()}</span>

              {/* Todo 개수 뱃지: 0개면 빈 자리로 레이아웃 유지 */}
              <span className={`
                  text-[11px] font-medium h-4 min-w-4
                  flex items-center justify-center
                  rounded-full px-1
                  transition-colors duration-200
                  ${count > 0
                    ? "text-[#672be0] bg-[rgba(103,43,224,0.1)]"
                    : "text-transparent"
                  }
                `}>
                {count > 0 ? count : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

}