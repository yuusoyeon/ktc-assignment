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
    <section className="rounded-[20px] border border-[#e4dfef] bg-[#ffffff] px-6 py-5 shadow-[0_4px_24px_rgba(103,43,224,0.07)]">
      <div className="flex items-center gap-2.5">
        <input
          type="text"
          value={text}
          maxLength={100}
          placeholder="새로운 Todo를 입력하세요"
          onChange={(e) => {
            setText(e.target.value);
            if (e.target.value.trim()) setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          className="
            h-12 flex-1 shrink-0 rounded-xl border-[1.5px] border-[#e4dfef]
            bg-[#f7f6fb] px-[16px] text-[0.95rem] text-[#1a1625]
            outline-none transition duration-200
            placeholder:text-[#8c82a3]
            focus:border-[#672be0] focus:shadow-[0_0_0_3px_rgba(103,43,224,0.1)]
          "
        />

        <button
          type="button"
          onClick={handleSubmit}
          title="추가"
          className="
            h-10 flex-1 rounded-full text-[0.88rem] outline-none 
            border-none transition-all duration-200
            bg-[#672be0] text-[1.6rem] font-light leading-none text-[#ffffff]
            shadow-[0_2px_10px_rgba(103,43,224,0.28)]
            transition duration-200
            hover:-translate-y-px hover:bg-[#8a55e8] hover:shadow-[0_4px_14px_rgba(103,43,224,0.38)]
            active:translate-y-0
          "
        >
          +
        </button>
      </div>

      {error && (
        <p style={{ paddingLeft: "12px" }}className="mt-2.5 pl-1 text-[0.82rem] font-normal text-[#d63b6a] animate-[fadeSlideIn_0.2s_ease]">
          {error}
        </p>
      )}
    </section>
  );
}