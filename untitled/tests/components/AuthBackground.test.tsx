import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

const mockUseParticleCanvas = vi.fn();
vi.mock('@/src/hooks/useParticleCanvas', () => ({
  useParticleCanvas: (...args: any[]) => mockUseParticleCanvas(...args),
}));

describe('AuthBackground', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockUseParticleCanvas.mockReturnValue({ canvasRef: { current: null }, reducedMotion: true });
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/AuthBackground');
    expect(mod.AuthBackground).toBeDefined();
  });

  it('should render canvas for background effect', async () => {
    const { AuthBackground } = await import('@/src/components/AuthBackground');
    const { container } = render(<AuthBackground />);
    expect(container.querySelector('canvas') || container.querySelector('.bg-\\[\\#0a0f2e\\]')).toBeTruthy();
  });
});