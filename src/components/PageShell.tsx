"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The landing page renders its own full-screen frame.
  if (pathname === "/") return <>{children}</>;

  return (
    <div className="flex min-h-dvh flex-col bg-[linear-gradient(180deg,#8aa4e8_0%,#b7c9f3_22%,#dbe6fb_45%,#f3f6fd_68%,#ffffff_88%)] p-3 sm:p-4">
      <div className="relative flex flex-1 flex-col rounded-[28px] bg-[linear-gradient(180deg,#f6f8ff_0%,#ffffff_38%)] sm:rounded-[36px]">
        <nav className="flex shrink-0 items-center justify-between px-6 py-3 sm:px-8 sm:py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-base font-semibold text-white">
              Q
            </span>
            <span className="text-lg font-semibold tracking-tight text-neutral-950">
              QuizCraft
            </span>
          </Link>
          <Link
            href="/"
            className="rounded-full border-2 border-neutral-200 px-5 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-100"
          >
            New reviewer
          </Link>
        </nav>
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
