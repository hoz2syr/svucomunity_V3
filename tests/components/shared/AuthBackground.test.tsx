import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

const mockUseParticleCanvas = vi.fn();
vi.mock('@/src/hooks/useParticleCanvas', () => ({
  useParticleCanvas: (...args: any[]) => mockUseParticleCanvas(...args),
}));

describe('AuthBackground', () => {
  beforeEach(() => {
    vi.resetModules();
    mockUseParticleCanvas.mockReturnValue({ canvasRef: { current: null }, reducedMotion: true });
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/AuthBackground');
    expect(mod.AuthBackground).toBeDefined();
  });

  it('should render background div when reduced motion', async () => {
    const { AuthBackground } = await import('@/src/components/AuthBackground');
    const { container } = render(<AuthBackground />);
    expect(container.querySelector('div')).toBeTruthy();
  });
});