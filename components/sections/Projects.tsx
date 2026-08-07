"use client";

import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import ProjectImageDistortion from "@/components/ProjectImageDistortion";

const PROJECTS = [
  {
    id: "01",
    title: "StudentsConnect",
    description:
      "Replacing manual paper-based workflows with an intelligent, real-time tracking system. Instant check-in validation and parent notifications.",
    tech: ["Flutter", "Node.js", "MongoDB"],
    image: "/images/project1.png",
    gradient: "from-violet-600 to-indigo-600",
  },
  {
    id: "02",
    title: "AI Career Assistant",
    description:
      "Intelligent career trajectory modeling using NLP. Analyzes resumes, identifies market-aligned skill gaps, and generates personalized career paths.",
    tech: ["React", "FastAPI", "Python", "NLP"],
    image: "/images/project2.png",
    gradient: "from-cyan-600 to-blue-600",
  },
  {
    id: "03",
    title: "Spam Detection & Automation",
    description:
      "Built a machine learning model for spam email classification achieving ~96% prediction accuracy. Integrated automated processing workflows using n8n for intelligent categorization.",
    tech: ["Python", "Flask", "Scikit-learn", "n8n"],
    image: "/images/project3.png",
    gradient: "from-fuchsia-600 to-pink-600",
  },
];

function ProjectCard({ project, index }: { project: typeof PROJECTS[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Scroll parallax for entrance
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const cardY = useTransform(scrollYProgress, [0, 0.3], [100, 0]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const imageScale = useTransform(scrollYProgress, [0.2, 0.8], [1.1, 1]);

  // 3D Tilt Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { damping: 30, stiffness: 200 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { damping: 30, stiffness: 200 });

  const [isHovered, setIsHovered] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Normalize mouse coordinates from -0.5 to 0.5
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
    
    // Glare position from 0 to 100%
    setGlarePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      suppressHydrationWarning
      style={{ y: cardY, opacity: cardOpacity }}
      className="perspective-[1500px]"
    >
      <motion.div
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        data-cursor="VIEW"
        className="group relative flex flex-col lg:flex-row glass rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl bg-white/[0.02]"
      >
        {/* Dynamic Glassmorphism Glare */}
        {isHovered && (
          <div
            className="absolute inset-0 z-50 pointer-events-none transition-opacity duration-300 mix-blend-overlay"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.15) 0%, transparent 40%)`,
            }}
          />
        )}
        
        {/* Purple/Cyan Glow behind the card on hover */}
        {isHovered && (
          <div
            className="absolute inset-0 z-[-1] pointer-events-none transition-opacity duration-300 blur-[80px]"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(139,92,246,0.3) 0%, transparent 60%)`,
            }}
          />
        )}

        {/* Image with WebGL Distortion */}
        <div className="relative w-full lg:w-[45%] aspect-video lg:aspect-auto overflow-hidden">
          <motion.div suppressHydrationWarning style={{ scale: imageScale }} className="absolute inset-0">
            <ProjectImageDistortion src={project.image} isHovered={isHovered} />
          </motion.div>
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-30 mix-blend-multiply z-10`} />
          {/* Number watermark */}
          <div className="absolute bottom-4 right-4 z-20 text-[8rem] font-bold leading-none text-white/5 select-none font-sans tracking-tighter">
            {project.id}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center relative z-20">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs text-violet-400 tracking-widest border border-violet-500/20 px-3 py-1 rounded-full bg-violet-900/10">
              {project.id} / {String(PROJECTS.length).padStart(2, "0")}
            </span>
          </div>

          <h3 className="text-2xl md:text-4xl font-sans font-medium tracking-tight text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all duration-500 transform translate-z-[50px]">
            {project.title}
          </h3>

          <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8 max-w-lg">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full text-xs font-mono bg-white/5 text-gray-300 border border-white/10 hover:border-violet-400 hover:text-white transition-all duration-300"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="relative z-10 py-32 px-6 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-mono text-xs text-violet-400 tracking-[0.3em] uppercase mb-6"
        >
          02 / Projects
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-[clamp(2rem,5vw,4rem)] font-sans font-medium tracking-tight text-white mb-20 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        >
          Selected Work
        </motion.h2>

        {/* Project cards with individual scroll tracking */}
        <div className="space-y-16">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
