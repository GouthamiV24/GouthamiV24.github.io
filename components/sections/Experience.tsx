"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";

const EXPERIENCES = [
  {
    year: "June 2025",
    role: "Python Development Intern",
    company: "Calibre Code Solutions",
    description: "Gained practical experience in Python web development. Worked on backend logic, database integration, and REST API development for web-based software projects.",
  },
  {
    year: "2024",
    role: "AI and Automation Intern",
    company: "Acadeno Technology Pvt. Ltd.",
    description: "Completed an intensive internship focusing on Artificial Intelligence concepts, intelligent systems, and automation tools, gaining practical exposure to real-world AI applications.",
  },
  {
    year: "2023 - Present",
    role: "B.Tech in Computer Science and Engineering",
    company: "Vimal Jyoti Engineering College",
    description: "Currently pursuing a Bachelor of Technology with a CGPA of 6.84. Active volunteer in National Service Scheme (NSS) and Winner of the NSS Quiz Competition.",
  },
];

export default function Experience() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section ref={containerRef} id="experience" className="relative z-10 py-32 px-6 md:px-16 lg:px-24">
      <div className="max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-mono text-xs text-violet-400 tracking-[0.3em] uppercase mb-6 text-center"
        >
          04 / Journey
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-[clamp(2rem,5vw,4rem)] font-sans font-medium tracking-tight text-white mb-20 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] text-center"
        >
          Experience & Education
        </motion.h2>

        <div className="relative">
          {/* The drawn line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-white/5 md:-translate-x-1/2" />
          <motion.div
            style={{ scaleY, originY: 0 }}
            className="absolute left-0 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 via-cyan-400 to-transparent md:-translate-x-1/2 shadow-[0_0_15px_rgba(139,92,246,0.8)]"
          />

          <div className="space-y-24">
            {EXPERIENCES.map((exp, i) => {
              const isEven = i % 2 === 0;
              return (
                <div key={i} className={`relative flex flex-col md:flex-row items-center ${isEven ? "md:justify-start" : "md:justify-end"}`}>
                  
                  {/* Glowing Node */}
                  <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full bg-[#030014] border-2 border-violet-500 md:-translate-x-1/2 flex items-center justify-center z-10 shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                    <motion.div 
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: false, margin: "-10%" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"
                    />
                  </div>

                  {/* Content Card */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -50 : 50, filter: "blur(10px)" }}
                    whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`w-full md:w-[45%] pl-8 md:pl-0 ${isEven ? "md:pr-12 text-left md:text-right" : "md:pl-12 text-left"}`}
                  >
                    <div className="glass p-8 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl bg-white/[0.02] hover:-translate-y-2 group">
                      <span className="inline-block px-3 py-1 mb-4 text-xs font-mono text-cyan-400 bg-cyan-900/20 border border-cyan-500/20 rounded-full">
                        {exp.year}
                      </span>
                      <h3 className="text-xl md:text-2xl font-medium text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-colors">
                        {exp.role}
                      </h3>
                      <h4 className="text-sm font-mono text-violet-400 mb-4">{exp.company}</h4>
                      <p className="text-gray-400 leading-relaxed text-sm">
                        {exp.description}
                      </p>
                    </div>
                  </motion.div>
                  
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
