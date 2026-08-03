"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const PASS_MARK = 75;

type HistoryItem = {
  id: string;
  title: string;
  createdAt: string;
  attempt: { id: string; score: number; total: number };
};

function ScoreBadge({ attempt }: { attempt: HistoryItem["attempt"] }) {
  const pct = attempt.total > 0 ? Math.round((attempt.score / attempt.total) * 100) : 0;
  const pass = pct >= PASS_MARK;
  const ringColor = pass ? "#15803d" : "#c02626";
  const trackColor = pass ? "var(--color-success-100)" : "var(--color-danger-100)";
  const radius = 54;
  const strokeWidth = 13;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <div className={`score-circle-sm ${pass ? "score-pass" : "score-fail"}`}>
      <svg className="score-ring" viewBox="0 0 128 128" aria-hidden>
        <circle className="score-ring-track" cx="64" cy="64" r={radius} stroke={trackColor} strokeWidth={strokeWidth} />
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
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HistoryPanel({
  open,
  onClose,
  variant = "dock",
  onItemSelect,
}: {
  open: boolean;
  onClose: () => void;
  variant?: "dock" | "overlay";
  onItemSelect?: () => void;
}) {
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);
    fetch("/api/reviewers")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load history.");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setItems(data.items);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your history. Try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const dockClasses = `sticky top-0 z-10 h-dvh shrink-0 self-start overflow-hidden transition-[width] duration-300 ease-out ${
    open ? "w-full max-w-sm" : "w-0"
  }`;
  const overlayClasses = `fixed right-0 top-0 z-50 h-dvh w-full max-w-sm transition-transform duration-300 ease-out ${
    open ? "translate-x-0" : "translate-x-full"
  }`;

  return (
    <aside
      className={`bg-[linear-gradient(180deg,#eee3fb_0%,#f4ecfc_35%,#faf5fe_65%,#ffffff_100%)] shadow-[0_20px_60px_-15px_rgba(124,58,237,0.35)] ${
        variant === "overlay" ? overlayClasses : dockClasses
      }`}
      aria-hidden={!open}
    >
      <div className="flex h-dvh w-full max-w-sm flex-col">
        <div className="flex shrink-0 items-center justify-between px-6 py-5">
          <span
            role="heading"
            aria-level={2}
            className="font-[family-name:var(--font-brand)] text-2xl font-bold tracking-tight text-[var(--color-accent-800)]"
          >
            Shajie&apos;s History
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close history"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-accent-700)] transition hover:bg-[var(--color-accent-200)] hover:text-[var(--color-accent-800)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {error && (
            <p className="px-2 py-4 text-sm font-semibold text-[var(--color-accent-800)]">{error}</p>
          )}
          {!error && items === null && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex animate-pulse items-center gap-4 rounded-2xl border border-[var(--color-accent-200)] bg-white p-4"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded-full bg-[var(--color-accent-100)]" />
                    <div className="h-3 w-1/3 rounded-full bg-[var(--color-neutral-200)]" />
                  </div>
                  <div className="h-12 w-12 shrink-0 rounded-full border-[6px] border-[var(--color-accent-100)]" />
                </div>
              ))}
            </div>
          )}
          {!error && items && items.length === 0 && (
            <p className="px-2 py-4 text-sm text-[var(--color-neutral-600)]">
              No completed quizzes yet — take one to see it here.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {items?.map((item) => (
              <Link
                key={item.id}
                href={`/results/${item.attempt.id}`}
                onClick={onItemSelect}
                className="flex items-center gap-4 rounded-2xl border border-[var(--color-accent-200)] bg-white p-4 shadow-[0_2px_10px_rgba(124,58,237,0.08)] transition hover:border-[var(--color-accent-300)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.16)]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-neutral-950">{item.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
                <ScoreBadge attempt={item.attempt} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
