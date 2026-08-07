"use client";

import React from "react";

export default function MorphingBlob() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-[-1]">
      <div className="relative w-full max-w-[800px] aspect-square opacity-60">
        {/* Blob 1: Violet */}
        <div 
          className="absolute inset-0 bg-violet-600/15 blur-[80px] rounded-full animate-blob-morph"
          style={{ animationDuration: '12s' }}
        />
        {/* Blob 2: Cyan */}
        <div 
          className="absolute inset-0 bg-cyan-600/15 blur-[80px] rounded-full animate-blob-morph"
          style={{ animationDuration: '15s', animationDirection: 'reverse', transform: 'scale(0.9) rotate(45deg)' }}
        />
        {/* Blob 3: Purple */}
        <div 
          className="absolute inset-0 bg-purple-600/15 blur-[80px] rounded-full animate-blob-morph"
          style={{ animationDuration: '18s', animationDelay: '-5s', transform: 'scale(0.8) translate(10%, -10%)' }}
        />
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blob-morph {
          0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }
        .animate-blob-morph {
          animation: blob-morph ease-in-out infinite;
        }
      ` }} />
    </div>
  );
}
