import React from 'react';

/**
 * Reusable layout component with a glassmorphism aesthetic.
 * Provides a consistent background, border, and backdrop-blur.
 */
export const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-[#060a1f]/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden relative group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(34,211,238,0.15)] hover:border-white/10 ${className}`}>
    <div className="absolute -inset-px bg-gradient-to-br from-cyan-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm mix-blend-screen pointer-events-none"></div>
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    <div className="relative z-10">{children}</div>
  </div>
);
