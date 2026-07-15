export default function WaveLines() {
  return (
    <div aria-hidden className="wave-field">
      <svg
        className="wave wave-right"
        viewBox="0 0 420 920"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          className="wave-stroke"
          pathLength={100}
          d="M 170 30 C 118 18, 102 72, 154 90 C 236 118, 342 96, 372 156 C 400 212, 338 252, 350 316 C 362 374, 412 402, 398 464 C 384 528, 314 542, 328 612 C 341 674, 406 682, 395 746 C 385 806, 332 816, 343 868 C 351 904, 372 906, 368 928"
        />
        <path
          className="wave-glow"
          pathLength={100}
          d="M 170 30 C 118 18, 102 72, 154 90 C 236 118, 342 96, 372 156 C 400 212, 338 252, 350 316 C 362 374, 412 402, 398 464 C 384 528, 314 542, 328 612 C 341 674, 406 682, 395 746 C 385 806, 332 816, 343 868 C 351 904, 372 906, 368 928"
        />
      </svg>
      <svg
        className="wave wave-left"
        viewBox="0 0 460 380"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          className="wave-stroke"
          pathLength={100}
          d="M -10 50 C 90 5, 165 80, 118 150 C 74 216, 190 245, 285 202 C 372 162, 428 248, 355 310 C 302 355, 225 338, 205 390"
        />
        <path
          className="wave-glow"
          pathLength={100}
          d="M -10 50 C 90 5, 165 80, 118 150 C 74 216, 190 245, 285 202 C 372 162, 428 248, 355 310 C 302 355, 225 338, 205 390"
        />
      </svg>
    </div>
  );
}
