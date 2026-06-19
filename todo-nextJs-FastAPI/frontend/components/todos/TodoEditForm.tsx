import Link from "next/link";

import { updateTodo } from "@/app/actions";
import type { Todo } from "@/lib/type";

import TodoSubmitButton from "./TodoSubmitButton";

type TodoEditFormProps = {
  todo: Todo;
};

export default function TodoEditForm({ todo }: TodoEditFormProps) {
  const redirectTo = `/todos?date=${todo.date}`;
  const updateTodoWithId = updateTodo.bind(null, todo.id);

  return (
    <section className="rounded-[20px] border border-[#e4dfef] bg-white px-6 py-5 shadow-[0_4px_24px_rgba(103,43,224,0.07)]">
      <form action={updateTodoWithId} className="flex flex-col gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div className="flex flex-col gap-2">
          <label
            htmlFor="text"
            className="text-[0.85rem] font-medium text-[#8c82a3]"
          >
            할 일 수정
          </label>

          <input
            id="text"
            name="text"
            type="text"
            maxLength={255}
            required
            autoFocus
            defaultValue={todo.text}
            className="
              h-12 rounded-xl border-[1.5px] border-[#e4dfef]
              bg-[#f7f6fb] px-[18px] text-[0.95rem] text-[#1a1625]
              outline-none transition duration-200
              placeholder:text-[#8c82a3]
              focus:border-[#672be0] focus:shadow-[0_0_0_3px_rgba(103,43,224,0.1)]
            "
          />
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <Link
            href={redirectTo}
            className="
              flex h-12 items-center justify-center rounded-xl
              bg-[rgba(103,43,224,0.08)] px-5 text-[0.95rem] font-medium
              text-[#672be0] transition duration-200
              hover:bg-[rgba(103,43,224,0.15)]
            "
          >
            취소
          </Link>

          <TodoSubmitButton label="저장" />
        </div>
      </form>
    </section>
  );
}