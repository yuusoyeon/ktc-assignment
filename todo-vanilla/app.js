/* ==============================
  Todo 앱 - app.js
  기본 CRUD + 필터 + 일간 뷰 + 주간 뷰 + 로컬스토리지
   ============================== */

// ── DOM 요소 참조 ───────────────────────────────────────
const todoInput       = document.getElementById('todoInput');
const addButton       = document.getElementById('addButton');
const errorMessage    = document.getElementById('errorMessage');
const todoList        = document.getElementById('todoList');
const emptyState      = document.getElementById('emptyState');
const emptyMessage    = document.getElementById('emptyMessage');
const completedCount  = document.getElementById('completedCount');
const totalCount      = document.getElementById('totalCount');
const filterTabs      = document.querySelectorAll('.filter-tab');
const prevDateBtn     = document.getElementById('prevDateBtn');
const nextDateBtn     = document.getElementById('nextDateBtn');
const dateLabel       = document.getElementById('dateLabel');
const todayBadge      = document.getElementById('todayBadge');
const prevWeekBtn     = document.getElementById('prevWeekBtn');    // 이전 주 버튼
const nextWeekBtn     = document.getElementById('nextWeekBtn');    // 다음 주 버튼
const weekRangeLabel  = document.getElementById('weekRangeLabel'); // 주차 범위 텍스트
const weekDaysEl      = document.getElementById('weekDays');       // 날짜 셀 컨테이너

// ── 상태 (State) ────────────────────────────────────────
/**
 * todos: Todo 항목 배열
 * {
 *   id: number,
 *   text: string,
 *   completed: boolean,
 *   date: string  // 'YYYY-MM-DD'
 * }
 */
let todos = [];

/**
 * currentFilter: 현재 선택된 필터
 * 'all' | 'active' | 'completed'
 */
let currentFilter = 'all';

/**
 * selectedDate: 현재 선택된 날짜 (Date 객체)
 */
let selectedDate = new Date();

/**
 * weekOffset: 현재 보고 있는 주차 오프셋
 * 0 = 이번 주, -1 = 지난 주, +1 = 다음 주
 */
let weekOffset = 0;

// ── 로컬스토리지 함수 ────────────────────────────────────

/**
 * todos 배열 전체를 로컬스토리지에 저장
 * JSON.stringify로 배열 → 문자열 변환
 */
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

/**
 * 로컬스토리지에서 todos 데이터를 불러와 복원
 * JSON.parse로 문자열 → 배열 변환
 * 페이지 최초 로드 시 한 번만 호출
 */
function loadTodos() {
  const saved = localStorage.getItem('todos');

  // 저장된 데이터가 있을 때만 파싱 (없으면 null 반환)
  if (saved) {
    todos = JSON.parse(saved);
    // 불러온 todos를 전부 DOM에 렌더링 (저장된 순서 그대로)
    todos.forEach(todo => renderTodoItem(todo, false));
  }
}

// ── 날짜 유틸리티 함수 ───────────────────────────────────

/**
 * Date 객체를 'YYYY-MM-DD' 문자열로 변환
 * @param {Date} date
 * @returns {string}
 */
