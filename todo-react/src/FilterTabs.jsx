const FILTERS = [
  { key: "all", label: "전체" },
  { key: "active", label: "진행 중" },
  { key: "completed", label: "완료" },
];

export default function FilterTabs({ currentFilter, onChangeFilter }) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-lg bg-[#f3f0f8] p-1">
      {FILTERS.map((filter) => {
        const isActive = currentFilter === filter.key;

        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => onChangeFilter(filter.key)}
            className={`
              h-9 rounded-md text-sm font-semibold
              transition-colors duration-200
              ${
                isActive
                  ? "bg-white text-[#672be0] shadow-sm"
                  : "text-[#8c82a3] hover:bg-white/70 hover:text-[#1a1625]"
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