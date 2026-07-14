import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import PageShell from "@/components/PageShell";

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
    <html lang="en" className={`${figtree.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}
