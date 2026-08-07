"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const SKILLS = [
  { name: "Python", level: 95 },
  { name: "Java", level: 85 },
  { name: "C", level: 80 },
  { name: "Flutter", level: 90 },
  { name: "React", level: 88 },
  { name: "Node.js", level: 85 },
  { name: "Flask", level: 85 },
  { name: "Scikit-learn", level: 90 },
  { name: "Pandas & NumPy", level: 88 },
  { name: "NLP", level: 85 },
  { name: "HTML & CSS", level: 95 },
];

const EXPERIENCE = [
  {
    role: "Mobile Application Development",
    desc: "Designing and developing user-friendly cross-platform mobile applications using Flutter.",
  },
  {
    role: "Artificial Intelligence & ML",
    desc: "Building predictive machine learning models and NLP pipelines.",
  },
  {
    role: "Backend & Automation",
    desc: "Creating server-side logic and automated processing workflows with Node.js, Flask, and n8n.",
  },
];

export default function Skills() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"],
  });

  const yTransform = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <section ref={containerRef} id="skills" className="relative z-10 py-32 px-6 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-mono text-xs text-violet-400 tracking-[0.3em] uppercase mb-6"
        >
          03 / Expertise
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-[clamp(2rem,5vw,4rem)] font-sans font-medium tracking-tight text-white mb-20 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        >
          Skills & Capabilities
        </motion.h2>

        <motion.div 
          style={{ y: yTransform, opacity: opacityTransform }}
          className="grid lg:grid-cols-2 gap-16"
        >
          {/* Skill bars */}
          <div className="space-y-6">
            {SKILLS.map((skill, i) => (
              <div key={skill.name} className="group">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors duration-300">{skill.name}</span>
                  <span className="text-xs font-mono text-gray-500 group-hover:text-violet-400 transition-colors duration-300">{skill.level}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Expertise cards */}
          <div className="space-y-6">
            {EXPERIENCE.map((exp, i) => (
              <motion.div
                key={exp.role}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.8, ease: "easeOut" }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="glass rounded-2xl p-8 border border-white/10 hover:border-violet-500/30 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl bg-white/[0.02]"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 flex items-center justify-center text-sm font-mono text-violet-400 flex-shrink-0 shadow-[inset_0_0_10px_rgba(139,92,246,0.2)]">
                    0{i + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-white mb-3 tracking-tight">{exp.role}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{exp.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
