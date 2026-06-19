"use client";

import { useFormStatus } from "react-dom";

type TodoSubmitButtonProps = {
  label: string;
  pendingLabel?: string;
};

export default function TodoSubmitButton({
  label,
  pendingLabel = "저장 중...",
}: TodoSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="
        h-12 rounded-xl bg-[#672be0] px-5 text-[0.95rem] font-medium text-white
        shadow-[0_2px_10px_rgba(103,43,224,0.28)]
        transition duration-200
        hover:-translate-y-px hover:bg-[#8a55e8]
        hover:shadow-[0_4px_14px_rgba(103,43,224,0.38)]
        active:translate-y-0
        disabled:cursor-not-allowed disabled:opacity-60
        disabled:hover:translate-y-0 disabled:hover:bg-[#672be0]
      "
    >
      {pending ? pendingLabel : label}
    </button>
  );
}