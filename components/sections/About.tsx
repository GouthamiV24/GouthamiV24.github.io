"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import MorphingBlob from "@/components/MorphingBlob";

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax for the photo
  const photoY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const photoRotate = useTransform(scrollYProgress, [0, 1], [-3, 3]);
  // Parallax for the text
  const textY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={sectionRef} id="about" className="relative z-10 py-32 px-6 md:px-16 lg:px-24 overflow-hidden">
      {/* Morphing blob background */}
      <MorphingBlob />
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-mono text-xs text-violet-400 tracking-[0.3em] uppercase mb-16"
        >
          01 / About
        </motion.p>

        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* Photo with parallax + tilt */}
          <motion.div
            suppressHydrationWarning
            style={{ y: photoY, rotate: photoRotate }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-[400px] flex-shrink-0"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden glass group">
              <Image
                src="/images/gouthami-photo.jpg"
                alt="Gouthami V"
                fill
                priority
                className="object-cover transition-all duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent" />
              {/* Glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-violet-600/20 to-cyan-600/20" />
            </div>
          </motion.div>

          {/* Bio with parallax */}
          <motion.div suppressHydrationWarning style={{ y: textY }} className="flex-1">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-[clamp(2.5rem,5vw,4.5rem)] font-sans font-medium tracking-tight leading-[1.1] text-white mb-8"
            >
              I build systems that think,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                learn, and adapt.
              </span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="space-y-4 text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl"
            >
              <p>
                I am a Computer Science Engineering student with hands-on experience in mobile application development, Artificial Intelligence, Machine Learning, and Automation.
              </p>
              <p>
                Skilled in Python, Java, Flutter, React, and Flask, I have a strong interest in developing intelligent software solutions and modern web applications that solve real-world problems.
              </p>
              <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium tracking-wide hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Resume
              </a>
            </motion.div>

            {/* Stats with animated counters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/10"
            >
              <div>
                <div className="text-4xl md:text-5xl font-semibold text-white">
                  <AnimatedCounter target={3} suffix="" />
                </div>
                <div className="text-sm font-mono text-violet-400 uppercase tracking-widest mt-2">
                  Projects
                </div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-semibold text-white">
                  <AnimatedCounter target={2} suffix="" />
                </div>
                <div className="text-sm font-mono text-violet-400 uppercase tracking-widest mt-2">
                  Internships
                </div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-semibold text-white">
                  <AnimatedCounter target={14} suffix="" />
                </div>
                <div className="text-sm font-mono text-violet-400 uppercase tracking-widest mt-2">
                  Technologies
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
