import { QUESTION_TYPE_LABELS, type QuestionType } from "@/lib/schemas";

export type QuestionResult = {
  questionId: string;
  type: QuestionType;
  prompt: string;
  choices: string[] | null;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
};

export default function QuestionResultCard({
  index,
  result,
}: {
  index: number;
  result: QuestionResult;
}) {
  return (
    <div className="card">
      <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
        <span className={result.isCorrect ? "badge-correct" : "badge-wrong"}>
          {result.isCorrect ? "Correct" : "Wrong"}
        </span>
        <span className="tag tag-neutral">{QUESTION_TYPE_LABELS[result.type]}</span>
        <span className="font-bold text-[var(--color-neutral-500)]">Q{index + 1}</span>
      </div>
      <p className="mb-3 text-base font-semibold leading-snug">{result.prompt}</p>
      <div className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 text-[15px]">
        <span className="font-semibold text-[var(--color-neutral-500)]">Your answer</span>
        <span
          className={`font-bold ${
            result.isCorrect ? "text-[var(--color-accent2-800)]" : "text-[var(--color-accent-800)]"
          }`}
        >
          {result.userAnswer || <em>(blank)</em>}
        </span>
        <span className="font-semibold text-[var(--color-neutral-500)]">Correct</span>
        <span className="font-bold text-[var(--color-accent2-800)]">{result.correctAnswer}</span>
      </div>
      <div className="mt-3 rounded-[var(--radius-lg)] bg-[var(--color-accent2-100)] px-4 py-3 text-sm leading-relaxed text-[var(--color-accent2-900)]">
        {result.explanation}
      </div>
    </div>
  );
}
