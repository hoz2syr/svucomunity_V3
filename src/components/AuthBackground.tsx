import React from 'react';
import { useParticleCanvas } from '../hooks/useParticleCanvas';

export const AuthBackground: React.FC = () => {
  const { canvasRef, reducedMotion } = useParticleCanvas({
    particleCount: 80,
  });

  if (reducedMotion) {
    return <div className="absolute inset-0 bg-[#0a0f2e] pointer-events-none" />;
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 block w-full h-full pointer-events-none z-0"
    />
  );
};
