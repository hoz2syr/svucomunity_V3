import React from 'react';

export type AppBackgroundVariant = 'landing' | 'dashboard' | 'feature' | 'video-hero';

interface AppBackgroundProps {
  variant?: AppBackgroundVariant;
  videoSrc?: string;
}

export const AppBackground: React.FC<AppBackgroundProps> = ({
  variant = 'feature',
  videoSrc,
}) => {
  if (variant === 'video-hero' && videoSrc) {
    return (
      <>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40 z-[1] pointer-events-none" />
      </>
    );
  }

  if (variant === 'landing') {
    return (
      <>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-950/80 blur-3xl rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-[30%] left-0 w-[600px] h-[600px] bg-slate-900/60 blur-3xl rounded-full pointer-events-none -translate-x-1/2" />
        <div className="absolute bottom-0 right-[20%] w-[800px] h-[800px] bg-slate-950/70 blur-3xl rounded-full pointer-events-none translate-y-1/2" />
      </>
    );
  }

  if (variant === 'dashboard') {
    return (
      <>
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />
        <div className="fixed top-0 left-1/4 w-[400px] h-[400px] bg-cyan-600/10 blur-3xl rounded-full pointer-events-none" />
        <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/8 blur-3xl rounded-full pointer-events-none" />
        <div className="fixed top-[55%] left-[10%] w-[350px] h-[350px] bg-blue-600/8 blur-3xl rounded-full pointer-events-none" />
      </>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900/60 to-slate-950 pointer-events-none" />
  );
};
