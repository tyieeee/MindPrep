"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QUESTION_TYPE_LABELS } from "@/lib/schemas";
import QuestionInput, { type QuizQuestion } from "@/components/QuestionInput";

export default function QuizForm({ reviewerId }: { reviewerId: string }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/reviewers/${reviewerId}/questions`)
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions))
      .catch(() => setError("Could not load the quiz."));
  }, [reviewerId]);

  async function handleSubmit() {
    if (!questions) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewerId,
          answers: questions.map((q) => ({
            questionId: q.id,
            userAnswer: answers[q.id] ?? "",
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed.");
      router.push(`/results/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  if (error && !questions) {
    return <p className="text-sm font-semibold text-[var(--color-accent-800)]">{error}</p>;
  }

  if (!questions) {
    return <p className="text-sm text-[var(--color-neutral-600)]">Loading quiz…</p>;
  }

  const answeredCount = questions.filter((q) => (answers[q.id] ?? "").trim() !== "").length;
  const progressPct = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold">
            {answeredCount} of {questions.length} answered
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {questions.map((question, i) => (
        <div key={question.id} className="card flex flex-col gap-4">
          <span className="tag tag-accent self-start">
            {i + 1}. {QUESTION_TYPE_LABELS[question.type]}
          </span>
          <p className="text-lg font-semibold leading-snug">{question.prompt}</p>
          <QuestionInput
            question={question}
            value={answers[question.id] ?? ""}
            onChange={(value) =>
              setAnswers((prev) => ({ ...prev, [question.id]: value }))
            }
          />
        </div>
      ))}

      {error && <p className="text-sm font-semibold text-[var(--color-accent-800)]">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="btn btn-primary self-start"
      >
        {submitting ? "Grading…" : "Submit answers"}
      </button>
    </div>
  );
}
