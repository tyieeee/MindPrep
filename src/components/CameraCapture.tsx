"use client";

import { useEffect, useRef, useState } from "react";

type CaptureMode = "single" | "batch";

const MAX_SHOTS = 12;

export default function CameraCapture({
  onDone,
  onClose,
}: {
  onDone: (photos: File[]) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const shotCounter = useRef(0);
  const previewsRef = useRef<string[]>([]);
  const [mode, setMode] = useState<CaptureMode>("single");
  const [shots, setShots] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [cameraError, setCameraError] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 2560 },
            height: { ideal: 1440 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        if (!cancelled) setCameraError(true);
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);
  useEffect(
    () => () => previewsRef.current.forEach((url) => URL.revokeObjectURL(url)),
    []
  );

  function takeShot() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    if (mode === "batch" && shots.length >= MAX_SHOTS) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        shotCounter.current += 1;
        const photo = new File([blob], `scan-${shotCounter.current}.jpg`, {
          type: "image/jpeg",
        });
        if (mode === "single") {
          onDone([photo]);
          return;
        }
        setShots((s) => [...s, photo]);
        setPreviews((p) => [...p, URL.createObjectURL(photo)]);
        setFlash(true);
        setTimeout(() => setFlash(false), 160);
      },
      "image/jpeg",
      0.85
    );
  }

  function switchMode(next: CaptureMode) {
    if (next === mode) return;
    previews.forEach((url) => URL.revokeObjectURL(url));
    setShots([]);
    setPreviews([]);
    setMode(next);
  }

  function removeShot(index: number) {
    URL.revokeObjectURL(previews[index]);
    setShots((s) => s.filter((_, i) => i !== index));
    setPreviews((p) => p.filter((_, i) => i !== index));
  }

  return (
    <div className="camera-overlay" role="dialog" aria-label="Take a photo of your notes">
      <div className="camera-top">
        <button type="button" onClick={onClose} className="camera-close" aria-label="Close camera">
          ✕
        </button>
        <div className="camera-mode-toggle" role="tablist" aria-label="Capture mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "single"}
            onClick={() => switchMode("single")}
            className={`camera-mode-btn ${mode === "single" ? "camera-mode-on" : ""}`}
          >
            Single
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "batch"}
            onClick={() => switchMode("batch")}
            className={`camera-mode-btn ${mode === "batch" ? "camera-mode-on" : ""}`}
          >
            Batch
          </button>
        </div>
        <span className="camera-count">
          {mode === "batch" && shots.length > 0 ? `${shots.length}/${MAX_SHOTS}` : ""}
        </span>
      </div>

      {cameraError ? (
        <div className="camera-fallback">
          <p className="camera-fallback-title">Camera unavailable</p>
          <p className="camera-fallback-text">
            We couldn&apos;t open your camera. You can still take photos with your
            phone&apos;s camera app instead.
          </p>
          <label className="btn btn-primary">
            Open camera app
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []);
                if (picked.length > 0) onDone(picked.slice(0, MAX_SHOTS));
              }}
            />
          </label>
        </div>
      ) : (
        <div className="camera-stage">
          <video ref={videoRef} className="camera-video" autoPlay playsInline muted />
          {flash && <div className="camera-flash" aria-hidden />}
          <p className="camera-hint">
            {mode === "batch"
              ? "Snap every page, then tap Done."
              : "Line up your notes and tap the shutter."}
          </p>
        </div>
      )}

      {!cameraError && (
        <div className="camera-bottom">
          {mode === "batch" && previews.length > 0 && (
            <div className="camera-thumbs">
              {previews.map((src, i) => (
                <span key={src} className="camera-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Page ${i + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeShot(i)}
                    className="camera-thumb-x"
                    aria-label={`Remove page ${i + 1}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="camera-controls">
            <button type="button" onClick={onClose} className="camera-cancel">
              Cancel
            </button>
            <button
              type="button"
              onClick={takeShot}
              className="camera-shutter"
              aria-label="Take photo"
            >
              <span />
            </button>
            {mode === "batch" && shots.length > 0 ? (
              <button
                type="button"
                onClick={() => onDone(shots)}
                className="camera-done"
              >
                Done ({shots.length})
              </button>
            ) : (
              <span className="camera-spacer" aria-hidden />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
