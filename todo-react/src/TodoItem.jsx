import { useEffect, useRef, useState } from "react";

export default function TodoItem({
  todo,
  onToggleComplete,
  onUpdateTodo,
  onDeleteTodo,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [error, setError] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);
  const timerRef = useRef(null);

  const showError = (message) => {
    setError(message);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setError(""), 2500);
  };

  const handleSave = () => {
    const trimmed = editText.trim();

    if (!trimmed) {
      showError("수정할 내용을 입력해 주세요.");
      return;
    }

    onUpdateTodo(todo.id, trimmed);
    setIsEditing(false);
    setError("");
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
    setError("");
  };

  const handleDelete = () => {
    setIsRemoving(true);

    setTimeout(() => {
      onDeleteTodo(todo.id);
    }, 180);
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <li
      className={`
        rounded-lg border border-[#e4dfef] bg-white p-3
        transition-all duration-200
        ${isRemoving ? "translate-x-2 opacity-0" : "translate-x-0 opacity-100"}
      `}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onToggleComplete(todo.id)}
          aria-label="완료 상태 변경"
          aria-pressed={todo.completed}
          className={`
            mt-1 h-5 w-5 shrink-0 rounded-full border
            transition-colors duration-200
            ${
              todo.completed
                ? "border-[#672be0] bg-[#672be0]"
                : "border-[#cfc7df] bg-white hover:border-[#672be0]"
            }
          `}
        />

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editText}
              maxLength={100}
              autoFocus
              onChange={(e) => {
                setEditText(e.target.value);
                if (e.target.value.trim()) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              className="
                h-9 w-full rounded-md border border-[#e4dfef] px-3
                text-sm text-[#1a1625] outline-none
                focus:border-[#672be0] focus:ring-2 focus:ring-[rgba(103,43,224,0.12)]
              "
            />
          ) : (
            <p
              className={`
                break-words text-sm leading-6 text-[#1a1625]
                ${todo.completed ? "text-[#aaa2ba] line-through" : ""}
              `}
            >
              {todo.text}
            </p>
          )}

          <p
            className={`
              mt-1 min-h-4 text-xs text-[#d7375f]
              transition-opacity duration-200
              ${error ? "opacity-100" : "opacity-0"}
            `}
          >
            {error}
          </p>
        </div>

        <div className="flex shrink-0 gap-1">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="h-8 rounded-md px-2 text-xs font-semibold text-[#672be0] hover:bg-[rgba(103,43,224,0.08)]"
              >
                저장
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="h-8 rounded-md px-2 text-xs font-semibold text-[#8c82a3] hover:bg-[#f3f0f8]"
              >
                취소
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="h-8 rounded-md px-2 text-xs font-semibold text-[#8c82a3] hover:bg-[#f3f0f8]"
              >
                수정
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="h-8 rounded-md px-2 text-xs font-semibold text-[#d7375f] hover:bg-[#fff0f4]"
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}