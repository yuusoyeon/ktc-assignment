from datetime import datetime,timezone
import os
from typing import Literal, Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Boolean, Column, DateTime, Integer, String, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

try: 
  from dotenv import load_dotenv
  
  load_dotenv(".env.local")
except ImportError:
  pass

DATEBASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todos.db")

engine = create_engine(
  DATEBASE_URL,
  connect_args={"check_same_thread": False}
  if DATEBASE_URL.startswith("sqlite")
  else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class TodoModel(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String(255), nullable=False)
    completed = Column(Boolean, nullable=False, default=False)
    date = Column(String(10), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    
class TodoCreate(BaseModel):
  text: str = Field(..., min_length=1, max_length=255)
  date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
  
class TodoUpdate(BaseModel):
  text: Optional[str] = Field(None, min_length=1, max_length=255)
  completed: Optional[bool] = None
  date: Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
  
class TodoResponse(BaseModel):
  model_config = ConfigDict(from_attributes=True)
  
  id: int
  text: str
  completed: bool
  date: str
  created_at: datetime
  updated_at: datetime
  
TodoStatus = Literal["all", "active", "completed"]

app = FastAPI(title="Todo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()
    
def normalize_text(text: str) -> str:
  trimmed = text.strip()
  if not trimmed:
    raise HTTPException(status_code=400, detail="할 일을 입력해 주세요.")
  return trimmed

@app.get("/todos", response_model=list[TodoResponse])
def get_todos(
  date: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
  status: TodoStatus = "all",
  q: Optional[str] = None,
  db: Session = Depends(get_db),
):
  
  query = db.query(TodoModel)
  
  search_keyword = q.strip() if q else ""
  
  if date:
    query = query.filter(TodoModel.date == date)
  
  if search_keyword:
      query = query.filter(TodoModel.text.ilike(f"%{search_keyword}%"))

  if status == "active":
      query = query.filter(TodoModel.completed.is_(False))
  elif status == "completed":
      query = query.filter(TodoModel.completed.is_(True))

  return query.order_by(TodoModel.created_at.desc()).all()

@app.get("/todos/{todo_id}", response_model=TodoResponse)
def get_todo(todo_id: int, db: Session = Depends(get_db)):
  todo = db.get(TodoModel, todo_id)
  
  if not todo:
    raise HTTPException(status_code=404, detail="Todo를 찾을 수 없습니다.")
  
  return todo

@app.post("/todos", response_model=TodoResponse, status_code=201)
def create_todo(payload: TodoCreate, db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)

    todo = TodoModel(
        text=normalize_text(payload.text),
        completed=False,
        date=payload.date,
        created_at=now,
        updated_at=now,
    )

    db.add(todo)
    db.commit()
    db.refresh(todo)

    return todo
  
@app.patch("/todos/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: int,
    payload: TodoUpdate,
    db: Session = Depends(get_db),
):
    todo = db.get(TodoModel, todo_id)

    if not todo:
        raise HTTPException(status_code=404, detail="Todo를 찾을 수 없습니다.")

    if payload.text is not None:
        todo.text = normalize_text(payload.text)

    if payload.completed is not None:
        todo.completed = payload.completed

    if payload.date is not None:
        todo.date = payload.date

    todo.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(todo)

    return todo

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.get(TodoModel, todo_id)

    if not todo:
        raise HTTPException(status_code=404, detail="Todo를 찾을 수 없습니다.")

    db.delete(todo)
    db.commit()

    return {"message": "Todo가 삭제되었습니다.", "id": todo_id}