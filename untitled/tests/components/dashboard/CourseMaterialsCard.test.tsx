import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const renderWithRouter = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('CourseMaterialsCard', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/dashboard/CourseMaterialsCard');
    expect(mod.CourseMaterialsCard).toBeDefined();
  });

  it('should render with expected props', async () => {
    const { CourseMaterialsCard } = await import('@/src/components/dashboard/CourseMaterialsCard');
    const { container } = renderWithRouter(<CourseMaterialsCard />);
    expect(container.querySelector('a[href="/dashboard/courses"]')).toBeDefined();
  });
});
