import ResultsNavActions from "@/components/ResultsNavActions";

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
  const ringColor = pass ? "#15803d" : "#c02626";
  const trackColor = pass ? "var(--color-success-100)" : "var(--color-danger-100)";

  const radius = 54;
  const strokeWidth = 13;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <ResultsNavActions reviewerId={reviewerId} />
      <div className={`score-circle ${circleClass}`}>
        <svg className="score-ring" viewBox="0 0 128 128" aria-hidden>
          <circle
            className="score-ring-track"
            cx="64"
            cy="64"
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            className="score-ring-fill"
            cx="64"
            cy="64"
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <span className="score-pct">{pct}%</span>
        <div className="score-sub">
          <span className="score-divider" style={{ background: ringColor }} />
          <span className="text-xs font-bold tracking-wide opacity-85">
            {score} / {total}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl sm:text-4xl">{reviewerTitle}</h1>
        <p className="max-w-[44ch] text-[var(--color-neutral-700)]">
          {perfect
            ? "Perfect score — you've mastered this reviewer!"
            : pass
              ? "Well reviewed — you know this material well."
              : "Keep reviewing — check the answers below, each one has an explanation."}
        </p>
      </div>
    </div>
  );
}
