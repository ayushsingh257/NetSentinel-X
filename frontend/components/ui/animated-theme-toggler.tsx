"use client";

import { useState, useEffect, useRef, useId } from "react";
import { motion } from "framer-motion";

export interface AnimatedThemeTogglerProps {
  sound?: boolean;
}

let _ctx: AudioContext | null = null;
let _buf: AudioBuffer | null = null;

function audioCtx() {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    _ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
  }
  if (_ctx.state === "suspended") void _ctx.resume();
  return _ctx;
}

function ensureBuf(ac: AudioContext): AudioBuffer {
  if (_buf && _buf.sampleRate === ac.sampleRate) return _buf;
  const rate = ac.sampleRate;
  const len = Math.floor(rate * 0.006);
  const buf = ac.createBuffer(1, len, rate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t = i / len;
    const sine = Math.sin(2 * Math.PI * 3400 * t);
    const noise = Math.random() * 2 - 1;
    ch[i] = (sine * 0.6 + noise * 0.4) * (1 - t) ** 3;
  }
  _buf = buf;
  return buf;
}

function tick(last: React.MutableRefObject<number>) {
  const now = performance.now();
  if (now - last.current < 80) return;
  last.current = now;
  try {
    const ac = audioCtx();
    if (!ac) return;
    const buf = ensureBuf(ac);
    const src = ac.createBufferSource();
    const gain = ac.createGain();
    src.buffer = buf;
    gain.gain.value = 0.08;
    src.connect(gain);
    gain.connect(ac.destination);
    src.start();
  } catch {
    /* silent */
  }
}

export function AnimatedThemeToggler({
  sound = true,
}: AnimatedThemeTogglerProps) {
  const rawId = useId();
  const maskId = `att${rawId.replace(/:/g, "")}`;
  const lastSnd = useRef(0);
  const [isDark, setIsDark] = useState(true);

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const storedTheme = localStorage.getItem("theme");
      const isDarkMode = storedTheme === "dark" || (!storedTheme && document.documentElement.classList.contains("dark")) || (!storedTheme && localStorage.getItem("theme") !== "light");
      
      setIsDark(isDarkMode);
      applyTheme(isDarkMode);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggle = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    applyTheme(nextDark);
    if (sound) tick(lastSnd);
  };

  const spring = { type: "spring" as const, stiffness: 380, damping: 30 };

  return (
    <>
      <style>{`
        .att-btn{--at-ink:rgba(16,185,129,0.9)}
        .dark .att-btn,[data-theme="dark"] .att-btn{--at-ink:rgba(52,211,153,0.95)}
      `}</style>
      <motion.button
        className="att-btn hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20"
        onClick={toggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.86 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--at-ink)",
          borderRadius: 8,
          outline: "none",
          WebkitTapHighlightColor: "transparent",
        }}
        aria-label="Toggle theme"
      >
        <motion.svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={false}
          animate={{ rotate: isDark ? 270 : 0 }}
          transition={spring}
          style={{ overflow: "visible" }}
        >
          <mask id={maskId}>
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <motion.circle
              initial={false}
              animate={{ cx: isDark ? 17 : 33, cy: isDark ? 8 : 0 }}
              transition={spring}
              r="9"
              fill="black"
            />
          </mask>

          <motion.circle
            cx="12"
            cy="12"
            fill="currentColor"
            stroke="none"
            mask={`url(#${maskId})`}
            initial={false}
            animate={{ r: isDark ? 9 : 5 }}
            transition={spring}
          />

          <motion.g
            initial={false}
            animate={{
              opacity: isDark ? 0 : 1,
              scale: isDark ? 0 : 1,
              rotate: isDark ? -30 : 0,
            }}
            transition={spring}
            style={{ transformOrigin: "12px 12px" }}
          >
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="5.64" y1="5.64" x2="4.22" y2="4.22" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            <line x1="5.64" y1="18.36" x2="4.22" y2="19.78" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          </motion.g>
        </motion.svg>
      </motion.button>
    </>
  );
}

export default AnimatedThemeToggler;
