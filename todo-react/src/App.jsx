// src/App.jsx (임시)
import React, { useState } from "react";
import WeekList from "./WeekList"; // 💡 WeekList 컴포넌트 불러오기

function App() {
  // ── 1. 대장 데이터(상태)들 정의하기 ──────────────────
  const [selectedDate, setSelectedDate] = useState(new Date()); // 현재 선택된 날짜
  const [weekOffset, setWeekOffset] = useState(0);              // 주차 이동 (0=이번주)
  const [todos, setTodos] = useState([]);                      // 할 일 목록 배열

  return (
    <div className="p-6 max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* ── 2. 정의한 상태와 변경 함수들을 넘겨주며 조립 ── */}
      <WeekList
        selectedDate={selectedDate}
        weekOffset={weekOffset}
        todos={todos}
        onSelectDate={setSelectedDate}
        onChangeWeek={setWeekOffset}
      />
    </div>
  );
}

export default App;