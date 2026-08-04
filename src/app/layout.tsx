import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PunProfile",
  description:
    "An honest, coach-informed first read on your EU job-market readiness.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-black/[.08] px-4 py-3 dark:border-white/[.145]">
          <span className="text-sm font-semibold">PunProfile</span>
        </header>
        <ConvexClientProvider>
          <main className="flex flex-1 flex-col">{children}</main>
        </ConvexClientProvider>
        <footer className="border-t border-black/[.08] px-4 py-3 text-xs text-zinc-500 dark:border-white/[.145] dark:text-zinc-400">
          PunProfile Career Coaching
        </footer>
      </body>
    </html>
    </ConvexAuthNextjsServerProvider>
  );
}
