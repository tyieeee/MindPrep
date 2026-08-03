import type { Metadata } from "next";
import { Figtree, Dancing_Script } from "next/font/google";
import "./globals.css";
import PageShell from "@/components/PageShell";
import HistoryProvider from "@/components/HistoryProvider";

const figtree = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Shajie's Reviewer",
  description: "Turn your study reviewer into a self-quiz.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${figtree.variable} ${dancingScript.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <HistoryProvider>
          <PageShell>{children}</PageShell>
        </HistoryProvider>
      </body>
    </html>
  );
}
