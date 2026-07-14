"use client";

import { usePathname } from "next/navigation";

export default function FloatingBooks() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <div aria-hidden="true" className="floating-books">
      <svg
        viewBox="0 0 160 160"
        className="floating-books-left"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="80" cy="148" rx="58" ry="8" fill="var(--color-neutral-900)" opacity="0.08" />
        <g transform="translate(20 78) rotate(-6)">
          <rect x="0" y="28" width="100" height="20" rx="4" fill="var(--color-accent-2)" />
          <rect x="4" y="30" width="92" height="4" rx="2" fill="var(--color-accent2-100)" opacity="0.5" />
        </g>
        <g transform="translate(26 58) rotate(4)">
          <rect x="0" y="18" width="92" height="20" rx="4" fill="var(--color-accent)" />
          <rect x="4" y="20" width="84" height="4" rx="2" fill="var(--color-accent-100)" opacity="0.55" />
        </g>
        <g transform="translate(16 34) rotate(-3)">
          <rect x="0" y="0" width="96" height="22" rx="4" fill="var(--color-neutral-800)" />
          <rect x="4" y="2" width="88" height="4" rx="2" fill="var(--color-neutral-100)" opacity="0.4" />
        </g>
        <g transform="translate(70 8) rotate(12)">
          <path
            d="M0 34 C0 34 2 4 20 2 C24 1.6 27 3 27 3 L27 34 C27 34 22 30 13.5 30 C5 30 0 34 0 34 Z"
            fill="var(--color-accent2-800)"
          />
          <path
            d="M27 3 C27 3 30 1.6 34 2 C52 4 54 34 54 34 C54 34 49 30 40.5 30 C32 30 27 34 27 34 Z"
            fill="var(--color-accent2-800)"
            opacity="0.85"
          />
        </g>
      </svg>

      <svg
        viewBox="0 0 160 160"
        className="floating-books-right"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="80" cy="150" rx="56" ry="8" fill="var(--color-neutral-900)" opacity="0.08" />
        <g transform="translate(30 92) rotate(5)">
          <rect x="0" y="26" width="98" height="20" rx="4" fill="var(--color-neutral-700)" />
          <rect x="4" y="28" width="90" height="4" rx="2" fill="var(--color-neutral-100)" opacity="0.4" />
        </g>
        <g transform="translate(22 68) rotate(-5)">
          <rect x="0" y="20" width="94" height="20" rx="4" fill="var(--color-accent-2)" />
          <rect x="4" y="22" width="86" height="4" rx="2" fill="var(--color-accent2-100)" opacity="0.5" />
        </g>
        <g transform="translate(30 44) rotate(3)">
          <rect x="0" y="0" width="90" height="22" rx="4" fill="var(--color-accent)" />
          <rect x="4" y="2" width="82" height="4" rx="2" fill="var(--color-accent-100)" opacity="0.55" />
        </g>
        <circle cx="118" cy="30" r="15" fill="var(--color-accent2-300)" opacity="0.9" />
        <path
          d="M118 20 C112 22 108 27 108 33"
          stroke="var(--color-accent2-900)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
