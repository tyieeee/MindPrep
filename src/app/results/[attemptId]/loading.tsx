export default function ResultsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-10 pb-20">
      <div className="flex animate-pulse flex-col items-center gap-6 text-center">
        <div className="h-32 w-32 rounded-full bg-[var(--color-neutral-200)]" />
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-64 rounded-full bg-[var(--color-neutral-200)]" />
          <div className="h-4 w-80 max-w-full rounded-full bg-[var(--color-neutral-200)]" />
          <div className="mt-1 flex gap-3">
            <div className="h-11 w-36 rounded-full bg-[var(--color-neutral-200)]" />
            <div className="h-11 w-44 rounded-full bg-[var(--color-neutral-200)]" />
          </div>
        </div>
      </div>

      <div className="flex animate-pulse flex-col gap-4">
        <div className="h-7 w-40 rounded-full bg-[var(--color-neutral-200)]" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-2xl border border-[var(--color-neutral-200)] p-5">
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded-full bg-[var(--color-neutral-200)]" />
                <div className="h-6 w-28 rounded-full bg-[var(--color-neutral-200)]" />
              </div>
              <div className="h-4 w-full rounded-full bg-[var(--color-neutral-200)]" />
              <div className="h-4 w-3/4 rounded-full bg-[var(--color-neutral-200)]" />
              <div className="h-4 w-1/2 rounded-full bg-[var(--color-neutral-200)]" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
