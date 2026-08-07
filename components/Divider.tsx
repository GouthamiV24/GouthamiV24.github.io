"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Divider() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const lineWidth = useTransform(scrollYProgress, [0, 0.5], ["0%", "100%"]);
  const glowOpacity = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 1, 0]);

  return (
    <div ref={ref} className="relative z-10 py-16 flex items-center justify-center">
      <div className="relative w-full max-w-4xl mx-auto px-6">
        {/* Animated line */}
        <motion.div
          suppressHydrationWarning
          style={{ width: lineWidth }}
          className="h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent mx-auto"
        />
        {/* Center glow */}
        <motion.div
          suppressHydrationWarning
          style={{ opacity: glowOpacity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-8 bg-violet-500/30 blur-2xl rounded-full"
        />
      </div>
    </div>
  );
}
