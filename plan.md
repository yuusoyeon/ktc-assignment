# Next.js + FastAPI Todo 마이그레이션 plan.md

## Summary

기존 React + localStorage 기반 Todo 앱을 Next.js + FastAPI 풀스택 구조로 마이그레이션한다.

Frontend는 Next.js App Router와 Server Actions를 중심으로 화면, 라우팅, CRUD 요청을 처리한다. Backend는 FastAPI와 SQLite를 사용해 Todo 데이터를 영구 저장한다.

기존 localStorage 데이터 관리는 제거하고, 모든 Todo 데이터는 FastAPI API와 SQLite DB를 통해 관리한다.

## Tech Stack

### Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- Server Actions
- API Route proxy

### Backend

- FastAPI
- SQLite
- SQLAlchemy
- Pydantic

### Environment

- Frontend `.env.local`
- BACKEND_URL=`http://localhost:8000`
- Backend `.env.local`
  - DATABASE_URL=`sqlite:///./todos.db`

### Architecture
```env
todo-nextJs-FastAPI/
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   └── todos/
│   │   │       └── route.ts
│   │   ├── todos/
│   │   │   ├── [todoId]/
│   │   │   │   └── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   ├── error.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── actions.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.tsx
│   │   │   └── PageShell.tsx
│   │   └── todos/
│   │       ├── WeekCalendar.tsx
│   │       ├── WeekCalendarDay.tsx
│   │       ├── TodoToolbar.tsx
│   │       ├── SearchForm.tsx
│   │       ├── FilterTabs.tsx
│   │       ├── TodoList.tsx
│   │       ├── TodoItem.tsx
│   │       ├── TodoEmptyState.tsx
│   │       ├── TodoCreateForm.tsx
│   │       ├── TodoEditForm.tsx
│   │       └── TodoSubmitButton.tsx
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── date.ts
│   │   └── types.ts
│   │
│   ├── .env.local
│   ├── package.json
│   └── ...
│
└── backend/
    ├── main.py
    ├── requirements.txt
    └── .env.local
```

### Backend Plan
`backend/main.py` 안에 FastAPI 앱, DB 연결, SQLAlchemy 모델, Pydantic 스키마, CRUD 라우터를 모두 구현한다.

### Todo Model
```py
id: int
text: str
completed: bool
date: str
created_at: datetime
updated_at: datetime
```

### API Endpoints
```text
GET    /todos
GET    /todos/{todo_id}
POST   /todos
PATCH  /todos/{todo_id}
DELETE /todos/{todo_id}
```

### Query Parameters
```text
date=YYYY-MM-DD
status=all | active | completed
q=검색어
```

### Backend Rules
- q가 없으면 선택 날짜 기준으로 Todo를 조회한다.
- q가 있으면 전체 Todo에서 검색한다.
- status는 날짜 조회와 검색 조회 모두에 적용한다.
- Todo 목록은 created_at DESC 기준으로 정렬한다.
- 존재하지 않는 Todo 조회, 수정, 삭제 요청은 404를 반환한다.
- 빈 Todo 텍스트 생성/수정 요청은 400 또는 validation error를 반환한다.

### Frontend Plan
Next.js App Router 기반으로 페이지를 구성하되, `page.tsx`는 데이터 조회와 컴포넌트 조립만 담당한다. UI 로직은 `components/`, API 요청과 타입/날짜 유틸은 `lib/`로 분리한다.

### Page Responsibilities

`app/todos/page.tsx`

- URL `searchParams`에서 `date`, `status`, `q`를 읽는다.
- `getTodos({ date, status, q })`로 Todo 목록을 조회한다.
- 날짜별 Todo 개수 계산에 필요한 데이터를 조회하거나 전달한다.
- `PageShell`, `AppHeader`, `WeekCalendar`, `TodoToolbar`, `TodoList`를 조립한다.

`app/todos/new/page.tsx`

- URL `searchParams`에서 기본 날짜를 읽는다.
- `TodoCreateForm`을 렌더링한다.
- 생성 로직 자체는 `actions.ts`의 `createTodo`에 위임한다.

`app/todos/[todoId]/page.tsx`

- `todoId`로 Todo 상세 데이터를 조회한다.
- `TodoEditForm`을 렌더링한다.
- 수정 로직 자체는 `actions.ts`의 `updateTodo`에 위임한다.

