/* ==============================
  Todo 앱 - app.js
  기본 CRUD + 필터 + 일간 뷰 기능
   ============================== */

// ── DOM 요소 참조 ───────────────────────────────────────
const todoInput      = document.getElementById('todoInput');
const addButton      = document.getElementById('addButton');
const errorMessage   = document.getElementById('errorMessage');
const todoList       = document.getElementById('todoList');
const emptyState     = document.getElementById('emptyState');
const emptyMessage   = document.getElementById('emptyMessage');
const completedCount = document.getElementById('completedCount');
const totalCount     = document.getElementById('totalCount');
const filterTabs     = document.querySelectorAll('.filter-tab');
const prevDateBtn    = document.getElementById('prevDateBtn');   // 이전 날짜 버튼
const nextDateBtn    = document.getElementById('nextDateBtn');   // 다음 날짜 버튼
const dateLabel      = document.getElementById('dateLabel');     // 날짜 텍스트
const todayBadge     = document.getElementById('todayBadge');    // '오늘' 뱃지

// ── 상태 (State) ────────────────────────────────────────
/**
 * todos: Todo 항목 배열
 * {
 *   id: number,
 *   text: string,
 *   completed: boolean,
 *   date: string  // 'YYYY-MM-DD' 형식으로 저장 
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
 * 처음엔 오늘 날짜로 초기화
 */
let selectedDate = new Date();

// ── 날짜 유틸리티 함수 ───────────────────────────────────

/**
 * Date 객체를 'YYYY-MM-DD' 문자열로 변환
 * - Todo의 date 필드에 저장할 때 사용
 * @param {Date} date
 * @returns {string} 'YYYY-MM-DD'
 */
function formatDateKey(date) {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const day   = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Date 객체를 화면에 표시할 형식으로 변환
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
 * - 날짜 텍스트 갱신
 * - 오늘이면 '오늘' 뱃지 표시
 */
function updateDateNavigator() {
  dateLabel.textContent = formatDateDisplay(selectedDate);

  if (isSameDay(selectedDate, new Date())) {
    todayBadge.classList.remove('hidden');
  } else {
    todayBadge.classList.add('hidden');
  }
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

/**
 * 헤더 카운트 업데이트
 * - 선택된 날짜 기준으로만 집계
 */
function updateCount() {
  const selectedKey     = formatDateKey(selectedDate);
  const todayTodos      = todos.filter(t => t.date === selectedKey);
  const total           = todayTodos.length;
  const completed       = todayTodos.filter(t => t.completed).length;
  totalCount.textContent     = total;
  completedCount.textContent = completed;
}

/**
 * 빈 상태 안내 표시 여부 토글
 * - 선택된 날짜 + 현재 필터 기준으로 보이는 항목이 없을 때 표시
 */
function toggleEmptyState() {
  const selectedKey = formatDateKey(selectedDate);

  const visibleCount = todos.filter(todo => {
    if (todo.date !== selectedKey) return false; // 날짜 먼저 필터
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
 * - 날짜가 다르거나 필터 조건에 안 맞으면 숨김
 */
function applyFilter() {
  const selectedKey = formatDateKey(selectedDate);
  const allItems    = todoList.querySelectorAll('.todo-item');

  allItems.forEach(li => {
    const id   = Number(li.dataset.id);
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // 날짜 조건 + 상태 필터 조건 둘 다 만족해야 표시
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
 * 날짜를 offset만큼 이동 (이전: -1, 다음: +1)
 * @param {number} offset - 이동할 일수
 */
function moveDate(offset) {
  selectedDate.setDate(selectedDate.getDate() + offset);
  updateDateNavigator();
  applyFilter();
  updateCount();
}

// ── 핵심 CRUD 함수 ────────────────────────────────────────

/**
 * [CREATE] 새로운 Todo 추가
 * - 현재 선택된 날짜를 date 필드에 함께 저장
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

  updateCount();
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

  checkbox.addEventListener('click',    () => toggleComplete(id));
  completeBtn.addEventListener('click', () => toggleComplete(id));
  deleteBtn.addEventListener('click',   () => deleteTodo(id, li));

  attachEditButton(li, id);
}

/* 수정 버튼에 이벤트 추가 */
function attachEditButton(li, id) {
  const editBtn = li.querySelector('.edit-btn');
  if (!editBtn) return;
  editBtn.addEventListener('click', () => enterEditMode(li, id));
}

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
 * @param {HTMLElement} li
 * @param {number}      id
 * @param {HTMLElement} editInput
 * @param {HTMLElement} saveBtn
 */
function saveEdit(li, id, editInput, saveBtn) {
  const newText = editInput.value.trim();
  if (newText === '') {
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
  attachEditButton(li, id);
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
  attachEditButton(li, id);
}

/**
 * [DELETE]
 * @param {number}      id
 * @param {HTMLElement} li
 */
function deleteTodo(id, li) {
  todos = todos.filter(t => t.id !== id);

  li.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
  li.style.opacity    = '0';
  li.style.transform  = 'translateX(8px)';
  setTimeout(() => {
    li.remove();
    toggleEmptyState();
  }, 180);

  updateCount();
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

prevDateBtn.addEventListener('click', () => moveDate(-1)); // 하루 이전
nextDateBtn.addEventListener('click', () => moveDate(+1)); // 하루 다음

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
updateDateNavigator(); // 오늘 날짜로 네비게이터 초기화
toggleEmptyState();
updateCount();