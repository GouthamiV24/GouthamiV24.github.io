"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cursorLabel, setCursorLabel] = useState("");

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    setVisible(true);
    document.body.style.cursor = "none";

    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleEnter = (e: Event) => {
      setHovered(true);
      const el = e.currentTarget as HTMLElement;
      // Read contextual label from data attribute
      const label = el.getAttribute("data-cursor") || "";
      setCursorLabel(label);
    };

    const handleLeave = () => {
      setHovered(false);
      setCursorLabel("");
    };

    window.addEventListener("mousemove", move);

    const addListeners = () => {
      document.querySelectorAll("a, button, [role='button'], [data-cursor]").forEach((el) => {
        el.addEventListener("mouseenter", handleEnter);
        el.addEventListener("mouseleave", handleLeave);
      });
    };

    addListeners();
    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", move);
      document.body.style.cursor = "";
      observer.disconnect();
    };
  }, [mouseX, mouseY]);

  if (!visible) return null;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
      >
        <motion.div
          animate={{
            width: cursorLabel ? 80 : hovered ? 60 : 32,
            height: cursorLabel ? 80 : hovered ? 60 : 32,
            opacity: hovered ? 0.8 : 0.4,
          }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="rounded-full border border-white flex items-center justify-center"
        >
          {/* Contextual label */}
          {cursorLabel && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="text-[10px] font-mono uppercase tracking-widest text-white select-none"
            >
              {cursorLabel}
            </motion.span>
          )}
        </motion.div>
      </motion.div>
      {/* Inner dot */}
      <motion.div
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
      >
        <motion.div
          animate={{
            width: cursorLabel ? 0 : hovered ? 8 : 4,
            height: cursorLabel ? 0 : hovered ? 8 : 4,
          }}
          transition={{ type: "spring", damping: 20, stiffness: 400 }}
          className="rounded-full bg-white mix-blend-difference"
        />
      </motion.div>
    </>
  );
}
