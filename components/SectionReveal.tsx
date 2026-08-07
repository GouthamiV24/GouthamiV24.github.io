"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function SectionReveal({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{
        clipPath: "inset(0 100% 0 0)",
        opacity: 0,
        y: 30
      }}
      whileInView={{
        clipPath: "inset(0 0% 0 0)",
        opacity: 1,
        y: 0
      }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
