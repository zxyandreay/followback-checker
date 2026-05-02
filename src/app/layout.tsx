import type { Metadata } from "next";
import { SiteFooterCredits } from "@/components/SiteFooterCredits";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FollowBack Checker",
  description:
    "Compare Instagram following vs followers from your official data export — processed locally in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <footer className="mt-auto border-t border-zinc-200/40 bg-zinc-100 px-4 py-4 dark:border-zinc-800/60 dark:bg-zinc-950 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <SiteFooterCredits />
          </div>
        </footer>
      </body>
    </html>
  );
}
