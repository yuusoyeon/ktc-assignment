"use client";

import PageShell from "@/components/layout/PageShell";

type TodosErrorProps = {
  error: Error;
  reset: () => void;
};

export default function TodosError({ error, reset }: TodosErrorProps) {
  return (
    <PageShell>
      <section
        className="
          rounded-[20px] border border-[#e4dfef] bg-white px-6 py-[52px]
          text-center shadow-[0_4px_24px_rgba(103,43,224,0.07)]
        "
      >
        <p className="font-mono text-[2rem] font-medium text-[#672be0]">
          Error
        </p>

        <p className="mt-3 text-[0.95rem] leading-[1.7] text-[#8c82a3]">
          Todo 데이터를 불러오지 못했습니다.
        </p>

        <p className="mt-2 break-words text-[0.82rem] text-[#d63b6a]">
          {error.message}
        </p>

        <button
          type="button"
          onClick={reset}
          className="
            mt-6 h-11 rounded-xl bg-[#672be0] px-5 text-[0.9rem]
            font-medium text-white shadow-[0_2px_10px_rgba(103,43,224,0.28)]
            transition duration-200
            hover:-translate-y-px hover:bg-[#8a55e8]
            hover:shadow-[0_4px_14px_rgba(103,43,224,0.38)]
            active:translate-y-0
          "
        >
          다시 시도
        </button>
      </section>
    </PageShell>
  );
}