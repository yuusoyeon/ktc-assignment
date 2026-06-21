# Troubleshooting

## 1. Todo 수정 페이지 이동 시 404 Error 발생

### 문제 상황

Todo 목록에서 수정 버튼을 클릭해 `/todos/[todoId]` 페이지로 이동하면 404 Error가 발생했다.

기존 코드는 다음과 같은 형태였다.

```tsx
export default async function TodoEditPage({ params }: TodoEditPageProps) {
  let todo;

  try {
    todo = await getTodo(params.todoId);
  } catch {
    notFound();
  }
}
```

### 원인
Next.js 15부터 params, searchParams가 비동기적으로 처리되는 구조로 변경되었다.
따라서 기존처럼 params.todoId에 바로 접근하면 정상적으로 값을 읽지 못해 Todo 상세 조회가 실패했고, 결과적으로 notFound()가 실행되었다.

### 해결 방법
params를 await한 뒤 todoId를 꺼내 사용하도록 수정했다.
```tsx
type TodoEditPageProps = {
  params: Promise<{
    todoId: string;
  }>;
};
export default async function TodoEditPage({ params }: TodoEditPageProps) {
  const { todoId } = await params;

  let todo;

  try {
    todo = await getTodo(todoId);
  } catch {
    notFound();
  }

  return (
    // ...
  );
}
```

### 결과
Todo 수정 페이지에서 todoId를 정상적으로 읽을 수 있게 되었고, Todo 상세 데이터를 조회한 뒤 수정 화면이 정상 렌더링되었다.

## 2. URL 쿼리는 변경되지만 화면 데이터가 바뀌지 않음
### 문제 상황
필터 탭, 검색, 날짜 선택 등을 클릭하면 주소창의 query string은 변경되었다.

예시:
```txt
/todos?date=2026-06-19
/todos?date=2026-06-19&status=active
/todos?date=2026-06-19&q=운동
```
하지만 실제 화면의 Todo 목록이나 달력 상태는 변경되지 않았다.
### 원인
이 문제 역시 Next.js 15의 searchParams 비동기 처리 방식과 관련이 있었다.
기존 코드에서는 searchParams를 동기 객체처럼 바로 사용하고 있었다.
```tsx 
export default async function TodosPage({ searchParams }: TodosPageProps) {
  const selectedDate = searchParams?.date ?? formatDateKey(new Date());
  const status = normalizeStatus(searchParams?.status);
  const q = searchParams?.q?.trim() || undefined;
}
```
Next.js 15 환경에서는 searchParams를 await해서 값을 꺼내야 했기 때문에, 화면 렌더링에 필요한 query 값이 제대로 반영되지 않았다.

### 해결 방법
searchParams 타입을 Promise로 변경하고, 페이지 컴포넌트 내부에서 await 처리했다.
```tsx
type TodosPageProps = {
  searchParams: Promise<{
    date?: string;
    week?: string;
    status?: string;
    q?: string;
  }>;
};

export default async function TodosPage({ searchParams }: TodosPageProps) {
  const params = await searchParams;

  const today = formatDateKey(new Date());
  const selectedDate = params.date ?? today;
  const calendarBaseDate = params.week ?? selectedDate;
  const status = normalizeStatus(params.status);
  const q = params.q?.trim() || undefined;

  // ...
}
```

### 결과
URL query string 변경 시 서버 컴포넌트가 query 값을 정상적으로 읽게 되었고, 필터링된 Todo 목록과 달력 상태가 화면에 반영되었다.

## 3. 이전 주 / 다음 주 버튼 클릭 시 Todo 데이터까지 같이 변경됨
### 문제 상황
주간 달력의 이전 주 ‹, 다음 주 › 버튼을 클릭하면 달력만 이동해야 했다.
하지만 기존 구현에서는 버튼 클릭 시 date query가 변경되었다.

예시:
```txt
/todos?date=2026-06-12
/todos?date=2026-06-26
```

그 결과 하단 Todo 목록도 해당 날짜 기준으로 필터링되었다.
원하는 동작은 다음과 같았다.

```txt
이전/다음 주 버튼 클릭
→ 달력에 표시되는 주차만 변경

날짜 직접 클릭
→ date query 변경
→ Todo 목록 필터링
```

### 원인
기존에는 주간 이동과 날짜 선택이 모두 같은 href 생성 함수인 createTodoHref를 사용하고 있었다.
즉, 주간 이동 버튼도 date query를 변경하고 있었다.

```tsx
function createTodoHref({ date, status, q }) {
  const params = new URLSearchParams();

  params.set("date", date);

  // ...
}
```

이 때문에 사용자가 주간 이동 버튼만 눌러도 Todo 데이터 조회 기준인 date가 바뀌었다.

### 해결 방법
달력 표시 기준과 Todo 데이터 조회 기준을 분리했다.
- `date`: Todo 목록 필터링 기준
- `week`: 주간 달력 표시 기준
기존 createTodoHref 함수를 목적에 따라 두 개로 나누었다.

```tsx
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
```
```tsx
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
```
그리고 페이지에서는 Todo 데이터 조회 기준과 달력 표시 기준을 분리했다.
```tsx
const today = formatDateKey(new Date());

const selectedDate = params.date ?? today;
const calendarBaseDate = params.week ?? selectedDate;
```
### 결과
이전/다음 주 버튼은 week query만 변경하게 되었고, Todo 목록은 기존 date 기준을 유지하게 되었다.
날짜 셀을 직접 클릭했을 때만 date query가 변경되어 해당 날짜의 Todo 목록이 조회되었다.
최종 동작은 다음과 같다.
```txt
/todos
→ Todo 목록: 오늘 날짜
→ 달력: 오늘이 포함된 주

/todos?week=2026-06-22
→ Todo 목록: 오늘 날짜
→ 달력: 2026-06-22가 포함된 주

/todos?date=2026-06-25
→ Todo 목록: 2026-06-25
→ 달력: 2026-06-25가 포함된 주
```

### 정리
이번 트러블슈팅의 핵심은 다음과 같다.
1. Next.js 15에서는 params, searchParams를 비동기 값으로 다뤄야 한다.
2. URL query가 변경되어도 서버 컴포넌트에서 이를 제대로 await하지 않으면 화면 데이터가 갱신되지 않는다.
3. 달력 표시용 상태와 Todo 조회용 상태를 같은 date query로 관리하면 의도하지 않은 데이터 필터링이 발생한다.
4. 주간 이동은 week, 날짜 선택은 date로 분리하면 역할이 명확해진다.
