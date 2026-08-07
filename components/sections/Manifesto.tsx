"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const WORDS = "Building intelligence isn't just about algorithms — It's about orchestrating raw data into flawless human experiences with zero friction";

export default function Manifesto() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "center center"],
  });

  const words = WORDS.split(" ");

  // Horizontal line that draws across
  const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="relative z-10 py-40 px-6 md:px-16 lg:px-24">
      <div className="max-w-5xl mx-auto">
        {/* Decorative line */}
        <motion.div
          suppressHydrationWarning
          style={{ width: lineWidth }}
          className="h-px bg-gradient-to-r from-violet-500 to-cyan-500 mb-12"
        />

        <p className="flex flex-wrap gap-x-[0.35em] gap-y-2 text-[clamp(1.8rem,4vw,3.5rem)] font-sans font-medium tracking-tight leading-[1.3]">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return <Word key={i} word={word} range={[start, end]} progress={scrollYProgress} />;
          })}
        </p>

        {/* Decorative line at bottom */}
        <motion.div
          suppressHydrationWarning
          style={{ width: lineWidth }}
          className="h-px bg-gradient-to-r from-cyan-500 to-violet-500 mt-12 ml-auto"
        />
      </div>
    </section>
  );
}

function Word({
  word,
  range,
  progress,
}: {
  word: string;
  range: [number, number];
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [8, 0]);
  const blur = useTransform(progress, range, [4, 0]);

  return (
    <motion.span
      suppressHydrationWarning
      style={{
        opacity,
        y,
        filter: useTransform(blur, (v) => `blur(${v}px)`),
      }}
      className="text-white inline-block"
    >
      {word}
    </motion.span>
  );
}
