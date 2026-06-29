import React from 'react';

export const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-[var(--color-bg-primary)] border border-white/8 rounded-2xl shadow-[var(--shadow-card)] overflow-hidden relative group transition-all duration-200 hover:-translate-y-1 hover:border-white/14 ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-info-light)] blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors pointer-events-none"></div>
    <div className="relative z-10">{children}</div>
  </div>
);
