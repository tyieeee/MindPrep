"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--color-divider)] bg-[var(--color-bg)]/85 px-6 py-4 backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] font-[family-name:var(--font-heading)] text-lg font-medium text-[var(--color-accent-100)] shadow-[var(--shadow-sm)]">
          Q
        </span>
        <span className="font-[family-name:var(--font-heading)] text-lg font-medium tracking-tight">
          QuizCraft
        </span>
      </Link>
    </header>
  );
}
