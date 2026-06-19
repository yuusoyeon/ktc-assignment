import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo List",
  description: "Next.js and FastAPI Todo app",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}