import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return (
    <main
      className="
        min-h-screen px-4 pb-20 pt-[60px] text-[#1a1625]
        bg-[#f7f6fb]
        [background-image:radial-gradient(circle,#c4b5e8_1px,transparent_1px)]
        [background-size:28px_28px]
      "
    >
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-5">
        {children}
      </div>
    </main>
  );
}