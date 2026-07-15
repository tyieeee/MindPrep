"use client";

import { usePathname, useRouter } from "next/navigation";

export default function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // The landing page renders its own full-screen frame.
  if (pathname === "/") return <>{children}</>;

  // No back button on results (it gets a Home button instead) or during a
  // quiz (leaving mid-quiz would lose the answers).
  const showBack =
    !pathname.startsWith("/results") && !pathname.startsWith("/quiz");
  const showHome = pathname.startsWith("/results");

  return (
    <div className="flex min-h-dvh flex-col bg-[linear-gradient(180deg,#8aa4e8_0%,#b7c9f3_22%,#dbe6fb_45%,#f3f6fd_68%,#ffffff_88%)] p-3 sm:p-4">
      <div className="relative flex flex-1 flex-col rounded-[28px] bg-[linear-gradient(180deg,#f6f8ff_0%,#ffffff_38%)] sm:rounded-[36px]">
        <nav className="relative z-10 flex shrink-0 items-center justify-between px-6 py-3 sm:px-8 sm:py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-base font-semibold text-white">
              Q
            </span>
            <span className="text-lg font-semibold tracking-tight text-neutral-950">
              QuizCraft
            </span>
          </div>
          {showBack && (
            <button
              type="button"
              onClick={() => router.push("/")}
              aria-label="Back to home"
              className="flex items-center rounded-full border-2 border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-100 sm:px-5"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="sm:hidden"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          {showHome && (
            <button
              type="button"
              onClick={() => router.push("/")}
              aria-label="Back to home"
              className="flex items-center rounded-full border-2 border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-100 sm:px-5"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="sm:hidden"
              >
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 9.5V21h5v-6h4v6h5V9.5" />
              </svg>
              <span className="hidden sm:inline">Home</span>
            </button>
          )}
        </nav>
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
