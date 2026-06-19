import Link from "next/link";

import { deleteTodo, toggleTodo } from "@/app/actions";
import type { Todo } from "@/lib/type";

type TodoItemProps = {
  todo: Todo;
};

export default function TodoItem({ todo }: TodoItemProps) {
  return (
    <li
      className={`
        flex items-center gap-3.5 rounded-xl border bg-white px-[18px] py-4
        shadow-[0_4px_24px_rgba(103,43,224,0.07)]
        transition duration-200 animate-[fadeSlideIn_0.22s_ease]
        ${
          todo.completed
            ? "border-transparent bg-[#f3f1f8] shadow-none hover:border-[#b0a8c8]"
            : "border-[#e4dfef] hover:border-[#672be0] hover:shadow-[0_4px_20px_rgba(103,43,224,0.1)]"
        }
      `}
    >
      <form action={toggleTodo.bind(null, todo.id, !todo.completed)}>
        <button
          type="submit"
          aria-label="완료 상태 변경"
          aria-pressed={todo.completed}
          className={`
            flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2
            transition duration-200
            after:block after:h-[9px] after:w-[5px] after:rotate-45
            after:border-b-2 after:border-r-2 after:border-white after:content-['']
            ${
              todo.completed
                ? "border-[#672be0] bg-[#672be0] after:opacity-100"
                : "border-[#e4dfef] bg-transparent after:opacity-0 hover:border-[#672be0]"
            }
          `}
        />
      </form>

      <p
        className={`
          min-w-0 flex-1 break-all text-[0.95rem] font-normal leading-normal
          transition duration-200
          ${todo.completed ? "text-[#b0a8c8] line-through" : "text-[#1a1625]"}
        `}
      >
        {todo.text}
      </p>

      <div className="flex shrink-0 gap-1.5">
        <Link
          href={`/todos/${todo.id}`}
          className="
            flex h-8 w-8 items-center justify-center rounded-md
            bg-[rgba(103,43,224,0.08)] text-[0.82rem] text-[#672be0]
            transition duration-200
            hover:-translate-y-px hover:bg-[rgba(103,43,224,0.15)]
            active:translate-y-0
          "
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md
            bg-[rgba(103,43,224,0.08)] text-[0.70rem] text-[#672be0]
            transition duration-200
            hover:-translate-y-px hover:bg-[rgba(103,43,224,0.15)]
            active:translate-y-0">
          수정
          </span>
        </Link>

        <form action={deleteTodo.bind(null, todo.id)}>
          <button
            type="submit"
            className="flex h-8 w-8 items-center justify-center rounded-md
              bg-[rgba(214,59,106,0.08)] text-[0.70rem] text-[#d63b6a]
              transition duration-200
              hover:-translate-y-px hover:bg-[rgba(214,59,106,0.16)]
              active:translate-y-0
            "
          >
            <span className="text-[0.70rem]">
            삭제
            </span>
          </button>
        </form>
      </div>
    </li>
  );
}