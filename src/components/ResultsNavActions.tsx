"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

export default function ResultsNavActions({ reviewerId }: { reviewerId: string }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.getElementById("mp-results-actions"));
  }, []);

  if (!target) return null;

  return createPortal(
    <>
      <Link href={`/configure/${reviewerId}`} className="btn btn-secondary">
        New quiz, same reviewer
      </Link>
      <Link href={`/quiz/${reviewerId}`} className="btn btn-primary">
        Retake this quiz
      </Link>
    </>,
    target
  );
}
