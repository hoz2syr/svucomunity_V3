import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const renderWithRouter = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('ScheduleExtractionCard', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/dashboard/ScheduleExtractionCard');
    expect(mod.ScheduleExtractionCard).toBeDefined();
  });

  it('should render with expected props', async () => {
    const { ScheduleExtractionCard } = await import('@/src/components/dashboard/ScheduleExtractionCard');
    const { container } = renderWithRouter(<ScheduleExtractionCard />);
    expect(container.querySelector('a[href="/dashboard/schedule"]')).toBeDefined();
  });
});
