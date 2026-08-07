"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      suppressHydrationWarning
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] z-[9999] origin-left bg-gradient-to-r from-violet-500 to-cyan-400"
      initial={{ boxShadow: "0 0 10px rgba(139,92,246,0.8), 0 0 30px rgba(139,92,246,0.4)" }}
      animate={{ boxShadow: "0 0 10px rgba(139,92,246,0.8), 0 0 30px rgba(139,92,246,0.4)" }}
    />
  );
}