function formatDateKey(date) {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const day   = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Date 객체를 화면 표시용 문자열로 변환
 * 예: '2025년 6월 3일 (화)'
 * @param {Date} date
 * @returns {string}
 */
function formatDateDisplay(date) {
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const year  = date.getFullYear();
  const month = date.getMonth() + 1;
  const day   = date.getDate();
  const dow   = dayNames[date.getDay()]; // 요일 (0=일 ~ 6=토)
  return `${year}년 ${month}월 ${day}일 (${dow})`;
}

/**
 * 두 Date 객체가 같은 날짜인지 비교 (시간 무시)
 * @param {Date} a
 * @param {Date} b
 * @returns {boolean}
 */
function isSameDay(a, b) {
  return formatDateKey(a) === formatDateKey(b);
}

/**
 * 날짜 네비게이터 UI 업데이트
 */
function updateDateNavigator() {
  dateLabel.textContent = formatDateDisplay(selectedDate);

  if (isSameDay(selectedDate, new Date())) {
    todayBadge.classList.remove('hidden');
  } else {
    todayBadge.classList.add('hidden');
  }
}

// ── 주간 뷰 함수 ─────────────────────────────────────────

/**
 * 기준 날짜가 속한 주의 월요일 Date 객체를 반환
 * - JS의 getDay(): 0=일, 1=월 ... 6=토
 * - 월요일 기준으로 맞추려면: (요일 + 6) % 7 로 월요일로부터의 거리를 구함
 * @param {Date} date
 * @returns {Date} 해당 주 월요일
 */
function getMonday(date) {
  const d      = new Date(date);
  const day    = d.getDay();
  const diff   = (day + 6) % 7; // 월요일로부터 며칠 뒤인지
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 주간 뷰 전체를 렌더링
 * - weekOffset에 따라 기준 주의 월요일을 계산
 * - 월~일 7개 셀을 동적으로 생성
 */
function renderWeekView() {
  // 오늘 기준으로 weekOffset 주만큼 이동한 날의 월요일 계산
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const monday = getMonday(baseDate);

  // 주차 범위 텍스트 업데이트 (예: 2025.6.2 ~ 2025.6.8)
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  weekRangeLabel.textContent =
    `${monday.getFullYear()}.${monday.getMonth() + 1}.${monday.getDate()}` +
    ` ~ ` +
    `${sunday.getFullYear()}.${sunday.getMonth() + 1}.${sunday.getDate()}`;

  // 기존 셀 초기화
  weekDaysEl.innerHTML = '';

  const dayNames  = ['월', '화', '수', '목', '금', '토', '일'];
  const todayKey  = formatDateKey(new Date());
  const selectedKey = formatDateKey(selectedDate);

  // 월(0) ~ 일(6) 셀 7개 생성
  for (let i = 0; i < 7; i++) {
    const cellDate = new Date(monday);
    cellDate.setDate(monday.getDate() + i);
    const cellKey = formatDateKey(cellDate);

    // 해당 날짜의 Todo 개수 계산
    const count = todos.filter(t => t.date === cellKey).length;

    const cell = document.createElement('div');
    cell.classList.add('week-day-cell');
    cell.dataset.dateKey = cellKey; // 클릭 시 날짜 식별용

    // 오늘 날짜 강조 클래스
    if (cellKey === todayKey)    cell.classList.add('is-today');
    // 현재 선택된 날짜 강조 클래스
    if (cellKey === selectedKey) cell.classList.add('is-selected');

    cell.innerHTML = `
      <span class="week-day-name">${dayNames[i]}</span>
      <span class="week-day-num">${cellDate.getDate()}</span>
      <span class="week-day-count ${count > 0 ? 'has-todos' : ''}">${count > 0 ? count : ''}</span>
    `;

    // 셀 클릭 → 해당 날짜로 이동
    cell.addEventListener('click', () => {
      selectedDate = new Date(cellDate);
      updateDateNavigator();
      renderWeekView();  // 선택 표시 갱신
      applyFilter();
      updateCount();
    });

    weekDaysEl.appendChild(cell);
  }
}

/**
 * 주간 뷰의 Todo 개수 뱃지만 갱신
 * - Todo 추가/삭제/완료 시 전체 재렌더링 없이 개수만 업데이트
 */
function updateWeekCounts() {
  const cells = weekDaysEl.querySelectorAll('.week-day-cell');
  cells.forEach(cell => {
    const key   = cell.dataset.dateKey;
    const count = todos.filter(t => t.date === key).length;
    const badge = cell.querySelector('.week-day-count');
    badge.textContent = count > 0 ? count : '';
    badge.classList.toggle('has-todos', count > 0);
  });
}

// ── 유틸리티 함수 ────────────────────────────────────────

/* Date.now() = 숫자 반환, 문자와 더하지 말 것 */
function generateId() {
  return Date.now();
}

function showErrorMessage() {
  errorMessage.classList.remove('hidden');
  setTimeout(() => {
    errorMessage.classList.add('hidden');
  }, 2500);
}

/* completed가 true인 todo들을 filter로 걸렀을 때의 개수 */
function updateCount() {
  const selectedKey = formatDateKey(selectedDate);
  const todayTodos  = todos.filter(t => t.date === selectedKey);
  const total       = todayTodos.length;
  const completed   = todayTodos.filter(t => t.completed).length;
  totalCount.textContent     = total;
  completedCount.textContent = completed;
}

/**
 * 빈 상태 안내 표시 여부 토글
 */
function toggleEmptyState() {
  const selectedKey = formatDateKey(selectedDate);

  const visibleCount = todos.filter(todo => {
    if (todo.date !== selectedKey) return false;
    if (currentFilter === 'all')       return true;
    if (currentFilter === 'active')    return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
  }).length;

  if (visibleCount === 0) {
    emptyState.classList.remove('hidden');
    if (currentFilter === 'all') {
      emptyMessage.innerHTML = '이 날의 할 일이 없어요.<br />새로운 Todo를 추가해 보세요.';
    } else if (currentFilter === 'active') {
      emptyMessage.innerHTML = '진행 중인 할 일이 없어요.';
    } else if (currentFilter === 'completed') {
      emptyMessage.innerHTML = '완료된 할 일이 없어요.';
    }
  } else {
    emptyState.classList.add('hidden');
  }
}

/**
 * XSS 방지를 위한 HTML 특수문자 이스케이프
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── 필터 + 날짜 적용 함수 ────────────────────────────────

/**
 * 현재 선택된 날짜 + 필터 기준으로 각 항목 show/hide
 */
function applyFilter() {
  const selectedKey = formatDateKey(selectedDate);
  const allItems    = todoList.querySelectorAll('.todo-item');

  allItems.forEach(li => {
    const id   = Number(li.dataset.id);
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const matchesDate   = todo.date === selectedKey;
    const matchesFilter =
      currentFilter === 'all' ||
      (currentFilter === 'active'    && !todo.completed) ||
      (currentFilter === 'completed' && todo.completed);

    li.classList.toggle('hidden-by-filter', !(matchesDate && matchesFilter));
  });

  toggleEmptyState();
}

// ── 날짜 이동 함수 ────────────────────────────────────────

/**
 * 일간 뷰 날짜를 offset만큼 이동
 * - 날짜가 현재 주간 뷰 범위를 벗어나면 weekOffset도 자동 조정
 * @param {number} offset
 */
function moveDate(offset) {
  selectedDate.setDate(selectedDate.getDate() + offset);

  // 선택 날짜가 현재 주간 뷰 범위를 벗어났는지 확인 후 주간 뷰 동기화
  syncWeekToSelectedDate();

  updateDateNavigator();
  renderWeekView();
  applyFilter();
  updateCount();
}

/**
 * selectedDate에 맞게 weekOffset을 조정
 * - 일간 뷰에서 날짜를 넘겼을 때 주간 뷰도 따라오게 함
 */
function syncWeekToSelectedDate() {
  const baseDate = new Date();
  const thisMonday    = getMonday(baseDate);
  const selectedMonday = getMonday(selectedDate);

  // 두 월요일의 날짜 차이를 일(day) 단위로 계산 → 주(week) 단위로 변환
  const diffDays  = Math.round((selectedMonday - thisMonday) / (1000 * 60 * 60 * 24));
  weekOffset = Math.round(diffDays / 7);
}

// ── 핵심 CRUD 함수 ────────────────────────────────────────

/**
 * [CREATE] 새로운 Todo 추가
 */
function addTodo() {
  const inputText = todoInput.value.trim();

  if (inputText === '') {
    showErrorMessage();
    todoInput.focus();
    return;
  }

  const newTodo = {
    id: generateId(),
    text: inputText,
    completed: false,
    date: formatDateKey(selectedDate) // 선택된 날짜 저장
  };

  todos.unshift(newTodo);
  renderTodoItem(newTodo, true);

  todoInput.value = '';
  todoInput.focus();

  saveTodos();       // 저장
  updateCount();
  updateWeekCounts(); // 주간 뷰 개수 갱신
  applyFilter();
}

/* @param {} 안에 적힌 타입을 받는 변수임을 알려주는 가이드라인 */
/**
 * [READ] Todo 항목 하나를 DOM에 렌더링
 * @param {object}  todo
 * @param {boolean} prepend
 */
function renderTodoItem(todo, prepend = false) {
  const li = document.createElement('li');
  li.classList.add('todo-item');
  li.dataset.id = todo.id;

  if (todo.completed) li.classList.add('completed');

  li.innerHTML = `
    <div class="todo-checkbox ${todo.completed ? 'checked' : ''}"
        role="checkbox"
        aria-checked="${todo.completed}"
        title="완료 토글">
    </div>
    <span class="todo-text">${escapeHtml(todo.text)}</span>
    <div class="todo-actions">
      <button class="action-btn edit-btn"     title="수정">수정</button>
      <button class="action-btn complete-btn" title="완료 토글">완료</button>
      <button class="action-btn delete-btn"   title="삭제">삭제</button>
    </div>
  `;

  bindTodoItemEvents(li, todo.id);

  if (prepend) {
    todoList.prepend(li);
  } else {
    todoList.appendChild(li);
  }
}

/**
 * Todo 항목 DOM 요소에 이벤트 리스너 바인딩
 * @param {HTMLElement} li
 * @param {number}      id
 */
function bindTodoItemEvents(li, id) {
  /* querySelector - 변수 훔쳐오기 */
  const checkbox    = li.querySelector('.todo-checkbox');
  const completeBtn = li.querySelector('.complete-btn');
  const deleteBtn   = li.querySelector('.delete-btn');
  const editBtn = li.querySelector('.edit-btn');

  checkbox.addEventListener('click',    () => toggleComplete(id));
  completeBtn.addEventListener('click', () => toggleComplete(id));
  deleteBtn.addEventListener('click',   () => deleteTodo(id, li));
  editBtn.addEventListener('click', () => enterEditMode(li, id));
}

// /* 수정 버튼에 이벤트 추가 */ (필요없는 로직, 일단 주석 처리)
// function attachEditButton(li, id) {
//   const editBtn = li.querySelector('.edit-btn');
//   if (!editBtn) return;
//   editBtn.addEventListener('click', () => enterEditMode(li, id));
// }

/**
 * [UPDATE - 완료 토글]
 * @param {number} id
 */
function toggleComplete(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  todo.completed = !todo.completed;

  const li       = todoList.querySelector(`[data-id="${id}"]`);
  const checkbox = li.querySelector('.todo-checkbox');

  li.classList.toggle('completed', todo.completed);
  checkbox.classList.toggle('checked', todo.completed);
  checkbox.setAttribute('aria-checked', todo.completed);

  saveTodos(); // 완료 상태 변경 후 저장
  updateCount();
  applyFilter();
}

/**
 * [UPDATE - 수정 모드 진입]
 * @param {HTMLElement} li
 * @param {number}      id
 */
function enterEditMode(li, id) {
  const textSpan = li.querySelector('.todo-text');
  const editBtn  = li.querySelector('.edit-btn');

  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  const editInput = document.createElement('input');
  editInput.type      = 'text';
  editInput.value     = todo.text;
  editInput.className = 'todo-edit-input';
  editInput.maxLength = 100;
  textSpan.replaceWith(editInput);
  editInput.focus();
  editInput.setSelectionRange(editInput.value.length, editInput.value.length);

  editBtn.textContent = '수정';
  editBtn.className   = 'action-btn save-btn';
  editBtn.title       = '저장';

  editBtn.replaceWith(editBtn.cloneNode(true));
  const newSaveBtn  = li.querySelector('.save-btn');
  const saveHandler = () => saveEdit(li, id, editInput, newSaveBtn);
  newSaveBtn.addEventListener('click', saveHandler);

  const keyHandler = (e) => {
    if (e.key === 'Enter') {
      editInput.removeEventListener('keydown', keyHandler);
      saveHandler();
    }
    if (e.key === 'Escape') {
      editInput.removeEventListener('keydown', keyHandler);
      cancelEdit(id, li, editInput, newSaveBtn);
    }
  };
  editInput.addEventListener('keydown', keyHandler);
}

/**
 * [UPDATE - 저장]
 * - 빈 값이면 저장하지 않고 오류 메시지 표시
 * @param {HTMLElement} li
 * @param {number}      id
 * @param {HTMLElement} editInput
 * @param {HTMLElement} saveBtn
 */
function saveEdit(li, id, editInput, saveBtn) {
  const newText = editInput.value.trim();

  // 빈 값이면 저장 거부 + 오류 메시지 표시 (추가할 때와 동일한 제한)
  if (newText === '') {
    showErrorMessage();
    editInput.focus();
    return;
  }

  const todo = todos.find(t => t.id === id);
  if (todo) todo.text = newText;

  const textSpan = document.createElement('span');
  textSpan.className   = 'todo-text';
  textSpan.textContent = newText;
  editInput.replaceWith(textSpan);

  saveBtn.textContent = '수정';
  saveBtn.className   = 'action-btn edit-btn';
  saveBtn.title       = '수정';

  saveBtn.replaceWith(saveBtn.cloneNode(true));
  enterEditMode(li, id)

  saveTodos(); // 수정 내용 저장
}

/**
 * [UPDATE - 취소]
 * @param {number}      id
 * @param {HTMLElement} li
 * @param {HTMLElement} editInput
 * @param {HTMLElement} saveBtn
 */
function cancelEdit(id, li, editInput, saveBtn) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  const textSpan = document.createElement('span');
  textSpan.className   = 'todo-text';
  textSpan.textContent = todo.text;
  editInput.replaceWith(textSpan);

  saveBtn.textContent = '수정';
  saveBtn.className   = 'action-btn edit-btn';
  saveBtn.title       = '수정';

  saveBtn.replaceWith(saveBtn.cloneNode(true));
  enterEditMode(li, id)
  // 취소는 데이터 변경이 없으므로 saveTodos() 호출 불필요
}

/**
 * [DELETE]
 * @param {number}      id
 * @param {HTMLElement} li
 */
function deleteTodo(id, li) {
  todos = todos.filter(t => t.id !== id);

  saveTodos();       // 삭제 후 저장
  updateCount();
  updateWeekCounts(); // 주간 뷰 개수 갱신

  li.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
  li.style.opacity    = '0';
  li.style.transform  = 'translateX(8px)';
  setTimeout(() => {
    li.remove();
    toggleEmptyState();
  }, 180);
}

// ── 필터 탭 이벤트 등록 ──────────────────────────────────

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    currentFilter = tab.dataset.filter;
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    applyFilter();
  });
});

// ── 날짜 네비게이터 이벤트 등록 ──────────────────────────

prevDateBtn.addEventListener('click', () => moveDate(-1));
nextDateBtn.addEventListener('click', () => moveDate(+1));

// ── 주간 뷰 이벤트 등록 ──────────────────────────────────

prevWeekBtn.addEventListener('click', () => {
  weekOffset--;
  renderWeekView();
});

nextWeekBtn.addEventListener('click', () => {
  weekOffset++;
  renderWeekView();
});

// ── 이벤트 리스너 등록 ────────────────────────────────────

addButton.addEventListener('click', addTodo);

todoInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

todoInput.addEventListener('input', () => {
  if (todoInput.value.trim() !== '') {
    errorMessage.classList.add('hidden');
  }
});

// ── 초기 렌더링 ──────────────────────────────────────────
updateDateNavigator();
loadTodos();     // 로컬스토리지 복원
renderWeekView(); // 주간 뷰 초기 렌더링 (loadTodos 이후 → 개수 표시 정확)
applyFilter();
updateCount();