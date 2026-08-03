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
    <div className="mp-print-bg flex min-h-dvh flex-col bg-[linear-gradient(180deg,#e9dcfa_0%,#eee3fb_22%,#f4ecfc_45%,#faf5fe_68%,#ffffff_82%)] p-3 sm:p-4">
      <div className="mp-print-panel relative flex flex-1 flex-col rounded-[28px] bg-white sm:rounded-[36px]">
        <nav className="relative z-10 flex shrink-0 items-center justify-between px-6 py-3 sm:px-8 sm:py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffe1f0]">
              <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden>
                <defs>
                  <linearGradient id="mp-butterfly-wing" x1="2" y1="2" x2="20" y2="18" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#f9a8d4" />
                    <stop offset="100%" stopColor="#c0189a" />
                  </linearGradient>
                </defs>
                <g fill="none" stroke="#111116" strokeWidth="0.7" strokeLinejoin="round" strokeLinecap="round">
                  <path
                    fill="url(#mp-butterfly-wing)"
                    d="M12 8c.6-2.4 2.4-4.8 5.1-5.3 2.7-.5 4.8 1.3 4.5 3.8-.3 2.5-2.7 4.1-5.7 4.1-1.7 0-3.1-1-3.9-2.2z"
                  />
                  <path
                    fill="url(#mp-butterfly-wing)"
                    d="M12 10.2c1-.8 2.6-.9 4-.2 2.1 1 3 3.3 1.7 5.3-1.3 2-4 2.3-5.4.7-.6-.7-.4-1.8-.3-2.8z"
                  />
                  <path
                    fill="url(#mp-butterfly-wing)"
                    d="M12 8c-.6-2.4-2.4-4.8-5.1-5.3-2.7-.5-4.8 1.3-4.5 3.8.3 2.5 2.7 4.1 5.7 4.1 1.7 0 3.1-1 3.9-2.2z"
                  />
                  <path
                    fill="url(#mp-butterfly-wing)"
                    d="M12 10.2c-1-.8-2.6-.9-4-.2-2.1 1-3 3.3-1.7 5.3 1.3 2 4 2.3 5.4.7.6-.7.4-1.8.3-2.8z"
                  />
                  <path
                    fill="#831843"
                    stroke="none"
                    d="M12 7.5c.9 0 1.1 1.5 1 3.5-.1 2-.2 4.5-1 6.5-.8-2-.9-4.5-1-6.5-.1-2 .1-3.5 1-3.5z"
                  />
                  <path d="M12.3 7.4c.6-1.3 1.6-2.1 2.4-1.9" strokeLinecap="round" />
                  <path d="M11.7 7.4c-.6-1.3-1.6-2.1-2.4-1.9" strokeLinecap="round" />
                  <circle cx="14.8" cy="5.4" r="0.45" fill="#111116" stroke="none" />
                  <circle cx="9.2" cy="5.4" r="0.45" fill="#111116" stroke="none" />
                  <circle cx="11.6" cy="7.7" r="0.5" fill="#f0973c" stroke="none" />
                  <circle cx="12.4" cy="7.7" r="0.5" fill="#f0973c" stroke="none" />
                </g>
              </svg>
            </span>
            <span className="font-[family-name:var(--font-brand)] text-2xl font-bold tracking-tight text-neutral-950">
              Shajie&apos;s Reviewer
            </span>
          </div>
          {showBack && (
            <button
              type="button"
              onClick={() => router.push("/")}
              aria-label="Back to home"
              className="mp-no-print flex items-center rounded-full border-2 border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-300 hover:bg-neutral-100 sm:px-5"
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
            <div className="mp-no-print flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                aria-label="Download PDF"
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
                  <path d="M12 3v12" />
                  <path d="M7 10l5 5 5-5" />
                  <path d="M4 19h16" />
                </svg>
                <span className="hidden sm:inline">Download PDF</span>
              </button>
              <div id="mp-results-actions" className="flex flex-col items-end gap-2" />
            </div>
          )}
        </nav>
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
