import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "NDY 차량 월마감",
  description: "월별 물류 정산 및 마감 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
