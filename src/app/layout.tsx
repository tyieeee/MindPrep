import type { Metadata } from "next";
import { Fraunces, Figtree } from "next/font/google";
import "./globals.css";
import FloatingBooks from "@/components/FloatingBooks";
import SiteHeader from "@/components/SiteHeader";

const fraunces = Fraunces({
  variable: "--font-heading",
  weight: ["500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuizCraft",
  description: "Turn your study reviewer into a self-quiz.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <div className="relative flex flex-1 flex-col">
          <FloatingBooks />
          <div className="relative z-10 flex flex-1 flex-col">{children}</div>
        </div>
      </body>
    </html>
  );
}
