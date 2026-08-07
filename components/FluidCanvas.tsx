"use client";

import React, { useEffect, useRef } from 'react';

export default function FluidCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // We use a regular transparent canvas rather than opaque to allow blending if needed, 
    // but drawing a dark background for trails.
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let animationFrameId: number;
    let mouseX = -1000;
    let mouseY = -1000;
    
    // Check if touch device for performance scaling
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const particleCount = isTouch ? 300 : 800;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = '#050505'; // Dark background
      ctx.fillRect(0, 0, width, height);
    };

    window.addEventListener('resize', resize);
    resize();

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
      size: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.maxLife = Math.random() * 100 + 50;
        this.life = Math.random() * this.maxLife;
        // Cyan and Violet colors
        const isCyan = Math.random() > 0.5;
        this.color = isCyan ? 'rgba(6, 182, 212, 1)' : 'rgba(139, 92, 246, 1)'; 
        this.size = Math.random() * 1.5 + 0.5;
      }

      update(time: number) {
        // Pseudo-noise flow field to simulate organic smoke
        const scale = 0.003;
        const angle = (Math.sin(this.x * scale + time) + Math.cos(this.y * scale + time)) * Math.PI * 2;
        
        // Mouse interaction: fluid moves away from cursor
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          const force = (150 - dist) / 150;
          this.vx -= (dx / dist) * force * 1.5;
          this.vy -= (dy / dist) * force * 1.5;
        }

        // Apply flow field force
        this.vx += Math.cos(angle) * 0.15;
        this.vy += Math.sin(angle) * 0.15;

        // Friction
        this.vx *= 0.92;
        this.vy *= 0.92;

        this.x += this.vx;
        this.y += this.vy;

        this.life--;
        // Reset particle if it dies or goes out of bounds
        if (this.life <= 0 || this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.life = this.maxLife;
          this.vx = 0;
          this.vy = 0;
        }
      }

      draw() {
        if (!ctx) return;
        // Max opacity 0.2 for subtle smoky effect
        const opacity = (this.life / this.maxLife) * 0.2;
        ctx.fillStyle = this.color.replace('1)', `${opacity})`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;
    const animate = () => {
      time += 0.003;
      
      // Smoky trails effect by drawing a semi-transparent black rectangle over the canvas
      ctx.fillStyle = 'rgba(5, 5, 5, 0.08)';
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        p.update(time);
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: '100vw', height: '100vh', opacity: 0.8 }}
      suppressHydrationWarning
    />
  );
}
