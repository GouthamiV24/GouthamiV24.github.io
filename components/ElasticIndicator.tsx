"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function ElasticIndicator() {
  const [scrollDir, setScrollDir] = useState<"down" | "up" | "idle">("idle");
  const [velocity, setVelocity] = useState(0);
  const lastScrollY = useRef(0);
  const timeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;
      const vel = Math.min(Math.abs(diff), 30);
      
      setVelocity(vel);
      setScrollDir(diff > 0 ? "down" : diff < 0 ? "up" : "idle");
      lastScrollY.current = currentY;

      // Reset to idle after scroll stops
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        setScrollDir("idle");
        setVelocity(0);
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout.current);
    };
  }, []);

  const springVelocity = useSpring(velocity, { damping: 15, stiffness: 200 });
  const scaleY = useTransform(springVelocity, [0, 30], [1, 1.8]);
  const opacity = useTransform(springVelocity, [0, 10], [0, 0.6]);

  return (
    <motion.div
      suppressHydrationWarning
      style={{ opacity }}
      className="fixed left-1/2 -translate-x-1/2 z-30 pointer-events-none"
      animate={{
        top: scrollDir === "down" ? "auto" : 0,
        bottom: scrollDir === "down" ? 0 : "auto",
      }}
    >
      <motion.div
        suppressHydrationWarning
        style={{ scaleY, transformOrigin: scrollDir === "down" ? "bottom" : "top" }}
        className="w-16 h-1 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 shadow-[0_0_15px_rgba(139,92,246,0.6)]"
      />
    </motion.div>
  );
}
