import Link from "next/link";

const PASS_MARK = 75;

export default function ResultsSummary({
  reviewerId,
  reviewerTitle,
  score,
  total,
}: {
  reviewerId: string;
  reviewerTitle: string;
  score: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const pass = pct >= PASS_MARK;
  const perfect = pct === 100;
  const circleClass = pass ? "score-pass" : "score-fail";

  return (
    <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:flex-wrap sm:text-left">
      <div className={`score-circle ${circleClass}`}>
        <span className="text-4xl leading-none">{pct}%</span>
        <span className="text-xs opacity-85">
          {score} / {total}
        </span>
      </div>
      <div className="flex flex-col items-center gap-2 sm:items-start">
        <h1 className="text-3xl sm:text-4xl">{reviewerTitle}</h1>
        <p className="max-w-[44ch] text-[var(--color-neutral-700)]">
          {perfect
            ? "Perfect score — you've mastered this reviewer!"
            : pass
              ? "Well reviewed — you know this material well."
              : "Keep reviewing — check the answers below, each one has an explanation."}
        </p>
        <div className="mt-1 flex flex-wrap justify-center gap-3 sm:justify-start">
          <Link href={`/quiz/${reviewerId}`} className="btn btn-primary">
            Retake this quiz
          </Link>
          <Link href={`/configure/${reviewerId}`} className="btn btn-secondary">
            New quiz, same reviewer
          </Link>
        </div>
      </div>
    </div>
  );
}
