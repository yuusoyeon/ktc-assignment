"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type SearchFormProps = {
  selectedDate: string;
  status: string;
  q?: string;
};

export default function SearchForm({
  selectedDate,
  status,
  q = "",
}: SearchFormProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(q);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = keyword.trim();

    if (!trimmed) {
      setError("검색할 내용을 입력해 주세요.");

      window.setTimeout(() => {
        setError("");
      }, 2500);

      return;
    }

    const params = new URLSearchParams();

    params.set("date", selectedDate);
    params.set("q", trimmed);

    if (status && status !== "all") {
      params.set("status", status);
    }

    router.push(`/todos?${params.toString()}`);
  };

  const handleReset = () => {
    setKeyword("");
    setError("");

    const params = new URLSearchParams();

    params.set("date", selectedDate);

    if (status && status !== "all") {
      params.set("status", status);
    }

    router.push(`/todos?${params.toString()}`);
  };

  return (
    <section className="rounded-[20px] border border-[#e4dfef] bg-white px-6 py-5 shadow-[0_4px_24px_rgba(103,43,224,0.07)]">
      <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
        <input
          type="text"
          value={keyword}
          placeholder="검색할 Todo를 입력하세요"
          onChange={(event) => {
            setKeyword(event.target.value);
            if (event.target.value.trim()) setError("");
          }}
          className="
            h-12 flex-1 rounded-xl border-[1.5px] border-[#e4dfef]
            bg-[#f7f6fb] px-[18px] text-[0.95rem] text-[#1a1625]
            outline-none transition duration-200
            placeholder:text-[#8c82a3]
            focus:border-[#672be0] focus:shadow-[0_0_0_3px_rgba(103,43,224,0.1)]
          "
        />

        <button
          type="submit"
          className="
            h-12 rounded-xl bg-[#672be0] px-4 text-[0.9rem] font-medium text-white
            shadow-[0_2px_10px_rgba(103,43,224,0.28)]
            transition duration-200
            hover:-translate-y-px hover:bg-[#8a55e8]
            hover:shadow-[0_4px_14px_rgba(103,43,224,0.38)]
            active:translate-y-0
          "
        >
          검색
        </button>

        {q && (
          <button
            type="button"
            onClick={handleReset}
            className="
              h-12 rounded-xl bg-[rgba(103,43,224,0.08)] px-3
              text-[0.85rem] font-medium text-[#672be0]
              transition duration-200 hover:bg-[rgba(103,43,224,0.15)]
            "
          >
            초기화
          </button>
        )}
      </form>

      {error && (
        <p className="mt-2.5 pl-1 text-[0.82rem] font-normal text-[#d63b6a]">
          {error}
        </p>
      )}
    </section>
  );
}