"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const sections = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" }
];

export default function NavigationDots() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-4">
      {sections.map((section) => {
        const isActive = activeSection === section.id;
        return (
          <div key={section.id} className="relative group flex items-center justify-end">
            {/* Tooltip */}
            <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none pr-4">
              <div className="bg-white/10 backdrop-blur-md text-white text-xs py-1 px-2 rounded-md border border-white/20 whitespace-nowrap shadow-lg">
                {section.label}
              </div>
            </div>

            {/* Dot */}
            <motion.button
              onClick={() => scrollToSection(section.id)}
              whileHover={{ scale: 1.5 }}
              className={`rounded-full border border-white/30 transition-all duration-300 ${
                isActive
                  ? "w-3 h-3 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)] border-violet-400"
                  : "w-2 h-2 bg-transparent hover:bg-white/20"
              }`}
              aria-label={`Scroll to ${section.label}`}
            />
          </div>
        );
      })}
    </div>
  );
}
