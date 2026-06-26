import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";

export const metadata: Metadata = {
  title: "Trackrr — Portfolio Tracker",
  description: "Aliasgar Johar's paper portfolio tracker.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-black text-beige antialiased">
        <Sidebar />
        <main className="md:ml-[220px] min-h-screen pb-20 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