### Component Responsibilities

- `PageShell`: 전체 페이지 배경, 최대 너비, 공통 여백
- `AppHeader`: 앱 제목, 완료 개수 / 전체 개수 표시
- `WeekCalendar`: 주간 날짜 계산, 이전/다음 주 이동, 날짜 선택 링크 생성
- `WeekCalendarDay`: 날짜 한 칸 UI, 오늘/선택/기본 상태 스타일
- `TodoToolbar`: 검색 폼과 상태 필터 탭 조립
- `SearchForm`: 검색어 입력, 빈 검색어 에러 처리
- `FilterTabs`: 전체 / 진행 중 / 완료 탭과 URL query 링크 생성
- `TodoList`: 목록 또는 빈 상태 렌더링
- `TodoItem`: 완료 토글, 수정 링크, 삭제 액션
- `TodoEmptyState`: 조건별 빈 상태 문구 표시
- `TodoCreateForm`: Todo 생성 폼
- `TodoEditForm`: Todo 수정 폼
- `TodoSubmitButton`: form 제출 중 상태 표시

### Shared Lib Responsibilities

- `lib/api.ts`: FastAPI fetch wrapper와 Todo API 요청 함수
- `lib/date.ts`: `formatDateKey`, `getMonday`, `getWeekDates`, 주차 이동 유틸
- `lib/types.ts`: `Todo`, `TodoStatus`, API 요청/응답 타입

### Routes
```text
/todos             Todo 목록 페이지
/todos/new         Todo 생성 페이지
/todos/[todoId]    Todo 수정 페이지
루트 페이지 /는 /todos로 이동시킨다.
```

### Server Actions
`frontend/app/actions.ts`에 다음 함수를 구현한다.
```ts
getTodos({ date, status, q })
getTodo(todoId)
createTodo(formData)
updateTodo(todoId, formData)
deleteTodo(todoId)
toggleTodo(todoId, completed)
```

### Server Action Rules
- 모든 Server Action은 `BACKEND_URL`을 통해 FastAPI를 호출한다.
- 생성, 수정, 삭제, 완료 토글 후 `revalidatePath("/todos")`를 호출한다.
- 생성과 수정 성공 후 /todos로 redirect한다.
- Backend 응답이 실패하면 사용자에게 표시 가능한 에러를 반환하거나 throw한다.

### API Route Proxy
`frontend/app/api/todos/route.ts`는 FastAPI `/todos`에 대한 프록시로 둔다.
- 기본 CRUD는 Server Actions 중심으로 처리한다.
- 클라이언트 컴포넌트에서 fetch가 필요한 검색/동적 갱신이 생길 경우 보조적으로 사용한다.

### Page Behavior

#### `/todos`
Todo 목록 메인 페이지다.

표시 항목:

- Header
- 주간 달력
- Todo 생성 페이지 이동 버튼
- 검색 입력창
- 전체 / 진행 중 / 완료 필터 탭
- Todo 목록
- 빈 상태 문구

동작:
- 선택된 날짜의 Todo를 조회한다.
- 날짜는 URL searchParams로 관리한다.
- 상태 필터도 URL searchParams로 관리한다.
- 검색어가 있으면 전체 Todo에서 검색한다.
- 검색어가 있을 때도 상태 필터는 함께 적용한다.
- Todo는 최근 생성 순으로 표시한다.
- 완료 버튼을 누르면 완료 상태가 토글된다.
- 수정 버튼을 누르면 `/todos/[todoId]`로 이동한다.
- 삭제 버튼을 누르면 Todo가 삭제된다.

#### `/todos/new`
Todo 생성 페이지다.

표시 항목:
- Todo 입력창
- 날짜 입력값 또는 숨겨진 date 값
- 저장 버튼
- 취소 버튼
  
동작:
- 목록 페이지에서 전달된 날짜를 기본값으로 사용한다.
- 할 일을 입력하고 저장하면 Todo를 생성한다.
- Enter 입력으로도 저장 가능하게 한다.
- 빈 값이면 "할 일을 입력해 주세요."를 표시한다.
- 생성 성공 시 `/todos`로 이동한다.
  
#### `/todos/[todoId]`
Todo 수정 페이지다.

표시 항목:
- 기존 Todo 텍스트가 들어간 입력창
- 저장 버튼
- 취소 버튼
  
