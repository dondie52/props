import type { Metadata, Viewport } from "next";
import ServiceWorkerCleanup from "@/components/ServiceWorkerCleanup";
import "./globals.css";

export const metadata: Metadata = {
  title: "PropManage BW",
  description: "Property management SaaS for Botswana landlords",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ServiceWorkerCleanup />
        {children}
      </body>
    </html>
  );
}
