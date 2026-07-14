"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { QUESTION_TYPES, QUESTION_TYPE_LABELS, type QuestionType } from "@/lib/schemas";

export default function ConfigureForm({ reviewerId }: { reviewerId: string }) {
  const router = useRouter();
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [types, setTypes] = useState<QuestionType[]>([...QUESTION_TYPES]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleType(type: QuestionType) {
    setTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (types.length === 0) {
      setError("Select at least one question type.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/reviewers/${reviewerId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalQuestions, types }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Question generation failed.");

      router.push(`/quiz/${reviewerId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="card flex flex-col gap-6">
        <div>
          <label htmlFor="totalQuestions" className="mb-2 block text-sm font-bold">
            Number of questions
          </label>
          <input
            id="totalQuestions"
            type="number"
            min={1}
            max={50}
            value={totalQuestions}
            onChange={(e) => setTotalQuestions(Number(e.target.value))}
            className="input w-28"
          />
        </div>

        <div>
          <span className="mb-2 block text-sm font-bold">Question types</span>
          <div className="flex flex-wrap gap-2.5">
            {QUESTION_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`chip ${types.includes(type) ? "chip-on" : ""}`}
              >
                {QUESTION_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-sm font-semibold text-[var(--color-accent-800)]">{error}</p>}

      <div className="flex items-center gap-4">
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? "Generating quiz…" : "Generate quiz"}
        </button>
        {submitting && (
          <p className="text-sm text-[var(--color-neutral-600)]">
            This can take a bit for larger quizzes — the AI is reading your
            reviewer and writing questions.
          </p>
        )}
      </div>
    </form>
  );
}
