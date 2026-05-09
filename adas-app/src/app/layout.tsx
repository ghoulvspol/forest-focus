import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "智驾验证 - ADAS Verification",
  description: "辅助驾驶验证应用，模拟特斯拉和小鹏的智驾功能",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}