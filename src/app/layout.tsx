import type { Metadata } from "next";
import "./globals.css";

// Keep unfinished and future private routes out of search by default.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
