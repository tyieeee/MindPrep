"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";

const PASSCODE = "021423";
const LENGTH = PASSCODE.length;
const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 10 * 60 * 1000;
const ATTEMPTS_KEY = "mp-upload-attempts";
const LOCKOUT_KEY = "mp-upload-lockout-until";
export const PASSCODE_STORAGE_KEY = "mp-upload-unlocked";

function isLocked() {
  const until = Number(localStorage.getItem(LOCKOUT_KEY) || 0);
  return until > Date.now();
}

export default function PasscodeGate({
  onUnlock,
  onClose,
}: {
  onUnlock: () => void;
  onClose: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [error, setError] = useState(false);
  const [locked, setLocked] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const locked = isLocked();
    setLocked(locked);
    if (!locked) inputsRef.current[0]?.focus();

    const id = setInterval(() => {
      if (!isLocked()) {
        setLocked(false);
        clearInterval(id);
      }
    }, 5000);
    return () => clearInterval(id);
  }, []);

  function submitIfComplete(next: string[]) {
    if (!next.every((d) => d !== "")) return;
    if (next.join("") === PASSCODE) {
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_KEY);
      sessionStorage.setItem(PASSCODE_STORAGE_KEY, "1");
      onUnlock();
      return;
    }

    const attempts = Number(localStorage.getItem(ATTEMPTS_KEY) || 0) + 1;
    if (attempts >= MAX_ATTEMPTS) {
      localStorage.setItem(LOCKOUT_KEY, String(Date.now() + LOCKOUT_MS));
      localStorage.setItem(ATTEMPTS_KEY, "0");
      setLocked(true);
    } else {
      localStorage.setItem(ATTEMPTS_KEY, String(attempts));
    }

    setError(true);
    setDigits(Array(LENGTH).fill(""));
    inputsRef.current[0]?.focus();
    setTimeout(() => setError(false), 400);
  }

  function handleChange(i: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = digit;
    setDigits(next);
    if (digit && i < LENGTH - 1) inputsRef.current[i + 1]?.focus();
    submitIfComplete(next);
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, LENGTH) - 1]?.focus();
    submitIfComplete(next);
  }

  const digitsLeft = digits.filter((d) => d === "").length;

  return (
    <div className="relative flex flex-col items-center gap-3 px-4 py-8 text-center">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-neutral-500)] transition hover:bg-[var(--color-neutral-200)] hover:text-neutral-900"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent-200)]">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-700)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
          <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
        </svg>
      </span>
      <div>
        <p className="text-2xl font-extrabold tracking-tight text-neutral-950">Just for you</p>
        <p className="mt-1 text-sm text-[var(--color-neutral-600)]">
          {locked ? "Too many attempts" : "Enter the passcode to continue"}
        </p>
      </div>

      {locked ? (
        <p className="mt-3 max-w-[16rem] text-sm font-semibold text-[var(--color-accent-800)]">
          This has been locked for a while due to too many wrong attempts. Please try again later.
        </p>
      ) : (
        <>
          <div className={`mt-2 flex gap-2 ${error ? "otp-shake" : ""}`}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                type="password"
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                className="otp-box"
                aria-label={`Digit ${i + 1} of ${LENGTH}`}
              />
            ))}
          </div>
          {error ? (
            <p className="mt-1 text-sm font-semibold text-[var(--color-accent-800)]">
              Incorrect code, try again.
            </p>
          ) : (
            <p className="mt-1 rounded-full bg-[var(--color-accent-100)] px-4 py-1.5 text-sm font-semibold text-[var(--color-accent-700)]">
              {digitsLeft === 0 ? "Checking…" : `${digitsLeft} digit${digitsLeft === 1 ? "" : "s"} left`}
            </p>
          )}
        </>
      )}

      <p className="mt-2 text-sm text-[var(--color-neutral-600)]">
        Forgot?{" "}
        <a
          href="https://web.facebook.com/archie.delacruz.1614"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-600 hover:underline"
        >
          Ask developer
        </a>
      </p>
    </div>
  );
}
