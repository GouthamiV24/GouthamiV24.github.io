"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import About from "@/components/sections/About";
import Marquee from "@/components/sections/Marquee";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";
import Divider from "@/components/Divider";
import CustomCursor from "@/components/CustomCursor";
import CinematicIntro from "@/components/CinematicIntro";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import NavigationDots from "@/components/NavigationDots";
import ElasticIndicator from "@/components/ElasticIndicator";
import SectionTransition from "@/components/SectionTransition";

const FluidCanvas = dynamic(() => import("@/components/FluidCanvas"), {
  ssr: false,
});

const Scene3D = dynamic(() => import("@/components/Scene3D"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <CinematicIntro />
      <ScrollProgressBar />
      
      {/* Background layers */}
      <div className="gradient-bg" />
      
      {/* Floating Glowing Orbs */}
      <div className="fixed top-[20%] left-[10%] w-[40vw] h-[40vw] bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-[pulse_10s_ease-in-out_infinite]" />
      <div className="fixed bottom-[10%] right-[5%] w-[35vw] h-[35vw] bg-cyan-600/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none animate-[pulse_12s_ease-in-out_infinite_reverse]" />
      
      <div className="grid-overlay" />
      <div className="noise-overlay" />
      <FluidCanvas />
      <Scene3D />
      <CustomCursor />
      <NavigationDots />
      <ElasticIndicator />

      {/* Navigation */}
      <Navbar />

      {/* Content */}
      <Hero />
      <Divider />
      
      <SectionTransition>
        <Manifesto />
      </SectionTransition>
      
      <Divider />
      
      <SectionTransition>
        <About />
      </SectionTransition>
      
      <Marquee />
      
      <SectionTransition>
        <Projects />
      </SectionTransition>
      
      <Divider />
      
      <SectionTransition>
        <Experience />
      </SectionTransition>
      
      <Divider />
      
      <SectionTransition>
        <Skills />
      </SectionTransition>
      
      <Divider />
      
      <SectionTransition>
        <Contact />
      </SectionTransition>
    </>
  );
}
