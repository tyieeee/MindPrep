"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { QUESTION_TYPE_LABELS } from "@/lib/schemas";
import QuestionInput, { type QuizQuestion } from "@/components/QuestionInput";

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const ms = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return h > 0 ? `${h}:${ms}` : ms;
}

export default function QuizForm({
  reviewerId,
  timeLimitSeconds = null,
}: {
  reviewerId: string;
  timeLimitSeconds?: number | null;
}) {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    fetch(`/api/reviewers/${reviewerId}/questions`)
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions))
      .catch(() => setError("Could not load the quiz."));
  }, [reviewerId]);

  const questionsLoaded = questions !== null;

  // Start the countdown once the questions are on screen.
  useEffect(() => {
    if (!questionsLoaded || timeLimitSeconds === null) return;
    setSecondsLeft(timeLimitSeconds);
    const id = setInterval(() => {
      setSecondsLeft((s) => (s === null ? null : Math.max(0, s - 1)));
    }, 1000);
    return () => clearInterval(id);
  }, [questionsLoaded, timeLimitSeconds]);

  const handleSubmit = useCallback(async () => {
    if (!questions || submittedRef.current) return;
    submittedRef.current = true;
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
      submittedRef.current = false;
    }
  }, [questions, answers, reviewerId, router]);

  // Time's up — submit whatever has been answered so far.
  useEffect(() => {
    if (secondsLeft === 0) void handleSubmit();
  }, [secondsLeft, handleSubmit]);

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
      <div className="sticky top-3 z-20 flex flex-col gap-2 rounded-2xl bg-white/90 px-4 py-3 shadow-[0_14px_36px_-14px_rgba(30,40,90,0.35)] backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-bold">
            {answeredCount} of {questions.length} answered
          </span>
          {secondsLeft !== null && (
            <span className={`quiz-timer ${secondsLeft <= 60 ? "quiz-timer-low" : ""}`}>
              <span aria-hidden="true">⏱</span> {formatTime(secondsLeft)}
            </span>
          )}
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        {secondsLeft !== null && secondsLeft > 0 && secondsLeft <= 60 && (
          <p className="text-xs font-bold text-[var(--color-danger-800)]" role="alert">
            Time&apos;s almost up — your answers will be submitted automatically.
          </p>
        )}
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
        onClick={() => setConfirmOpen(true)}
        disabled={submitting}
        className="btn btn-primary self-start"
      >
        {submitting ? "Grading…" : "Submit answers"}
      </button>

      {confirmOpen && (
        <div
          className="timepick-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm submission"
          onClick={() => {
            if (!submitting) setConfirmOpen(false);
          }}
        >
          <div className="timepick" onClick={(e) => e.stopPropagation()}>
            <h2 className="timepick-title">Submit your answers?</h2>
            <p className="text-center text-sm text-[var(--color-neutral-700)]">
              You&apos;ve answered {answeredCount} of {questions.length} questions.
              {answeredCount < questions.length &&
                " Unanswered questions will be counted as wrong."}
            </p>
            <div className="timepick-actions">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={submitting}
                onClick={() => setConfirmOpen(false)}
              >
                Keep answering
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={submitting}
                onClick={() => {
                  setConfirmOpen(false);
                  void handleSubmit();
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
