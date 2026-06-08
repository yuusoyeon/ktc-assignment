import { useEffect, useRef, useState } from "react";

export default function TodoInput({ onAddTodo }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const timerRef = useRef(null);
  /* useRef : 타이머 번호표를 까먹지 않도록 잡고 있는 놈 */

  const showError = (message) => {
    setError(message);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setError(""), 2500);
  };

  const handleSubmit = () => {
    const trimmed = text.trim();

    if (!trimmed) {
      showError("할 일을 입력해 주세요.");
      return;
    }

    onAddTodo(trimmed);
    setText("");
    setError("");
  };

  /* 화면이 바뀔 때에는 기존 타이머 아예 지워버리기 */ 
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <section className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          maxLength={100}
          onChange={(e) => {
            setText(e.target.value);
            if (e.target.value.trim()) setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          placeholder="할 일을 입력하세요"
          className="
            flex-1 h-11 rounded-lg border border-[#e4dfef] bg-white px-3
            text-sm text-[#1a1625] outline-none
            transition-colors duration-200
            placeholder:text-[#aaa2ba]
            focus:border-[#672be0] focus:ring-2 focus:ring-[rgba(103,43,224,0.12)]
          "
        />

        <button
          type="button"
          onClick={handleSubmit}
          className="
            h-11 px-4 rounded-lg bg-[#672be0]
            text-sm font-semibold text-white
            transition-colors duration-200
            hover:bg-[#5621c4]
            active:bg-[#481aa8]
          "
        >
          추가
        </button>
      </div>

      <p
        className={`
          min-h-5 text-xs text-[#d7375f]
          transition-opacity duration-200
          ${error ? "opacity-100" : "opacity-0"}
        `}
      >
        {error}
      </p>
    </section>
  );
}