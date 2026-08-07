"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useStore } from "@/store/useStore";

const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#@$%&アイウエオカキクケコ";

function GlitchLine({ delay, width }: { delay: number; width: string }) {
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: [0, 1, 1, 0] }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      style={{ width, transformOrigin: "left" }}
      className="h-[1px] bg-gradient-to-r from-violet-500 via-cyan-400 to-transparent my-1"
    />
  );
}

function CounterDisplay({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs font-mono text-violet-400/60 tracking-widest uppercase">{label}</span>
      <span className="text-xs font-mono text-white/30 tabular-nums">{value}</span>
    </div>
  );
}

export default function CinematicIntro() {
  const { introFinished, setIntroFinished } = useStore();
  const [displayText, setDisplayText] = useState("");
  const [phase, setPhase] = useState<"loading" | "glitching" | "name" | "tagline" | "split" | "done">("loading");
  const [loadProgress, setLoadProgress] = useState(0);
  const [taglineVisible, setTaglineVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  // Session check
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("introPlayed")) {
      setPhase("done");
      setIntroFinished(true);
    }
  }, [setIntroFinished]);

  // Scanning lines canvas effect
  useEffect(() => {
    if (phase === "done") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let offset = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Scanning horizontal lines
      ctx.strokeStyle = "rgba(139, 92, 246, 0.03)";
      ctx.lineWidth = 1;
      for (let y = offset % 4; y < canvas.height; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Moving scan line
      const scanY = (offset * 3) % canvas.height;
      const gradient = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
      gradient.addColorStop(0, "rgba(139, 92, 246, 0)");
      gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.08)");
      gradient.addColorStop(1, "rgba(139, 92, 246, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 40, canvas.width, 80);

      offset++;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(animRef.current);
  }, [phase]);

  // Phase 1: Loading progress
  useEffect(() => {
    if (phase !== "loading") return;
    const interval = setInterval(() => {
      setLoadProgress((prev) => {
        const next = prev + Math.random() * 15 + 5;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => setPhase("glitching"), 200);
          return 100;
        }
        return next;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [phase]);

  // Phase 2: Glitch scramble
  useEffect(() => {
    if (phase !== "glitching") return;
    let frame = 0;
    const interval = setInterval(() => {
      let str = "";
      const targetLen = 8;
      for (let i = 0; i < targetLen; i++) {
        // Progressively reveal the actual name
        if (i < Math.floor((frame / 25) * targetLen)) {
          str += "GOUTHAMI"[i] || "";
        } else {
          str += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
      }
      setDisplayText(str);
      frame++;
      if (frame > 25) {
        clearInterval(interval);
        setDisplayText("GOUTHAMI");
        setPhase("name");
      }
    }, 40);
    return () => clearInterval(interval);
  }, [phase]);

  // Phase 3: Show name, then tagline
  useEffect(() => {
    if (phase !== "name") return;
    const t1 = setTimeout(() => setTaglineVisible(true), 400);
    const t2 = setTimeout(() => {
      setPhase("split");
      setIntroFinished(true);
    }, 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase, setIntroFinished]);

  // Phase 4: Split → done
  useEffect(() => {
    if (phase !== "split") return;
    const timeout = setTimeout(() => {
      setPhase("done");
      if (typeof window !== "undefined") sessionStorage.setItem("introPlayed", "true");
    }, 1200);
    return () => clearTimeout(timeout);
  }, [phase]);

  if (phase === "done" || introFinished) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[99999] flex flex-col pointer-events-none"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Top half shutter */}
        <motion.div
          className="w-full bg-[#030014] flex-1 flex flex-col items-center justify-end overflow-hidden relative"
          initial={{ y: "0%" }}
          animate={{ y: phase === "split" ? "-100%" : "0%" }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Scanning lines canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

          {/* Corner decorative elements */}
          <div className="absolute top-6 left-6 flex flex-col gap-1">
            <div className="w-8 h-[1px] bg-violet-500/30" />
            <div className="w-4 h-[1px] bg-violet-500/20" />
          </div>
          <div className="absolute top-6 right-6 text-[10px] font-mono text-violet-400/40 tracking-widest">
            SYS.INIT
          </div>
          <div className="absolute bottom-6 left-6 text-[10px] font-mono text-white/20 tracking-widest">
            v2.0.26
          </div>

          {/* Loading progress phase */}
          {phase === "loading" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-6"
            >
              {/* Decorative lines */}
              <div className="flex flex-col items-center gap-0">
                <GlitchLine delay={0} width="120px" />
                <GlitchLine delay={0.1} width="80px" />
                <GlitchLine delay={0.2} width="160px" />
              </div>

              {/* Progress bar */}
              <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-400"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>

              <div className="flex gap-8">
                <CounterDisplay value={`${Math.round(loadProgress)}%`} label="loading" />
                <CounterDisplay value="OK" label="status" />
              </div>
            </motion.div>
          )}

          {/* Name reveal — bottom half of text */}
          {(phase === "glitching" || phase === "name" || phase === "tagline") && (
            <div className="flex flex-col items-center translate-y-[50%]">
              {/* Main name */}
              <motion.div
                className="text-[clamp(4rem,15vw,12rem)] font-sans font-bold tracking-tighter text-white select-none leading-none"
                initial={{ scale: 0.9, filter: "blur(10px)" }}
                animate={{ scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.5 }}
              >
                {displayText.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                    className="inline-block"
                    style={{
                      textShadow: phase === "glitching" 
                        ? "0 0 20px rgba(139,92,246,0.8), 0 0 40px rgba(139,92,246,0.4)" 
                        : "0 0 30px rgba(255,255,255,0.1)",
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.div>

              {/* Tagline */}
              <AnimatePresence>
                {taglineVisible && (
                  <motion.p
                    initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    className="text-sm font-mono text-violet-400/70 tracking-[0.3em] uppercase mt-4"
                  >
                    Computer Science & AI
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Horizontal light flare on split */}
          {phase === "split" && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent origin-center"
              style={{ boxShadow: "0 0 30px 10px rgba(34,211,238,0.3)" }}
            />
          )}
        </motion.div>

        {/* Bottom half shutter */}
        <motion.div
          className="w-full bg-[#030014] flex-1 flex items-start justify-center overflow-hidden relative"
          initial={{ y: "0%" }}
          animate={{ y: phase === "split" ? "100%" : "0%" }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Mirror scanning lines */}
          <div className="absolute inset-0 rotate-180">
            <canvas className="w-full h-full pointer-events-none opacity-50" />
          </div>

          {/* Bottom half of the split text */}
          {(phase === "glitching" || phase === "name" || phase === "tagline") && (
            <div className="flex flex-col items-center -translate-y-[50%]">
              <motion.div
                className="text-[clamp(4rem,15vw,12rem)] font-sans font-bold tracking-tighter text-white select-none leading-none"
                initial={{ scale: 0.9, filter: "blur(10px)" }}
                animate={{ scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.5 }}
              >
                {displayText.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                    className="inline-block"
                    style={{
                      textShadow: phase === "glitching"
                        ? "0 0 20px rgba(139,92,246,0.8), 0 0 40px rgba(139,92,246,0.4)"
                        : "0 0 30px rgba(255,255,255,0.1)",
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.div>

              {taglineVisible && (
                <motion.p
                  initial={{ opacity: 0, y: -10, filter: "blur(5px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  className="text-sm font-mono text-violet-400/70 tracking-[0.3em] uppercase mt-4"
                >
                  Computer Science & AI
                </motion.p>
              )}
            </div>
          )}

          {/* Horizontal light flare on split */}
          {phase === "split" && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-transparent origin-center"
              style={{ boxShadow: "0 0 30px 10px rgba(139,92,246,0.3)" }}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
