import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ПРОкадры — ЗаказРФ",
  description: "Платформа для подбора специалистов в сфере закупок",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`h-full ${inter.className}`}>
      <body className="h-full bg-slate-50">{children}</body>
    </html>
  );
}
