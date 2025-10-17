"use client";
import dynamic from "next/dynamic";
import React, { useRef, useState, useEffect } from "react";
import RecordManager from "../components/recordManager";

const Timer = dynamic(() => import("../components/Timer"), { ssr: false });
const MessagePanel = dynamic(() => import("../components/MessagePanel"), { ssr: false });

export default function CourtRoomPage() {
  const [manualTime, setManualTime] = useState<number>(180);
  const [started, setStarted] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [stage, setStage] = useState<number>(1);
  const [timerKey, setTimerKey] = useState<number>(0);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const getHTML = () => textareaRef.current?.value ?? "";

  // ------------------ SAVE ------------------
  const handleSave = async () => {
    const html = getHTML();
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: "Student_20900837",
          caseDocument: html,
          sessionStage: `Stage${stage}`,
        }),
      });
      const data = await res.json().catch(() => null);
      alert(res.ok ? "Saved to database!" : `Save failed: ${data?.error || "Unknown"}`);
    } catch (err) {
      console.error(err);
      alert("Network or server error.");
    }
  };

  const handleStart = () => {
    if (!manualTime || manualTime < 5) return alert("Choose a valid time (>= 5s).");
    if (textareaRef.current) {
      textareaRef.current.value = `<h1>Project: Example Page</h1>
<img src="logo.png"> 
<form>
  <input type="text" name="name" placeholder="Name"> 
  <button>Submit</button>
</form>`;
    }
    setStage(1);
    setGameOver(false);
    setPaused(false);
    setStarted(true);
    setTimerKey((k) => k + 1);
  };

  const togglePause = () => {
    if (!started || gameOver) return;
    setPaused((p) => !p);
  };

  const handleExpire = () => {
    setGameOver(true);
    setStarted(false);
    alert("Time's up! Court session ended.");
  };

  const handleReset = () => {
    if (textareaRef.current) {
      textareaRef.current.value = `<h1>Project: Example Page</h1>
<img src="logo.png"> 
<form>
  <input type="text" name="name" placeholder="Name"> 
  <button>Submit</button>
</form>`;
    }
    alert("Workspace reset to starting template.");
  };

  const handleRestart = () => {
    setStarted(false);
    setPaused(false);
    setGameOver(false);
    setStage(1);
    setTimerKey((k) => k + 1);
    if (textareaRef.current) textareaRef.current.value = "<h1>Ready — set a timer and press Start</h1>";
    alert("Game restarted — set time and press Start.");
  };

  const handleCourtTrigger = (reason: string) => {
    setStage(3);
    setGameOver(true);
    setStarted(false);

    if (reason.toLowerCase().includes("alt"))
      alert("Court summoned — accessibility issue (missing alt) was ignored.");
    else if (reason.toLowerCase().includes("validation"))
      alert("Court summoned — input validation ignored (Laws of Tort).");
    else if (reason.toLowerCase().includes("user login"))
      alert("Court summoned — login failure / bankruptcy scenario.");
    else if (reason.toLowerCase().includes("secure"))
      alert("Court summoned — security breach / data unsafe.");
    else alert("Court summoned for negligence!");
  };

  // Accessibility reminder
  useEffect(() => {
    if (!started || gameOver) return;
    const interval = setInterval(() => {
      const html = getHTML();
      const hasImg = /<img[^>]*>/i.test(html);
      const hasAlt = /<img[^>]*alt\s*=\s*["'][^"']+["'][^>]*>/i.test(html);
      if (hasImg && !hasAlt) console.warn("Accessibility reminder: missing alt attribute");
    }, 60000);
    return () => clearInterval(interval);
  }, [started, gameOver]);

  useEffect(() => {
    if (gameOver) {
      const event = new CustomEvent("gameOverCleanup");
      window.dispatchEvent(event);
    }
  }, [gameOver]);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "16px",
        backgroundImage: gameOver
          ? "url('/backgrounds/courtroom.jpg')"
          : "url('/backgrounds/workdesk.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        fontFamily: "Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          background: "rgba(255,255,255,0.92)",
          borderRadius: 8,
          padding: "10px 14px",
          gap: 10,
        }}
      >
        <h1
          style={{
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: "1.4rem",
          }}
        >
          <img src="/icons/gavel-icon.svg" alt="Court Icon" width={28} height={28} />
          Court Room
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/icons/clock-icon.svg" alt="Timer icon" width={22} height={22} />
            <input
              id="manualTime"
              type="number"
              value={manualTime}
              min={180}
              max={1200}
              step={15}
              disabled={started && !gameOver}
              onChange={(e) => setManualTime(Number(e.target.value) < 180 ? 180 : Number(e.target.value))}
              style={{
                width: 70,
                padding: 6,
                borderRadius: 6,
                border: "1px solid #ccc",
                textAlign: "center",
                fontSize: 14,
              }}
            />
            <span style={{ fontSize: 13 }}>Sec</span>
          </div>

          {!started ? (
            <button
              onClick={handleStart}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#f3f4f6",
                color: "#111827",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 14,
              }}
            >
              <img src="/icons/play-icon.svg" alt="Start" width={18} height={18} />
              Start Game
            </button>
          ) : (
            <>
              <Timer key={timerKey} startSeconds={manualTime} paused={paused} onExpire={handleExpire} />
              <button
                onClick={togglePause}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#f3f4f6",
                  color: "#111827",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 14,
                }}
              >
                <img
                  src={paused ? "/icons/play-icon.svg" : "/icons/pause-icon.svg"}
                  alt={paused ? "Resume" : "Pause"}
                  width={16}
                  height={16}
                />
                {paused ? "Resume" : "Pause"}
              </button>
            </>
          )}
        </div>
      </header>

      {/* MAIN */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 20,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.96)",
            padding: 14,
            borderRadius: 10,
            boxShadow: "0 6px 24px rgba(15,23,42,0.04)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Work Desk — Stage {stage}</h2>
            <div style={{ color: "#6b7280", fontSize: 13 }}>{gameOver ? "Courtroom" : "Workspace"}</div>
          </div>

          <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.5 }}>
            Edit the code in the workspace. When messages arrive, fix issues like missing <code>alt</code> attributes or
            input validation. If ignored, issues escalate, and you may be summoned to court.
          </p>

          <textarea
            id="htmlOut"
            ref={textareaRef}
            defaultValue="<h1>Ready — set a timer and press Start</h1>"
            disabled={!started || gameOver}
            style={{
              width: "100%",
              minHeight: 220,
              border: "1px solid #e6e9ef",
              borderRadius: 8,
              padding: 12,
              fontFamily: "Consolas, monospace",
              fontSize: 13,
              color: "#111827",
              background: !started || gameOver ? "#f8fafc" : "#ffffff",
            }}
          />

          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleSave}
              disabled={!started}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#f3f4f6",
                color: "#111827",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 14,
              }}
            >
              <img src="/icons/save-icon.svg" alt="Save" width={16} height={16} />
              Save
            </button>

            <button
              onClick={handleReset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#f3f4f6",
                color: "#111827",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 14,
              }}
            >
              <img src="/icons/reset-icon.svg" alt="Reset" width={16} height={16} />
              Reset
            </button>

            {gameOver && (
              <button
                onClick={handleRestart}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#f3f4f6",
                  color: "#111827",
                  border: "1px solid #16a34a",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 14,
                }}
              >
                <img src="/icons/restart-icon.svg" alt="Restart" width={22} height={22} />
                Restart
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <MessagePanel
            disabled={!started || gameOver}
            onCourtTrigger={handleCourtTrigger}
            onUrgent={() => setTimeout(() => setStage(2), 0)}
            getHTML={getHTML}
            resetKey={timerKey}
          />
          <RecordManager />
        </div>
      </section>

      {/* MOBILE ADJUSTMENTS */}
      <style jsx>{`
        @media (max-width: 768px) {
          section {
            display: flex;
            flex-direction: column;
          }
          textarea {
            min-height: 180px;
          }
          header h1 {
            font-size: 1.2rem;
          }
          button {
            font-size: 13px;
            padding: 6px 10px;
          }
        }
      `}</style>
    </main>
  );
}
