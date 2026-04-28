import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Jobs Signal",
  description: "国内 AI 开发机会信号雷达"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
