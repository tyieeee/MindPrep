import Image from "next/image";

type PhotoSquare = {
  left: string;
  top: string;
  rotate: string;
  size: string;
  src: string;
};

const leftCluster: PhotoSquare[] = [
  { left: "13.5%", top: "43%", rotate: "-18deg", size: "11vw", src: "/images/us-1.jpg" },
  { left: "13%", top: "59%", rotate: "-26deg", size: "10.5vw", src: "/images/us-2.jpg" },
  { left: "21.5%", top: "65.5%", rotate: "-6deg", size: "10vw", src: "/images/us-3.jpg" },
];

const rightCluster: PhotoSquare[] = [
  { left: "86.5%", top: "41%", rotate: "18deg", size: "11vw", src: "/images/us-4.jpg" },
  { left: "87%", top: "59%", rotate: "26deg", size: "10.5vw", src: "/images/us-5.jpg" },
  { left: "82%", top: "65.5%", rotate: "6deg", size: "10vw", src: "/images/us-6.jpg" },
];

function PhotoSquares({ squares }: { squares: PhotoSquare[] }) {
  return squares.map((square, i) => (
    <div
      key={i}
      className="pointer-events-none absolute"
      style={{
        left: square.left,
        top: square.top,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className="floating-photo relative overflow-hidden rounded-2xl border border-black/10 bg-neutral-200 shadow-[0_14px_30px_rgba(20,10,40,0.18)]"
        style={
          {
            width: `clamp(100px, ${square.size}, 185px)`,
            aspectRatio: "1 / 1",
            rotate: square.rotate,
            "--float-dur": `${5.5 + (i % 3) * 0.8}s`,
            "--float-delay": `${i * -0.9}s`,
          } as React.CSSProperties
        }
      >
        <Image
          src={square.src}
          alt="A photo of us"
          fill
          sizes="220px"
          className="object-cover"
        />
      </div>
    </div>
  ));
}

export default function FloatingPhoto() {
  return (
    <div aria-hidden className="absolute inset-0 z-[6] hidden lg:block">
      <PhotoSquares squares={leftCluster} />
      <PhotoSquares squares={rightCluster} />
    </div>
  );
}