동작:
- 페이지 진입 시 Todo 상세 데이터를 조회한다.
- 저장하면 Todo 텍스트를 수정한다.
- Enter 입력으로도 저장 가능하게 한다.
- 취소하면 /todos로 이동한다.
- 빈 값이면 "할 일을 입력해 주세요."를 표시한다.
- 존재하지 않는 Todo면 Next.js error 화면 또는 not-found 처리를 한다.

### UI Rules
기존 React Todo 앱의 카드형 디자인을 Tailwind CSS로 유지한다.
- 전체 배경은 밝은 보라 계열을 사용한다.
- Header, WeekList, FilterTabs, TodoList는 카드형 UI로 구성한다.
- Primary color는 `#672be0`을 기준으로 한다.
- Border color는 `#e4dfef`를 기준으로 한다.
- 완료된 Todo는 취소선과 완료 색상을 적용한다.
- 오늘 날짜와 선택된 날짜는 주간 달력에서 서로 구분되게 표시한다.
- 삭제 시 Todo가 부드럽게 사라지는 애니메이션을 적용한다.
  
### Empty / Error States
- Todo 생성 빈 값: "할 일을 입력해 주세요."
- Todo 수정 빈 값: "할 일을 입력해 주세요."
- 검색어 빈 값: "검색할 내용을 입력해 주세요."
- 검색 결과 없음: "검색 결과가 없습니다."
- 선택 날짜에 Todo 없음: "이 날의 할 일이 없어요."
- 진행 중 Todo 없음: "진행 중인 할 일이 없습니다."
- 완료 Todo 없음: "완료한 할 일이 없습니다."
- FastAPI 서버 오류: Next.js error.tsx에서 에러 메시지를 표시한다.
  
### Test Plan
#### Backend
- POST /todos 요청으로 Todo가 생성된다.
- 생성된 Todo가 SQLite에 저장된다.
- GET /todos?date=YYYY-MM-DD가 해당 날짜 Todo만 반환한다.
- GET /todos?q=keyword가 전체 Todo에서 키워드 검색을 수행한다.
- status=active가 미완료 Todo만 반환한다.
- status=completed가 완료 Todo만 반환한다.
- PATCH /todos/{todo_id}가 Todo 텍스트를 수정한다.
- PATCH /todos/{todo_id}가 완료 상태를 수정한다.
- DELETE /todos/{todo_id}가 Todo를 삭제한다.
- 존재하지 않는 Todo 요청은 404를 반환한다.
#### Frontend
- / 접속 시 /todos로 이동한다.
- /todos에서 선택 날짜 Todo 목록이 표시된다.
- 주간 달력 날짜 클릭 시 선택 날짜가 변경된다.
- 이전/다음 주 버튼으로 주간 달력이 이동한다.
- /todos/new에서 Todo 생성 후 /todos로 이동한다.
- /todos/[todoId]에서 Todo 수정 후 /todos로 이동한다.
- 완료 버튼 클릭 시 Todo 완료 상태와 취소선이 반영된다.
- 삭제 버튼 클릭 시 Todo가 목록에서 제거된다.
- 검색어 입력 후 검색하면 전체 Todo에서 검색 결과가 표시된다.
- 상태 탭과 검색어가 함께 적용된다.
- 새로고침 후에도 SQLite에 저장된 Todo가 유지된다.
- FastAPI 서버가 꺼져 있으면 error.tsx가 표시된다.
#### Assumptions
- SQLite를 기본 저장소로 사용한다.
- CRUD 흐름은 Server Actions 중심으로 구현한다.
- route.ts는 보조 프록시로 유지한다.
- 기존 localStorage 데이터는 마이그레이션하지 않는다.
- 인증, 사용자 계정, 배포 설정은 이번 범위에 포함하지 않는다.
- Backend는 main.py 하나에 모든 로직을 작성한다.
- Frontend는 제공된 App Router 구조를 유지한다.
- `page.tsx`는 UI 세부 구현을 직접 포함하지 않고, 데이터 조회와 컴포넌트 조립만 담당한다.
- Client Component는 입력 상태, form pending 상태, 삭제 애니메이션처럼 브라우저 상태가 필요한 경우에만 사용한다.
- URL query string을 날짜, 필터, 검색 상태의 source of truth로 사용한다.
