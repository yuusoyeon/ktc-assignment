import Link from "next/link";
import { notFound } from "next/navigation";

import { getTodo } from "@/app/actions";
import PageShell from "@/components/layout/PageShell";
import TodoEditForm from "@/components/todos/TodoEditForm";
import { resolve } from "path";

type TodoEditPageProps = {
  params: {
    todoId: string;
  };
};

export default async function TodoEditPage({ params }: {
  params: Promise<{ todoId: string }>; 
}) {
  let todo;
  const resolvedParams = await params;
  const todoId = resolvedParams.todoId;

  try {
    todo = await getTodo(todoId);
  } catch {
    notFound();
  }

  return (
    <PageShell>
      <section
        className="
          rounded-[20px] border border-[#e4dfef] bg-white px-9 py-8
          shadow-[0_4px_24px_rgba(103,43,224,0.07)]
        "
      >
        <p className="mb-2 font-mono text-[0.82rem] text-[#8c82a3]">
          {todo.date}
        </p>

        <h1 className="text-[2rem] font-bold leading-none text-[#6b4cb3]">
        Todo 수정
        </h1>
      </section>

      <TodoEditForm todo={todo} />

      <Link
        href={`/todos?date=${todo.date}`}
        className="text-center text-[0.88rem] font-medium text-[#8c82a3] transition hover:text-[#672be0]"
      >
        목록으로 돌아가기
      </Link>
    </PageShell>
  );
}