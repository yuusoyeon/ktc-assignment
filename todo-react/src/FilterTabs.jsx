const FILTERS = [
  { key: "all", label: "전체" },
  { key: "active", label: "진행 중" },
  { key: "completed", label: "완료" },
];

export default function FilterTabs({ currentFilter, onChangeFilter }) {
  return (
    <div className="flex w-full justify-around items-center gap-3 py-2">
      {FILTERS.map((filter) => {
        const isActive = currentFilter === filter.key;

        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => onChangeFilter(filter.key)}
            className={`
              h-10 flex-1 rounded-full text-[0.88rem] outline-none border-none transition-all duration-200
              ${
                    isActive
                      ? "bg-[#672be0] text-white shadow-sm shadow-[rgba(103,43,224,0.2)] text-[#f4f5f0]"
                      : "bg-transparent text-[#8c82a3] hover:bg-[rgba(103,43,224,0.06)] hover:text-[#672be0]"
                  }
            `}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}