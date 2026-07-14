export default function LandingDecor() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px] sm:rounded-[40px]"
    >
      <svg
        viewBox="0 0 400 400"
        className="landing-float-a absolute -right-20 -top-24 h-[300px] w-[300px] opacity-80 sm:h-[420px] sm:w-[420px]"
        fill="none"
      >
        <defs>
          <linearGradient id="ribbon-a" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
            <stop stopColor="#eef3ff" />
            <stop offset="1" stopColor="#94ade4" />
          </linearGradient>
        </defs>
        <path
          d="M40 360 C160 320 140 160 260 120 C340 94 360 40 340 -10"
          stroke="url(#ribbon-a)"
          strokeWidth="26"
          strokeLinecap="round"
        />
        <path
          d="M90 380 C200 330 190 190 300 150"
          stroke="url(#ribbon-a)"
          strokeOpacity="0.5"
          strokeWidth="14"
          strokeLinecap="round"
        />
      </svg>

      <svg
        viewBox="0 0 400 400"
        className="landing-float-b absolute -bottom-20 -left-20 h-[260px] w-[260px] opacity-75 sm:h-[360px] sm:w-[360px]"
        fill="none"
      >
        <defs>
          <linearGradient id="ribbon-b" x1="400" y1="400" x2="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#eef3ff" />
            <stop offset="1" stopColor="#94ade4" />
          </linearGradient>
        </defs>
        <path
          d="M360 40 C260 90 280 230 160 270 C80 296 60 350 80 400"
          stroke="url(#ribbon-b)"
          strokeWidth="24"
          strokeLinecap="round"
        />
      </svg>

      <svg
        viewBox="0 0 100 70"
        className="landing-float-c absolute bottom-7 left-7 h-14 w-20 opacity-90 sm:bottom-10 sm:left-10 sm:h-16 sm:w-24"
      >
        <g transform="translate(6 34) rotate(-5)">
          <rect x="0" y="14" width="70" height="15" rx="3.5" fill="#3b5bdb" />
        </g>
        <g transform="translate(10 20) rotate(4)">
          <rect x="0" y="8" width="64" height="15" rx="3.5" fill="#16171d" />
        </g>
        <g transform="translate(4 4) rotate(-3)">
          <rect x="0" y="0" width="68" height="16" rx="3.5" fill="#9db4ea" />
        </g>
      </svg>

      <svg
        viewBox="0 0 100 70"
        className="landing-float-b absolute bottom-6 right-10 h-10 w-16 opacity-80 sm:bottom-8 sm:right-16 sm:h-12 sm:w-20"
      >
        <g transform="translate(8 30) rotate(6)">
          <rect x="0" y="10" width="60" height="14" rx="3.5" fill="#101014" />
        </g>
        <g transform="translate(4 12) rotate(-4)">
          <rect x="0" y="0" width="64" height="16" rx="3.5" fill="#c7d3f5" />
        </g>
      </svg>
    </div>
  );
}
