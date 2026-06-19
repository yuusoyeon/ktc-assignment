type AppHeaderProps = {
  totalCount: number;
  completedCount: number;
};

export default function AppHeader({
  totalCount,
  completedCount,
}: AppHeaderProps) {
  return (
    <header
      className="
        relative overflow-hidden rounded-[20px] border border-[#e4dfef]
        bg-white px-9 py-8 shadow-[0_4px_24px_rgba(103,43,224,0.07)]
      "
    >
      <div className="absolute left-0 top-0 h-full w-[5px] rounded-l bg-gradient-to-b from-[#672be0] to-[#8a55e8]" />

      <div className="pl-2">
        <h1 className="font-mono text-[2.4rem] font-medium leading-none text-[#1a1625]">
          Todo<span className="text-[#672be0]">.</span>
        </h1>

        <p className="mt-2.5 font-mono text-[0.82rem] font-normal tracking-[0.5px] text-[#8c82a3]">
          <span className="font-medium text-[#672be0]">
            {completedCount}
          </span>
          {" / "}
          {totalCount} completed
        </p>
      </div>
    </header>
  );
}