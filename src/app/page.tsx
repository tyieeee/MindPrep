import UploadForm from "@/components/UploadForm";

export default function HomePage() {
  return (
    <div className="flex h-dvh flex-col overflow-y-auto bg-[linear-gradient(180deg,#8aa4e8_0%,#b7c9f3_22%,#dbe6fb_45%,#f3f6fd_68%,#ffffff_88%)] p-3 sm:p-4">
      <main className="relative flex flex-1 flex-col rounded-[28px] bg-[linear-gradient(180deg,#f6f8ff_0%,#ffffff_38%)] sm:rounded-[36px]">
        <div className="relative z-10 flex min-h-full flex-1 flex-col">
          <nav className="flex shrink-0 items-center justify-between px-6 py-3 sm:px-8 sm:py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-base font-semibold text-white">
                Q
              </span>
              <span className="text-lg font-semibold tracking-tight text-neutral-950">
                QuizCraft
              </span>
            </div>
            <a
              href="#upload"
              className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
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

            <div id="upload" className="theme-landing w-full max-w-lg pt-1">
              <UploadForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
