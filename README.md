<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=8b5cf6&height=200&section=header&text=Gouthami%20V&fontSize=60&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=AI%20%26%20Systems%20Engineer&descAlignY=55&descAlign=50" />
  
  <p align="center">
    <b>An award-winning, highly interactive portfolio built with Next.js, Framer Motion, and Three.js</b>
  </p>
  
  <div align="center">
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js" />
    <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  </div>
</div>

<br />

## ✨ The Experience (Animated Effects)

This portfolio is designed to be an immersive, premium web experience rather than a static document. It features complex WebGL and CSS-driven animations that react to user input.

### 🎬 Cinematic Intro
- **System Boot & Glitch**: A custom loading sequence featuring scanning horizontal canvas lines, decorative HUD elements, and a progressive character-by-character neon glitch decode of the name.
- **Shutter Split**: A dramatic vertical shutter opening with a glowing cyan/violet light flare along the seam that reveals the main site.

### 🎨 3D & WebGL Environments
- **Interactive Icosahedron (Hero)**: A floating `react-three-fiber` wireframe icosahedron that emits a violet/cyan gradient and smoothly rotates to track the user's mouse position.
- **Fluid Simulation Canvas**: A full-screen fixed HTML5 Canvas 2D flow field that simulates organic, smoky fluid motion using pseudo-noise, reacting dynamically as the user moves their cursor.
- **Morphing CSS Blobs**: WebGL-free organic morphing blobs sitting behind the About section, driven entirely by pure CSS `border-radius` animations and heavy blurring for a soft glassmorphism effect.

### ✨ Scroll Physics & Animations
- **Lenis Smooth Scroll**: Buttery smooth momentum scrolling that normalizes scroll behavior across all devices.
- **Scroll Progress Neon**: A thin, glowing gradient line fixed at the top of the viewport that accurately tracks read progress.
- **Elastic Scroll Indicators**: A bouncing indicator that stretches based on scroll velocity and snaps back with spring physics when scrolling stops.
- **Parallax Crossfades**: Every section enters the viewport with a slight scale-up (95% → 100%), upward translation, and fade-in to create depth.
- **Clip-Path Reveals**: Section headings wipe into view from left to right using precise CSS `clip-path` animations.

### 🎯 Micro-Interactions
- **Magnetic Navigation Dots**: A right-aligned vertical rail of glassmorphism dots that track the active section (via `IntersectionObserver`) and exhibit a magnetic pull effect on hover.
- **Velocity-Synced Marquee**: An infinite skills marquee that dynamically speeds up in direct proportion to the user's scroll velocity, decaying back to base speed when idle.
- **Contextual Cursor**: A custom SVG cursor that hides the default pointer, featuring a trailing spring-physics outer ring. When hovering over projects, the ring expands and injects contextual labels like **"VIEW"**.
- **Dynamic Glassmorphism Glare**: Project cards feature an overlay gradient that shifts based on mouse coordinates to simulate a physical glass surface catching light.

---

## 🛠 Architecture & Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/) for declarative UI animations
- **3D / WebGL**: [Three.js](https://threejs.org/) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- **Smooth Scroll**: [Lenis](https://lenis.studiofreight.com/) by Studio Freight
- **Icons**: [Lucide React](https://lucide.dev/) (optimized via inline SVGs)
- **Deployment**: Configured for static HTML export on GitHub Pages

## 🚀 Running Locally

Clone the repository and install dependencies:

```bash
git clone https://github.com/GouthamiV24/gouthami.github.io.git
cd gouthami.github.io
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 License

Designed and developed by Gouthami V. All rights reserved.
