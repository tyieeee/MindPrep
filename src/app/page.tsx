import UploadForm from "@/components/UploadForm";
import FloatingLights from "@/components/FloatingLights";
import WaveLines from "@/components/WaveLines";

export default function HomePage() {
  return (
    <div className="flex h-dvh flex-col overflow-y-auto bg-[linear-gradient(180deg,#e9dcfa_0%,#eee3fb_22%,#f4ecfc_45%,#faf5fe_68%,#ffffff_82%)] p-3 sm:p-4">
      <main className="relative flex flex-1 flex-col rounded-[28px] bg-white sm:rounded-[36px]">
        <FloatingLights />
        <WaveLines />
        <div className="relative z-10 flex min-h-full flex-1 flex-col">
          <nav className="flex shrink-0 items-center justify-between px-6 py-3 sm:px-8 sm:py-4">
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
            <a
              href="#upload"
              className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]"
            >
              Get started
            </a>
          </nav>

          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-2 text-center">
            <h1 className="landing-hero-heading max-w-4xl text-[clamp(2.4rem,7.5vh,4.75rem)] leading-[1.05] text-[#0d0d12]">
              Turn your notes into a quiz that actually tests you.
            </h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-[#6b7185] sm:text-[17px]">
              Upload a PDF, DOCX, photo, or pasted notes and get a
              self-graded quiz in seconds — no account needed.
            </p>

            <div id="upload" className="w-full max-w-lg pt-1">
              <UploadForm />
            </div>
          </div>

          <footer className="shrink-0 pb-4 pt-2 text-center text-xs font-medium text-[var(--color-neutral-500)]">
            Developed by Archie Dela Cruz
          </footer>
        </div>
      </main>
    </div>
  );
}
