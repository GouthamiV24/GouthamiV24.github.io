"use client";

import { useEffect, useRef, useState } from "react";

const MARQUEE_ITEMS = [
  "Python", "•", "Java", "•", "C", "•", "Flutter", "•",
  "React", "•", "Node.js", "•", "Flask", "•",
  "Scikit-learn", "•", "Pandas", "•", "NLP", "•",
  "HTML & CSS", "•", "MongoDB", "•",
];

export default function Marquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const lastScrollY = useRef(0);
  const animFrame = useRef(0);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        animFrame.current = requestAnimationFrame(() => {
          const velocity = Math.abs(window.scrollY - lastScrollY.current);
          lastScrollY.current = window.scrollY;
          // Speed up marquee based on scroll velocity (capped at 5x)
          const newSpeed = Math.min(1 + velocity * 0.05, 5);
          setScrollSpeed(newSpeed);
          ticking = false;
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animFrame.current);
    };
  }, []);

  // Decay speed back to 1 when not scrolling
  useEffect(() => {
    if (scrollSpeed > 1.05) {
      const timer = setTimeout(() => {
        setScrollSpeed((prev) => Math.max(1, prev * 0.92));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [scrollSpeed]);

  const duration = 30 / scrollSpeed;

  return (
    <section className="relative z-10 py-16 overflow-hidden border-y border-white/5">
      <div ref={containerRef} className="flex gap-8">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex gap-8 flex-shrink-0 animate-marquee"
            style={{
              animationDuration: `${duration}s`,
            }}
          >
            {MARQUEE_ITEMS.map((item, i) => (
              <span
                key={`${copy}-${i}`}
                className={`text-2xl md:text-4xl font-light tracking-tight whitespace-nowrap ${
                  item === "•"
                    ? "text-violet-500/50 text-lg md:text-xl"
                    : "text-white/20 hover:text-white/80 transition-colors duration-500"
                }`}
              >
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
