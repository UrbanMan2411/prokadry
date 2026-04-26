import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ПРОкадры — Платформа подбора специалистов по закупкам",
  description: "Специализированная HR-платформа для поиска и подбора кадров в сфере 44-ФЗ, 223-ФЗ и тендерного сопровождения",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`h-full ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-white" style={{ fontFamily: "'Golos Text', sans-serif", overflowX: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
