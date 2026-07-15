"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  TIME_LIMIT_OPTIONS,
  type Difficulty,
  type QuestionType,
} from "@/lib/schemas";

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  easy: "Straightforward recall of the main ideas and definitions from your reviewer.",
  medium: "A balanced mix of recall and understanding, the classic exam feel.",
  hard: "Tricky details, applications, and subtly wrong answers. Prove you know it.",
};

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts: string[] = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s) parts.push(`${s}s`);
  return parts.join(" ") || "0s";
}

function clampPart(value: number, max: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(0, Math.trunc(value)));
}

export default function ConfigureForm({ reviewerId }: { reviewerId: string }) {
  const router = useRouter();
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [types, setTypes] = useState<QuestionType[]>([...QUESTION_TYPES]);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | null>(null);
  const [customTime, setCustomTime] = useState(false);
  const [customSeconds, setCustomSeconds] = useState(20 * 60);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [pickH, setPickH] = useState(0);
  const [pickM, setPickM] = useState(20);
  const [pickS, setPickS] = useState(0);
  const [pickError, setPickError] = useState<string | null>(null);
  const [choosingDifficulty, setChoosingDifficulty] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const estimatedSeconds = Math.round((8000 + totalQuestions * 1200) / 1000);

  // Estimated progress: creep toward 95% over the expected duration, then
  // jump to 100% when the server actually responds.
  useEffect(() => {
    if (!generating) return;
    setProgress(0);
    const tickMs = 200;
    const step = 95 / ((estimatedSeconds * 1000) / tickMs);
    const id = setInterval(() => {
      setProgress((p) => Math.min(95, p + step));
    }, tickMs);
    return () => clearInterval(id);
  }, [generating, estimatedSeconds]);

  const progressLabel =
    progress < 25
      ? "Reading your reviewer…"
      : progress < 60
        ? `Writing ${totalQuestions} questions…`
        : progress < 95
          ? "Double-checking the answers…"
          : "Almost done…";

  function toggleType(type: QuestionType) {
    setTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  function openTimePicker() {
    setPickH(Math.floor(customSeconds / 3600));
    setPickM(Math.floor((customSeconds % 3600) / 60));
    setPickS(customSeconds % 60);
    setPickError(null);
    setTimePickerOpen(true);
  }

  function confirmTimePicker() {
    const total = pickH * 3600 + pickM * 60 + pickS;
    if (total < 1) {
      setPickError("Set a time limit greater than zero.");
      return;
    }
    if (total > 10800) {
      setPickError("Time limit can be at most 3 hours.");
      return;
    }
    setCustomSeconds(total);
    setCustomTime(true);
    setTimeLimitMinutes(null);
    setTimePickerOpen(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (types.length === 0) {
      setError("Select at least one question type.");
      return;
    }
    setDifficulty(null);
    setChoosingDifficulty(true);
  }

  async function generate() {
    if (generating || difficulty === null) return;
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch(`/api/reviewers/${reviewerId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalQuestions,
          types,
          difficulty,
          timeLimitMinutes: customTime ? null : timeLimitMinutes,
          timeLimitSeconds: customTime ? customSeconds : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Question generation failed.");

      setProgress(100);
      router.push(`/quiz/${reviewerId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setGenerating(false);
    }
  }

  return (
    <>
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
              {QUESTION_TYPES.map((type) => {
                const selected = types.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    aria-pressed={selected}
                    className={`chip ${selected ? "chip-on" : ""}`}
                  >
                    <span className="chip-check" aria-hidden="true">
                      {selected ? "✓" : "+"}
                    </span>
                    {QUESTION_TYPE_LABELS[type]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-bold">
              Time limit{" "}
              <span className="font-normal text-[var(--color-neutral-500)]">(optional)</span>
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              {TIME_LIMIT_OPTIONS.map((minutes) => {
                const selected = !customTime && timeLimitMinutes === minutes;
                return (
                  <button
                    key={minutes ?? "none"}
                    type="button"
                    onClick={() => {
                      setCustomTime(false);
                      setTimeLimitMinutes(minutes);
                    }}
                    aria-pressed={selected}
                    className={`chip ${selected ? "chip-on" : ""}`}
                  >
                    {minutes === null ? "No limit" : `${minutes} min`}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={openTimePicker}
                aria-pressed={customTime}
                className={`chip ${customTime ? "chip-on" : ""}`}
              >
                {customTime ? `Custom · ${formatDuration(customSeconds)}` : "Custom"}
              </button>
            </div>
          </div>
        </div>

        {error && !choosingDifficulty && (
          <p className="text-sm font-semibold text-[var(--color-accent-800)]">{error}</p>
        )}

        <button type="submit" className="btn btn-primary self-center">
          Confirm
        </button>
      </form>

      {timePickerOpen && (
        <div
          className="timepick-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Custom time limit"
          onClick={() => setTimePickerOpen(false)}
        >
          <div className="timepick" onClick={(e) => e.stopPropagation()}>
            <h2 className="timepick-title">Custom time limit</h2>
            <div className="timepick-fields">
              <span className="timepick-field">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={3}
                  value={pickH}
                  autoFocus
                  onChange={(e) => setPickH(clampPart(Number(e.target.value), 3))}
                  aria-label="Hours"
                  className="timepick-input"
                />
                <span className="timepick-unit">hours</span>
              </span>
              <span className="timepick-colon" aria-hidden>
                :
              </span>
              <span className="timepick-field">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={59}
                  value={pickM}
                  onChange={(e) => setPickM(clampPart(Number(e.target.value), 59))}
                  aria-label="Minutes"
                  className="timepick-input"
                />
                <span className="timepick-unit">minutes</span>
              </span>
              <span className="timepick-colon" aria-hidden>
                :
              </span>
              <span className="timepick-field">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={59}
                  value={pickS}
                  onChange={(e) => setPickS(clampPart(Number(e.target.value), 59))}
                  aria-label="Seconds"
                  className="timepick-input"
                />
                <span className="timepick-unit">seconds</span>
              </span>
            </div>
            {pickError && (
              <p className="text-sm font-semibold text-[var(--color-accent-800)]">
                {pickError}
              </p>
            )}
            <div className="timepick-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setTimePickerOpen(false)}
              >
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={confirmTimePicker}>
                Set limit
              </button>
            </div>
          </div>
        </div>
      )}

      {choosingDifficulty && (
        <div
          className="difficulty-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Choose difficulty"
          onClick={() => {
            if (!generating) setChoosingDifficulty(false);
          }}
        >
          <div className="difficulty-stage" onClick={(e) => e.stopPropagation()}>
            {generating ? (
              <div className="gen-loading" role="status" aria-live="polite">
                <h2 className="text-2xl text-white">Making your quiz…</h2>
                <p className="text-[15px] text-white/70">{progressLabel}</p>
                <div className="gen-progress-track">
                  <div className="gen-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-lg font-bold text-white">{Math.round(progress)}%</p>
                <p className="text-xs text-white/50">
                  Usually takes about {estimatedSeconds} seconds — keep this tab open.
                </p>
              </div>
            ) : (
              <>
            <div className="flex flex-col items-center gap-1 text-center">
              <h2 className="text-2xl text-white">How hard should it be?</h2>
              <p className="text-[15px] text-white/70">
                Pick a difficulty and we&apos;ll write your {totalQuestions} questions.
              </p>
            </div>

            <div className="difficulty-fan">
              {DIFFICULTIES.map((level) => {
                const selected = difficulty === level;
                return (
                  <button
                    key={level}
                    type="button"
                    disabled={generating}
                    aria-pressed={selected}
                    onClick={() => setDifficulty(level)}
                    className={`difficulty-card difficulty-${level} ${
                      selected ? "difficulty-card-selected" : ""
                    }`}
                  >
                    <span className="difficulty-heading">
                      <span className="difficulty-title">{DIFFICULTY_LABELS[level]}</span>
                      <span className="difficulty-radio" aria-hidden="true" />
                    </span>
                    <span className="difficulty-desc">{DIFFICULTY_DESCRIPTIONS[level]}</span>
                  </button>
                );
              })}
            </div>

            {error && <p className="text-sm font-semibold text-[#ffc9bf]">{error}</p>}

            <div className="difficulty-actions">
              <button
                type="button"
                className="btn btn-ghost"
                disabled={generating}
                onClick={() => setChoosingDifficulty(false)}
              >
                Back to setup
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={difficulty === null || generating}
                onClick={generate}
              >
                Generate quiz
              </button>
            </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
