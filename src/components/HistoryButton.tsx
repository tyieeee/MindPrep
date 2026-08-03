"use client";

import { useHistory } from "@/components/HistoryProvider";

export default function HistoryButton() {
  const { requestOpen } = useHistory();

  return (
    <button
      type="button"
      onClick={requestOpen}
      className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]"
    >
      Shajie&apos;s History
    </button>
  );
}
