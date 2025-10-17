//component/Timer.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";

type Props = { startSeconds: number; onExpire?: () => void; paused?: boolean };

export default function Timer({ startSeconds, onExpire, paused }: Props) {
  const [secs, setSecs] = useState(startSeconds);
  const intervalRef = useRef<number | null>(null);

  // Reset timer when startSeconds changes
  useEffect(() => {
    setSecs(startSeconds);
  }, [startSeconds]);

  // Tick logic
  useEffect(() => {
    if (paused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current) return; // already running

    intervalRef.current = window.setInterval(() => {
      setSecs((s) => Math.max(0, s - 1));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [paused]);

  // Handle expiry outside render phase
  useEffect(() => {
    if (secs === 0 && onExpire) {
      onExpire();
    }
  }, [secs, onExpire]);

  const minutes = Math.floor(secs / 60);
  const seconds = secs % 60;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{ padding: 8, background: "rgba(255,255,255,0.92)", borderRadius: 6, display: "inline-block" }}
    >
      <strong>Timer:</strong> {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
}
