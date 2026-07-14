"use client";

import type { QuestionType } from "@/lib/schemas";

export type QuizQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  choices: string[] | null;
  order: number;
};

export default function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: QuizQuestion;
  value: string;
  onChange: (value: string) => void;
}) {
  if (question.type === "multiple_choice") {
    return (
      <div className="flex flex-col gap-2.5">
        {(question.choices ?? []).map((choice) => (
          <label key={choice} className="relative">
            <input
              type="radio"
              name={question.id}
              checked={value === choice}
              onChange={() => onChange(choice)}
              className="sr-only"
            />
            <span className={`choice ${value === choice ? "choice-selected" : ""}`}>
              {choice}
            </span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === "true_false") {
    return (
      <div className="flex flex-wrap gap-2.5">
        {["True", "False"].map((choice) => (
          <label key={choice} className="relative">
            <input
              type="radio"
              name={question.id}
              checked={value === choice}
              onChange={() => onChange(choice)}
              className="sr-only"
            />
            <span
              className={`choice w-auto px-6 ${value === choice ? "choice-selected" : ""}`}
            >
              {choice}
            </span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={
        question.type === "fill_blank" ? "Fill in the blank…" : "Your answer…"
      }
      className="input max-w-md"
    />
  );
}
