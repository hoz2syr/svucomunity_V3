import React from 'react';

export type AppBackgroundVariant = 'landing' | 'dashboard' | 'feature';

interface AppBackgroundProps {
  variant?: AppBackgroundVariant;
}

export const AppBackground: React.FC<AppBackgroundProps> = ({ variant = 'feature' }) => {
  if (variant === 'landing') {
    return (
      <>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-[30%] left-0 w-[600px] h-[600px] bg-cyan-600/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none -translate-x-1/2" />
        <div className="absolute bottom-0 right-[20%] w-[800px] h-[800px] bg-purple-900/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none translate-y-1/2" />
      </>
    );
  }

  if (variant === 'dashboard') {
    return (
      <>
        <div className="fixed inset-0 bg-gradient-to-br from-[var(--color-bg-tertiary)] via-[var(--color-bg-secondary)] to-[var(--color-bg-tertiary)] pointer-events-none" />
        <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[var(--color-info)]/10 blur-[180px] rounded-full pointer-events-none" />
        <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-[var(--color-indigo-600)]/12 blur-[160px] rounded-full pointer-events-none" />
      </>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[var(--color-bg-tertiary)] via-[var(--color-bg-secondary)]/40 to-[var(--color-bg-tertiary)] pointer-events-none" />
  );
};
