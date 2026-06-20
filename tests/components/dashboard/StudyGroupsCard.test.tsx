import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const renderWithRouter = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('StudyGroupsCard', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/dashboard/StudyGroupsCard');
    expect(mod.StudyGroupsCard).toBeDefined();
  });

  it('should render with expected props', async () => {
    const { StudyGroupsCard } = await import('@/src/components/dashboard/StudyGroupsCard');
    const { container } = renderWithRouter(<StudyGroupsCard />);
    expect(container.querySelector('a[href="/dashboard/study-groups"]')).toBeDefined();
  });
});
