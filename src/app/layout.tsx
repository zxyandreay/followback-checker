import type { Metadata } from "next";
import { SupportKofi } from "@/components/SupportKofi";
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
        <footer className="mt-auto border-t border-zinc-200/80 bg-zinc-100 px-4 py-6 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <SupportKofi variant="compact" />
          </div>
        </footer>
      </body>
    </html>
  );
}
