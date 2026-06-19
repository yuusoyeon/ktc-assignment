type TodoEmptyStateProps = {
  status: string;
  q?: string;
};

function getEmptyMessage(status: string, q?: string) {
  if (q) return "검색 결과가 없습니다.";
  if (status === "active") return "진행 중인 할 일이 없습니다.";
  if (status === "completed") return "완료한 할 일이 없습니다.";

  return "이 날의 할 일이 없어요.\n새로운 Todo를 추가해 보세요.";
}

export default function TodoEmptyState({ status, q }: TodoEmptyStateProps) {
  return (
    <section
      className="
        rounded-[20px] border border-[#e4dfef] bg-white px-6 py-[52px]
        text-center text-[0.9rem] leading-[1.7] text-[#8c82a3]
        shadow-[0_4px_24px_rgba(103,43,224,0.07)]
      "
    >
      <span className="mb-3 block text-[1.6rem] text-[#672be0] opacity-40">
        +
      </span>

      <p className="whitespace-pre-line">{getEmptyMessage(status, q)}</p>
    </section>
  );
}