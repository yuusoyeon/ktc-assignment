import importlib
import os
import tempfile

import pytest
from fastapi.testclient import TestClient


db_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
db_file.close()

os.environ["DATABASE_URL"] = f"sqlite:///{db_file.name}"

main = importlib.import_module("main")

client = TestClient(main.app)


@pytest.fixture(autouse=True)
def clean_db():
    main.Base.metadata.drop_all(bind=main.engine)
    main.Base.metadata.create_all(bind=main.engine)
    yield


def create_todo(text="운동하기", date="2026-06-19"):
    response = client.post(
        "/todos",
        json={
            "text": text,
            "date": date,
        },
    )
    assert response.status_code == 201
    return response.json()


def test_create_todo():
    todo = create_todo()

    assert todo["id"] is not None
    assert todo["text"] == "운동하기"
    assert todo["completed"] is False
    assert todo["date"] == "2026-06-19"
    assert "created_at" in todo
    assert "updated_at" in todo


def test_create_todo_trims_text():
    todo = create_todo(text="  책 읽기  ")

    assert todo["text"] == "책 읽기"


def test_create_todo_rejects_blank_text():
    response = client.post(
        "/todos",
        json={
            "text": "   ",
            "date": "2026-06-19",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "할 일을 입력해 주세요."


def test_create_todo_rejects_invalid_date_format():
    response = client.post(
        "/todos",
        json={
            "text": "운동하기",
            "date": "2026/06/19",
        },
    )

    assert response.status_code == 422


def test_get_todos_filters_by_date_when_q_is_missing():
    create_todo(text="오늘 할 일", date="2026-06-19")
    create_todo(text="내일 할 일", date="2026-06-20")

    response = client.get("/todos?date=2026-06-19")

    assert response.status_code == 200

    todos = response.json()

    assert len(todos) == 1
    assert todos[0]["text"] == "오늘 할 일"
    assert todos[0]["date"] == "2026-06-19"


def test_get_todos_searches_all_dates_when_q_exists():
    create_todo(text="운동하기", date="2026-06-19")
    create_todo(text="운동복 사기", date="2026-06-20")
    create_todo(text="책 읽기", date="2026-06-19")

    response = client.get("/todos?date=2026-06-19&q=운동")

    assert response.status_code == 200

    todos = response.json()

    assert len(todos) == 1
    assert todos[0]["text"] == "운동하기"


def test_get_todos_filters_active_status():
    todo = create_todo(text="완료할 일")
    create_todo(text="진행 중인 일")

    client.patch(
        f"/todos/{todo['id']}",
        json={
            "completed": True,
        },
    )

    response = client.get("/todos?date=2026-06-19&status=active")

    assert response.status_code == 200

    todos = response.json()

    assert len(todos) == 1
    assert todos[0]["text"] == "진행 중인 일"
    assert todos[0]["completed"] is False


def test_get_todos_filters_completed_status():
    todo = create_todo(text="완료한 일")
    create_todo(text="진행 중인 일")

    client.patch(
        f"/todos/{todo['id']}",
        json={
            "completed": True,
        },
    )

    response = client.get("/todos?date=2026-06-19&status=completed")

    assert response.status_code == 200

    todos = response.json()

    assert len(todos) == 1
    assert todos[0]["text"] == "완료한 일"
    assert todos[0]["completed"] is True


def test_get_todos_returns_recent_created_first():
    first = create_todo(text="먼저 만든 일")
    second = create_todo(text="나중에 만든 일")

    response = client.get("/todos?date=2026-06-19")

    assert response.status_code == 200

    todos = response.json()

    assert todos[0]["id"] == second["id"]
    assert todos[1]["id"] == first["id"]


def test_get_todo():
    created = create_todo()

    response = client.get(f"/todos/{created['id']}")

    assert response.status_code == 200

    todo = response.json()

    assert todo["id"] == created["id"]
    assert todo["text"] == created["text"]


def test_get_todo_returns_404_when_missing():
    response = client.get("/todos/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Todo를 찾을 수 없습니다."


def test_update_todo_text():
    created = create_todo()

    response = client.patch(
        f"/todos/{created['id']}",
        json={
            "text": "수정된 할 일",
        },
    )

    assert response.status_code == 200

    todo = response.json()

    assert todo["text"] == "수정된 할 일"
    assert todo["completed"] is False


def test_update_todo_completed():
    created = create_todo()

    response = client.patch(
        f"/todos/{created['id']}",
        json={
            "completed": True,
        },
    )

    assert response.status_code == 200

    todo = response.json()

    assert todo["completed"] is True


def test_update_todo_date():
    created = create_todo()

    response = client.patch(
        f"/todos/{created['id']}",
        json={
            "date": "2026-06-20",
        },
    )

    assert response.status_code == 200

    todo = response.json()

    assert todo["date"] == "2026-06-20"


def test_update_todo_rejects_blank_text():
    created = create_todo()

    response = client.patch(
        f"/todos/{created['id']}",
        json={
            "text": "   ",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "할 일을 입력해 주세요."


def test_update_todo_returns_404_when_missing():
    response = client.patch(
        "/todos/999999",
        json={
            "text": "없는 Todo 수정",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Todo를 찾을 수 없습니다."


def test_delete_todo():
    created = create_todo()

    response = client.delete(f"/todos/{created['id']}")

    assert response.status_code == 200
    assert response.json() == {
        "message": "Todo가 삭제되었습니다.",
        "id": created["id"],
    }

    get_response = client.get(f"/todos/{created['id']}")

    assert get_response.status_code == 404


def test_delete_todo_returns_404_when_missing():
    response = client.delete("/todos/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Todo를 찾을 수 없습니다."