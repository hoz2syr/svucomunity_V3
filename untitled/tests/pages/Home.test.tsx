import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/src/hooks/useParticleCanvas', () => ({
  useParticleCanvas: () => ({ canvasRef: { current: null }, charRefs: { current: [] }, reducedMotion: true }),
}));

vi.mock('@/src/components/LandingSections', () => ({
  LandingSections: () => <div data-testid="landing-sections" />,
  HeroAddition: () => <div data-testid="hero-addition" />,
  ScrollIndicator: () => <div data-testid="scroll-indicator" />,
  ProblemsSection: () => <div data-testid="problems-section" />,
  SolutionBridge: () => <div data-testid="solution-bridge" />,
  FeaturesSection: () => <div data-testid="features-section" />,
  HowItWorksSection: () => <div data-testid="how-it-works-section" />,
  ComingSoonSection: () => <div data-testid="coming-soon-section" />,
  FinalCTASection: () => <div data-testid="final-cta-section" />,
}));

describe('Home page', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should be importable', async () => {
    const mod = await import('@/src/pages/Home');
    expect(mod.Home).toBeDefined();
  });

  it('should render', async () => {
    const { Home } = await import('@/src/pages/Home');
    const { container } = render(<MemoryRouter><Home /></MemoryRouter>);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});