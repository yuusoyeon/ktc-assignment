import Link from "next/link";

import PageShell from "@/components/layout/PageShell";
import TodoCreateForm from "@/components/todos/TodoCreateForm";
import { formatDateKey } from "@/lib/date";

type TodoNewPageProps = {
  searchParams: Promise<{
    date?: string;
  }>;
};

export default async function TodoNewPage({ searchParams }: TodoNewPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedDate = resolvedSearchParams.date ?? formatDateKey(new Date());

  return (
    <PageShell>
      <section
        className="
          rounded-[20px] border border-[#e4dfef] bg-white px-9 py-8
          shadow-[0_4px_24px_rgba(103,43,224,0.07)]
        "
      >
        <p className="mb-2 font-mono text-[0.82rem] text-[#8c82a3]">
          {selectedDate}
        </p>

        <h1 className="font-mono text-[2rem] font-medium leading-none text-[#1a1625]">
          새 Todo
        </h1>
      </section>

      <TodoCreateForm selectedDate={selectedDate} />

      <Link
        href={`/todos?date=${selectedDate}`}
        className="text-center text-[0.88rem] font-medium text-[#8c82a3] transition hover:text-[#672be0]"
      >
        목록으로 돌아가기
      </Link>
    </PageShell>
  );
}