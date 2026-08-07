"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import dynamic from "next/dynamic";
import ScrambleText from "@/components/ScrambleText";
import MagneticButton from "@/components/MagneticButton";
import { useStore } from "@/store/useStore";

const HeroObject = dynamic(() => import("@/components/HeroObject"), { ssr: false });

export default function Hero() {
  const { introFinished } = useStore();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax: name floats up, subtitle fades, background scales
  const nameY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const nameScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const nameOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const subtitleY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const badgeY = useTransform(scrollYProgress, [0, 1], ["0%", "-60%"]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative z-10 min-h-screen flex flex-col justify-center items-center px-6 overflow-hidden"
    >
      <HeroObject />
      {/* Status badge */}
      <motion.div
        suppressHydrationWarning
        style={{ y: badgeY, opacity: nameOpacity }}
        initial={{ opacity: 0, y: 20 }}
        animate={introFinished ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-mono tracking-wider text-gray-400 uppercase border-violet-500/20 bg-violet-900/10">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
          Available for Opportunities
        </div>
      </motion.div>

      {/* Name with parallax */}
      <motion.h1
        suppressHydrationWarning
        style={{ y: nameY, scale: nameScale, opacity: nameOpacity }}
        initial={{ opacity: 0, y: 40 }}
        animate={introFinished ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ delay: 0.4, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-[clamp(3.5rem,12vw,10rem)] font-sans font-bold tracking-tighter leading-[0.85] text-center"
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          GOUTHAMI
        </span>
      </motion.h1>

      {/* Subtitle with Scramble Effect + parallax */}
      <motion.div
        suppressHydrationWarning
        style={{ y: subtitleY, opacity: nameOpacity }}
        className="mt-8 text-lg md:text-xl text-cyan-200/80 text-center max-w-xl font-mono tracking-wide h-[60px] flex flex-col justify-center"
      >
        {introFinished && (
          <>
            <ScrambleText text="Computer Science Engineering Student" delay={0.4} className="block" />
            <ScrambleText text="AI, Machine Learning & Mobile Development" delay={1.0} className="block text-violet-300/80 mt-2" />
          </>
        )}
      </motion.div>

      {/* CTA buttons */}
      <motion.div
        suppressHydrationWarning
        style={{ opacity: nameOpacity }}
        initial={{ opacity: 0, y: 20 }}
        animate={introFinished ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="mt-10 flex gap-4"
      >
        <MagneticButton href="#projects">
          <div className="px-8 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium tracking-wide hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300">
            View Work
          </div>
        </MagneticButton>
        <MagneticButton href="#contact">
          <div className="px-8 py-3 rounded-full glass text-white text-sm font-medium tracking-wide hover:bg-white/10 transition-all duration-300">
            Contact
          </div>
        </MagneticButton>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        suppressHydrationWarning
        style={{ opacity: nameOpacity }}
        initial={{ opacity: 0 }}
        animate={introFinished ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5"
        >
          <div className="w-1 h-1.5 rounded-full bg-white/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
