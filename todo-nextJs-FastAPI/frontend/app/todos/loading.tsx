import PageShell from "@/components/layout/PageShell";

export default function TodosLoading() {
  return (
    <PageShell>
      <section
        className="
          relative overflow-hidden rounded-[20px] border border-[#e4dfef]
          bg-white px-9 py-8 shadow-[0_4px_24px_rgba(103,43,224,0.07)]
        "
      >
        <div className="absolute left-0 top-0 h-full w-[5px] rounded-l bg-gradient-to-b from-[#672be0] to-[#8a55e8]" />

        <div className="h-10 w-40 animate-pulse rounded-lg bg-[#f3f1f8]" />
        <div className="mt-3 h-4 w-28 animate-pulse rounded bg-[#f3f1f8]" />
      </section>

      <section className="rounded-[20px] border border-[#e4dfef] bg-white px-5 py-4 shadow-[0_4px_24px_rgba(103,43,224,0.07)]">
        <div className="mb-4 h-5 w-32 animate-pulse rounded bg-[#f3f1f8]" />

        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="h-[82px] animate-pulse rounded-xl bg-[#f3f1f8]"
            />
          ))}
        </div>
      </section>

      <section className="rounded-[20px] border border-[#e4dfef] bg-white px-6 py-5 shadow-[0_4px_24px_rgba(103,43,224,0.07)]">
        <div className="h-12 animate-pulse rounded-xl bg-[#f3f1f8]" />
      </section>

      <section className="rounded-xl border border-[#e4dfef] bg-white px-[18px] py-4 shadow-[0_4px_24px_rgba(103,43,224,0.07)]">
        <div className="h-5 animate-pulse rounded bg-[#f3f1f8]" />
      </section>
    </PageShell>
  );
}