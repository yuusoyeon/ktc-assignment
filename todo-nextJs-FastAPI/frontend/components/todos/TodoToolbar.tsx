import FilterTabs from "./FilterTabs";
import SearchForm from "./SearchForm";

type TodoToolbarProps = {
  selectedDate: string;
  status: string;
  q?: string;
};

export default function TodoToolbar({
  selectedDate,
  status,
  q,
}: TodoToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <SearchForm selectedDate={selectedDate} status={status} q={q} />

      <FilterTabs selectedDate={selectedDate} status={status} q={q} />
    </div>
  );
}