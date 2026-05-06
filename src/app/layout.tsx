import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PropManage BW",
  description: "Property management SaaS for Botswana landlords",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
