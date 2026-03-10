import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "OTP Viewer",
  description: "แสดงรหัส OTP ที่ส่งมาจากมือถือ Android",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
