import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const renderWithRouter = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('TestsCard', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/dashboard/TestsCard');
    expect(mod.TestsCard).toBeDefined();
  });

  it('should render with expected props', async () => {
    const { TestsCard } = await import('@/src/components/dashboard/TestsCard');
    const { container } = renderWithRouter(<TestsCard />);
    expect(container.querySelector('a[href="/dashboard/tests"]')).toBeDefined();
  });
});
