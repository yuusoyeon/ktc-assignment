import Link from "next/link";

const FILTERS = [
  { key: "all", label: "전체" },
  { key: "active", label: "진행 중" },
  { key: "completed", label: "완료" },
];

type FilterTabsProps = {
  selectedDate: string;
  status: string;
  q?: string;
};

function createFilterHref({
  selectedDate,
  status,
  q,
}: {
  selectedDate: string;
  status: string;
  q?: string;
}) {
  const params = new URLSearchParams();

  params.set("date", selectedDate);

  if (status !== "all") {
    params.set("status", status);
  }

  if (q) {
    params.set("q", q);
  }

  return `/todos?${params.toString()}`;
}

export default function FilterTabs({
  selectedDate,
  status,
  q,
}: FilterTabsProps) {
  return (
    <nav className="flex gap-2 rounded-[20px] border border-[#e4dfef] bg-white p-2 shadow-[0_4px_24px_rgba(103,43,224,0.07)]">
      {FILTERS.map((filter) => {
        const isActive = status === filter.key;

        return (
          <Link
            key={filter.key}
            href={createFilterHref({
              selectedDate,
              status: filter.key,
              q,
            })}
            className={`
              flex h-9 flex-1 items-center justify-center rounded-xl text-[0.88rem]
              transition duration-200
              ${
                isActive
                  ? "bg-[#672be0] font-medium text-white"
                  : "bg-transparent font-normal text-[#8c82a3] hover:bg-[rgba(103,43,224,0.08)] hover:text-[#672be0]"
              }
            `}
          >
            <span className={isActive ?       "text-white" : ""}>
              {filter.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}