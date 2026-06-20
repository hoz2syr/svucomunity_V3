import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const renderWithRouter = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('FeatureCard', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/dashboard/FeatureCard');
    expect(mod.FeatureCard).toBeDefined();
  });

  it('should render title and description', async () => {
    const { FeatureCard } = await import('@/src/components/dashboard/FeatureCard');
    renderWithRouter(
      <FeatureCard
        title="Test Title"
        description="Test Description"
        icon={<span data-testid="test-icon">icon</span>}
        iconBg="#000"
        iconColor="#fff"
        linkTo="/test"
        linkLabel="Go"
        index={0}
      />
    );
    expect(screen.getByText('Test Title')).toBeDefined();
    expect(screen.getByText('Test Description')).toBeDefined();
    expect(screen.getByTestId('test-icon')).toBeDefined();
  });

  it('should render link with correct href', async () => {
    const { FeatureCard } = await import('@/src/components/dashboard/FeatureCard');
    renderWithRouter(
      <FeatureCard
        title="Title"
        description="Desc"
        icon={<span>icon</span>}
        iconBg="#000"
        iconColor="#fff"
        linkTo="/dashboard/tests"
        linkLabel="عرض"
        index={0}
      />
    );
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/dashboard/tests');
  });
});
