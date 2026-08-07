"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CHARS = "!<>-_\\\\/[]{}—=+*^?#________";

interface ScrambleTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function ScrambleText({ text, className = "", delay = 0 }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [isScrambling, setIsScrambling] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    // Start scrambling after delay
    timeout = setTimeout(() => {
      setIsScrambling(true);
      
      let frame = 0;
      const maxFrames = 30; // How long the scramble lasts
      
      const interval = setInterval(() => {
        let scrambled = "";
        
        for (let i = 0; i < text.length; i++) {
          // If we've passed the reveal point for this character, show the real character
          if (frame > (i / text.length) * maxFrames) {
            scrambled += text[i];
          } else if (text[i] === " ") {
            scrambled += " "; // Don't scramble spaces
          } else {
            // Random character
            scrambled += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }
        
        setDisplayText(scrambled);
        frame++;
        
        if (frame > maxFrames) {
          clearInterval(interval);
          setDisplayText(text); // Ensure perfect final text
          setIsScrambling(false);
        }
      }, 40); // Scramble speed (40ms per frame = 25fps)
      
      return () => clearInterval(interval);
      
    }, delay * 1000); // Convert seconds to ms
    
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <motion.span 
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1, delay }}
    >
      {isScrambling ? displayText : (displayText || " ")}
    </motion.span>
  );
}
