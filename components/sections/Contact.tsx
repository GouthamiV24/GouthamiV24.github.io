"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import MagneticButton from "@/components/MagneticButton";

export default function Contact() {
  const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [toastMessage, setToastMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState("loading");
    
    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "YOUR_ACCESS_KEY");
    
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFormState("success");
        setToastMessage("Message sent successfully!");
        (e.target as HTMLFormElement).reset();
      } else {
        setFormState("error");
        setToastMessage("Something went wrong. Please try again.");
      }
    } catch (error) {
      setFormState("error");
      setToastMessage("Network error. Please try again later.");
    }

    setTimeout(() => {
      setFormState("idle");
      setToastMessage("");
    }, 5000);
  };

  // Letter animation for "Let's build something great"
  const headingWords = ["Let's", "build"];
  const gradientWords = ["something", "great."];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08 },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 40, rotateX: -40 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
    },
  };

  return (
    <section id="contact" className="relative z-10 py-32 px-6 md:px-16 lg:px-24">
      <div className="max-w-4xl mx-auto text-center">
        {/* Section label */}
        <motion.p
          suppressHydrationWarning
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-mono text-xs text-violet-400 tracking-[0.3em] uppercase mb-6"
        >
          05 / Contact
        </motion.p>

        {/* Staggered word reveal heading */}
        <motion.h2
          suppressHydrationWarning
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-[clamp(2.5rem,8vw,6rem)] font-sans font-medium tracking-tight leading-[0.9] text-white mb-6 perspective-[1000px]"
        >
          {headingWords.map((w, i) => (
            <motion.span suppressHydrationWarning key={i} variants={wordVariants} className="inline-block mr-[0.3em]">
              {w}
            </motion.span>
          ))}
          <br />
          {gradientWords.map((w, i) => (
            <motion.span
              suppressHydrationWarning
              key={i}
              variants={wordVariants}
              className="inline-block mr-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400"
            >
              {w}
            </motion.span>
          ))}
        </motion.h2>

        <motion.p
          suppressHydrationWarning
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 text-lg mb-12 max-w-md mx-auto"
        >
          I'm always interested in hearing about new opportunities,
          collaborations, and ambitious projects.
        </motion.p>

        {/* Contact Form */}
        <motion.form
          suppressHydrationWarning
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto flex flex-col gap-6 text-left mb-16 relative"
        >
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute -top-16 left-0 right-0 py-3 px-4 rounded-xl text-center text-sm font-medium ${
                formState === "success" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"
              }`}
            >
              {toastMessage}
            </motion.div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-xs font-mono tracking-wider text-gray-400 uppercase ml-1">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 glass"
              placeholder="John Doe"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs font-mono tracking-wider text-gray-400 uppercase ml-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 glass"
              placeholder="john@example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-xs font-mono tracking-wider text-gray-400 uppercase ml-1">Message</label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-300 glass resize-none"
              placeholder="Your message here..."
            />
          </div>

          <button
            type="submit"
            disabled={formState === "loading"}
            className="w-full mt-2 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium tracking-wide hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {formState === "loading" ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              "Send Message"
            )}
          </button>
        </motion.form>

        <motion.div
          suppressHydrationWarning
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap gap-4 justify-center items-center"
        >
          <MagneticButton href="mailto:gouthamiyadu05@gmail.com">
            <div className="px-6 py-3 rounded-full glass text-white text-sm font-medium tracking-wide hover:bg-white/10 transition-all duration-300 flex items-center gap-2">
              Email
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
          </MagneticButton>

          <MagneticButton href="https://www.linkedin.com/in/gouthami-v-65a18a405">
            <div className="px-6 py-3 rounded-full glass text-white text-sm font-medium tracking-wide hover:bg-white/10 transition-all duration-300 flex items-center gap-2">
              LinkedIn
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m7 17 9.2-9.2M17 17V7H7" />
              </svg>
            </div>
          </MagneticButton>
          
          <MagneticButton href="https://github.com/GouthamiV24">
            <div className="px-6 py-3 rounded-full glass text-white text-sm font-medium tracking-wide hover:bg-white/10 transition-all duration-300 flex items-center gap-2">
              GitHub
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </div>
          </MagneticButton>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        suppressHydrationWarning
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-32 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-gray-600 text-xs font-mono uppercase tracking-widest max-w-6xl mx-auto"
      >
        <span suppressHydrationWarning>© {new Date().getFullYear()} Gouthami V</span>
        <span className="mt-4 md:mt-0">Designed & Engineered with Precision</span>
      </motion.footer>
    </section>
  );
}
