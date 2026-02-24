import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MLM Platform | Professional Network Marketing",
  description: "Multi-Level Marketing platform with secure dashboards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
