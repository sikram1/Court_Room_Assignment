"use client";
import React, { useEffect, useRef, useState } from "react";

type Msg = {
  id: number;
  source: string;
  text: string;
  createdAt: number;
  urgent?: boolean;
  handled?: boolean;
  courtTimerId?: number;
};

type Props = {
  disabled?: boolean;
  onCourtTrigger?: (reason: string) => void;
  onUrgent?: () => void;
  getHTML?: () => string;
  resetKey?: number;
};

export default function MessagePanel({
  disabled,
  onCourtTrigger,
  onUrgent,
  getHTML,
  resetKey,
}: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const idRef = useRef<number>(1);
  const intervalRef = useRef<number | null>(null);
  const escalationTimers = useRef<Map<number, number>>(new Map());
  const hasStartedRef = useRef(false);

  // ---------- CLEANUP ----------
  const cleanupTimers = () => {
    escalationTimers.current.forEach((id) => clearTimeout(id));
    escalationTimers.current.clear();
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // ---------- RESET ----------
  useEffect(() => {
    setMessages([]);
    cleanupTimers();
    idRef.current = 1;
    hasStartedRef.current = false;
  }, [resetKey]);

  // ---------- INITIALIZE ----------
  useEffect(() => {
    if (disabled) return;
  
    // Prevent duplicate intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const welcome: Msg = {
      id: idRef.current++,
      source: "System",
      text: "Welcome to the Court Room!",
      createdAt: Date.now(),
    };
    setMessages([welcome]);
    setTimeout(
      () => setMessages((prev) => prev.filter((m) => m.source !== "System")),
      30000
    );

    const sources = ["Boss", "Family", "Agile"];
    const bossMsgs = ["fix input validation", "fix secure database"];
    const familyMsgs = [
      "Dinner is ready!",
      "Can you pick up kids after work?",
      "Take a short break!",
    ];
    const agileMsgs = ["fix alt in img1", "fix user login"];

    intervalRef.current = window.setInterval(() => {
      const src = sources[Math.floor(Math.random() * sources.length)];
      let msg = "";
      if (src === "Boss")
        msg = bossMsgs[Math.floor(Math.random() * bossMsgs.length)];
      else if (src === "Family")
        msg = familyMsgs[Math.floor(Math.random() * familyMsgs.length)];
      else msg = agileMsgs[Math.floor(Math.random() * agileMsgs.length)];

      addMessage(src, msg);
    }, 20000); // faster flow for testing

    const handleGameOver = () => cleanupTimers();
    window.addEventListener("gameOverCleanup", handleGameOver);

    return () => {
      cleanupTimers();
      window.removeEventListener("gameOverCleanup", handleGameOver);
    };
  }, [disabled]);

  // ---------- ADD MESSAGE ----------
  const addMessage = (source: string, text: string, urgent = false) => {
    setMessages((prev) => {
      if (urgent && prev.some((m) => m.text === text && m.urgent)) return prev;

      const msg: Msg = { id: idRef.current++, source, text, createdAt: Date.now(), urgent };

      // Escalate only for Boss and Agile
      if (!urgent && ["Boss", "Agile"].includes(source)) {
        const escalationId = window.setTimeout(() => {
          const html = getHTML ? getHTML() : "";
          if (!isIssueFixed(text, html)) {
            setMessages((prevMsgs) => {
              if (!prevMsgs.some((m) => m.text === text && m.urgent)) {
                const urgentMsg: Msg = { ...msg, urgent: true };
                setTimeout(() => onUrgent?.(), 0);

                // Court after another 8s if still unfixed
                const courtTimer = window.setTimeout(() => {
                  const currentHTML = getHTML ? getHTML() : "";
                  if (!isIssueFixed(text, currentHTML)) {
                    setMessages((prevFinal) =>
                      prevFinal.map((m) =>
                        m.id === urgentMsg.id ? { ...m, handled: true } : m
                      )
                    );
                    setTimeout(() => onCourtTrigger?.(text), 0);
                  }
                }, 8000);

                urgentMsg.courtTimerId = courtTimer;
                return [urgentMsg, ...prevMsgs];
              }
              return prevMsgs;
            });
          }
        }, 8000);
        escalationTimers.current.set(msg.id, escalationId);
      }

      return [msg, ...prev];
    });
  };

  // ---------- FIX DETECTION ----------
  const isIssueFixed = (text: string, html: string) => {
    if (!html) return false;

    // Stricter logic for real detection
    if (/alt/i.test(text))
      return /<img[^>]+alt=["'][^"']+["'][^>]*>/i.test(html);

    if (/validation/i.test(text))
      return /<input[^>]+(type=["']email["']|pattern=|required)/i.test(html);
    

    if (/user login/i.test(text))
      return /<input[^>]+type=["']password["']/.test(html);

    if (/secure/i.test(text))
      return /https:\/\//i.test(html);

    return false;
  };

  // ---------- HANDLE MESSAGE ----------
  const handleMsgClick = (id: number, text: string, source: string) => {
    // Disable handle for Family
    if (source === "Family") return;

    const html = getHTML ? getHTML() : "";
    if (!isIssueFixed(text, html)) {
      alert("You haven’t fixed the issue in the workspace yet!");
      return;
    }

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          if (m.courtTimerId) clearTimeout(m.courtTimerId);
          return { ...m, handled: true };
        }
        return m;
      })
    );

    alert("Issue resolved!");
  };

  // ---------- RENDER ----------
  return (
    <div style={{ background: "rgba(255,255,255,0.98)", padding: 12, borderRadius: 8 }}>
      <h3 style={{ marginTop: 0 }}>Messages</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {[...messages].map((m) => (
          <li
            key={m.id}
            style={{
              borderBottom: "1px solid #eef2f7",
              padding: "10px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: m.urgent ? "#fee2e2" : "transparent",
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{m.source}</div>
              <div style={{ color: m.urgent ? "#b91c1c" : "#374151" }}>{m.text}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>
                {new Date(m.createdAt).toLocaleTimeString()}
              </div>
            </div>

            {/*  No Handle button for Family messages */}
            {!m.handled && m.source !== "Family" ? (
              <button
                onClick={() => handleMsgClick(m.id, m.text, m.source)}
                style={{
                  cursor: "pointer",
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                }}
              >
                Handle
              </button>
            ) : m.handled ? (
              <img src="/icons/checked-icon.svg" alt="Handled" width={20} height={20} />
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
