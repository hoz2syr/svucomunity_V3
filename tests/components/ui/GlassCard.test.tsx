import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

describe('GlassCard', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/ui/GlassCard');
    expect(mod.GlassCard).toBeDefined();
  });

  it('should render children', async () => {
    const { GlassCard } = await import('@/src/components/ui/GlassCard');
    render(<GlassCard><span data-testid="glass-child">inside</span></GlassCard>);
    expect(screen.getByTestId('glass-child')).toBeDefined();
  });
});
