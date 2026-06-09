import type { Metadata } from "next";
import "./globals.css";
import ToasterProvider from "@/components/ui/ToasterProvider";

export const metadata: Metadata = {
  title: {
    template: "%s | 온종일 프로젝트",
    default: "온종일 프로젝트 — 방문판매 수당전산",
  },
  description: "고성능 방문판매 수당 관리 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Syne — 숫자·제목 전용 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800;900&display=swap" rel="stylesheet" />
        {/* Pretendard — 한글 본문 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" />
      </head>
      <body className="bg-bg text-text-primary font-body antialiased">
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
