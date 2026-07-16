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
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="fixed top-[30%] left-0 w-[600px] h-[600px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="fixed bottom-0 right-[20%] w-[800px] h-[800px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none translate-y-1/2 animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="fixed top-[60%] left-[40%] w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none -translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDuration: '9s' }} />
      </>
    );
  }

  if (variant === 'dashboard') {
    return (
      <>
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="fixed top-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="fixed top-[55%] left-[10%] w-[350px] h-[350px] bg-blue-500/15 blur-[100px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '9s' }} />
        <div className="fixed top-[20%] right-[15%] w-[300px] h-[300px] bg-violet-500/10 blur-[80px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '11s' }} />
      </>
    );
  }

  if (variant === 'feature') {
    return (
      <>
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950 pointer-events-none" />
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="fixed top-0 left-1/4 w-[450px] h-[450px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/12 blur-[120px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="fixed top-[40%] left-[60%] w-[300px] h-[300px] bg-blue-400/8 blur-[80px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />
      </>
    );
  }

  return null;
};
