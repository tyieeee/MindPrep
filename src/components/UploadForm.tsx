"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

type Mode = "paste" | "file";

const ACCEPTED_EXTENSIONS = [".txt", ".pdf", ".docx", ".png", ".jpg", ".jpeg", ".webp"];

export default function UploadForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("file");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragCounter = useRef(0);

  const hasContent = mode === "paste" ? text.trim().length > 0 : file !== null;

  function acceptFile(dropped: File) {
    const ext = dropped.name.slice(dropped.name.lastIndexOf(".")).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setError("Unsupported file type. Use .txt, .pdf, .docx, or a photo.");
      return;
    }
    setError(null);
    setFile(dropped);
  }

  // Watch the whole window for an incoming file drag so the dropzone lights
  // up the moment a file crosses into the browser, not just when it's
  // hovered directly over the small drop target.
  useEffect(() => {
    function hasFiles(e: DragEvent) {
      return Array.from(e.dataTransfer?.types ?? []).includes("Files");
    }

    function onDragEnter(e: DragEvent) {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragCounter.current += 1;
      setMode("file");
      setIsDraggingFile(true);
    }

    function onDragOver(e: DragEvent) {
      if (!hasFiles(e)) return;
      e.preventDefault();
    }

    function onDragLeave(e: DragEvent) {
      if (!hasFiles(e)) return;
      dragCounter.current = Math.max(0, dragCounter.current - 1);
      if (dragCounter.current === 0) setIsDraggingFile(false);
    }

    function onDrop(e: DragEvent) {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragCounter.current = 0;
      setIsDraggingFile(false);
      const dropped = e.dataTransfer?.files?.[0];
      if (dropped) acceptFile(dropped);
    }

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "paste" && !text.trim()) {
      setError("Paste your reviewer text first.");
      return;
    }
    if (mode === "file" && !file) {
      setError("Choose a file to upload.");
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      const fallbackTitle =
        mode === "file" && file
          ? file.name.replace(/\.[^./\\]+$/, "")
          : "Untitled Reviewer";
      form.set("title", fallbackTitle || "Untitled Reviewer");
      if (mode === "paste") {
        form.set("text", text);
      } else if (file) {
        form.set("file", file);
      }

      const res = await fetch("/api/reviewers", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");

      router.push(`/configure/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="relative rounded-[22px] bg-white p-5 shadow-[0_20px_60px_-15px_rgba(30,40,90,0.25)] sm:p-7">
      {isDraggingFile && (
        <div className="drop-overlay-page" aria-hidden="true">
          <span className="drop-overlay-ring">
            <span className="drop-overlay-icon">↓</span>
          </span>
          <span className="drop-overlay-title">Drop it to upload</span>
          <span className="drop-overlay-subtitle">
            .txt, .pdf, .docx, or a photo — we&apos;ll turn it into a quiz
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`chip ${mode === "file" ? "chip-on" : ""}`}
          >
            Upload file
          </button>
          <button
            type="button"
            onClick={() => setMode("paste")}
            className={`chip ${mode === "paste" ? "chip-on" : ""}`}
          >
            Paste text
          </button>
        </div>

        {mode === "paste" ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Paste your reviewer / study notes here..."
            className="input"
          />
        ) : (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reviewer-file"
              className={`dropzone ${isDraggingFile ? "dropzone-active" : ""}`}
            >
              <span className="dropzone-icon">↑</span>
              <span>
                <span className="block text-[15px] font-bold">
                  {file ? `✓ ${file.name}` : "Upload your reviewer file"}
                </span>
                <span className="block text-sm text-[var(--color-neutral-600)]">
                  .txt, .pdf, .docx, or a photo · drag & drop or click to browse
                </span>
              </span>
            </label>
            <input
              id="reviewer-file"
              type="file"
              accept=".txt,.pdf,.docx,.png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                const picked = e.target.files?.[0];
                if (picked) acceptFile(picked);
              }}
              className="hidden"
            />
            <p className="text-xs text-[var(--color-neutral-600)]">
              Supports .txt, .pdf, .docx, or a photo/scan of your notes (OCR).
            </p>
          </div>
        )}

        {error && <p className="text-sm font-semibold text-[var(--color-accent-800)]">{error}</p>}

        {hasContent && (
          <button type="submit" disabled={submitting} className="btn btn-primary self-start">
            {submitting ? "Uploading…" : "Continue"}
          </button>
        )}
      </form>
    </div>
  );
}
