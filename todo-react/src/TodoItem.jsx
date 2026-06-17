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
        flex items-center gap-3.5 rounded-xl border bg-[#ffffff] px-[18px] py-4 
        shadow-[0_4px_24px_rgba(103,43,224,0.07)]
        transition duration-200 animate-[fadeSlideIn_0.22s_ease]
        {/* 완료 클릭 시 */}
        ${
          todo.completed 
            ? "border-transparent bg-[#f3f1f8] shadow-none hover:border-[#b0a8c8]"
            : "border-[#e4dfef] hover:border-[#672be0] hover:shadow-[0_4px_20px_rgba(103,43,224,0.1)]"
        }
        ${isRemoving ? "translate-x-2 opacity-0" : "translate-x-0 opacity-100"}
      `}
    >
      <button
        type="button"
        onClick={() => onToggleComplete(todo.id)}
        aria-label="완료 상태 변경"
        aria-pressed={todo.completed}
        className={`
          flex h-5 w-5 aspect-square items-center justify-center rounded-full border-2
    
          transition duration-200 text-[0.7rem] leading-none
            
            ${
              todo.completed
                ? "border-[#672be0] bg-[#672be0] text-[#ffffff] font-bold" 
                : "border-[#e4dfef] bg-transparent text-transparent hover:border-[#672be0]"
            }
          `}
      >
        {todo.completed ? "✓" : ""}
      </button>

      {/* 편집 모드 */}
      {isEditing ? (
        <div className="min-w-0 flex-1">
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
            style={{ 
                paddingTop: 17,    
                paddingBottom: 17, 
                paddingLeft: 9,   
                paddingRight: 0
              }}
            className="
              h-9 w-full rounded-md border border-transparent
              bg-[#ffffff] text-[0.95rem] text-[#1a1625]
              outline-none shadow-[0_0_0_3px_rgba(103,43,224,0.1)]
            "
          />
          {error && (
            <p className="mt-2 pl-1 text-[0.82rem] text-[#d63b6a]">
              {error}
            </p>
          )}
        </div>
      ) : (
        <p
          className={`
            min-w-0 flex-1 break-all text-[0.95rem] font-normal leading-normal px-[10px]
            transition duration-200
            ${todo.completed ? "text-[#b0a8c8] line-through" : "text-[#1a1625]"}
          `}
        >
          {todo.text}
        </p>
      )}

      <div className="flex shrink-0 gap-1.5">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={handleSave}
              title="저장"
              className="h-10 flex-1 rounded-full text-[0.88rem] outline-none border-none transition-all duration-200 bg-[rgba(103,43,224,0.06)] text-[0.82rem] text-[#672be0] transition duration-200 hover:-translate-y-px hover:bg-[rgba(103,43,224,0.14)] active:translate-y-0"
            >
              저장
            </button>
            <button
              type="button"
              onClick={handleCancel}
              title="취소"
              className="h-10 flex-1 rounded-full text-[0.88rem] outline-none border-none transition-all duration-200 bg-[rgba(103,43,224,0.06)] text-[0.82rem] text-[#672be0] transition duration-200 hover:-translate-y-px hover:bg-[rgba(103,43,224,0.14)] active:translate-y-0"
            >
              취소
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              title="수정"
              className="h-10 flex-1 rounded-full text-[0.88rem] outline-none border-none transition-all duration-200 bg-[rgba(103,43,224,0.08)] text-[0.82rem] text-[#672be0] transition duration-200 hover:-translate-y-px hover:bg-[rgba(103,43,224,0.15)] active:translate-y-0"
            >
              수정
            </button>
            <button
              type="button"
              onClick={handleDelete}
              title="삭제"
              className="h-10 flex-1 rounded-full text-[0.88rem] outline-none border-none transition-all duration-200 bg-[rgba(214,59,106,0.08)] text-[0.82rem] text-[#d63b6a] transition duration-200 hover:-translate-y-px hover:bg-[rgba(214,59,106,0.16)] active:translate-y-0"
            >
              삭제
            </button>
          </>
        )}
      </div>
    </li>
  );
}