import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MajorSelector } from '../components/major-selector';

describe('MajorSelector', () => {
  it('renders majors list', () => {
    render(<MajorSelector majors={['CS', 'IT']} selectedMajor="CS" onSelectMajor={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveTextContent('CS');
  });

  it('calls onSelectMajor on change', () => {
    const onSelect = vi.fn();
    render(<MajorSelector majors={['CS', 'IT']} selectedMajor="CS" onSelectMajor={onSelect} />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('IT'));
    expect(onSelect).toHaveBeenCalledWith('IT');
  });

  it('shows empty state when no majors', () => {
    render(<MajorSelector majors={[]} selectedMajor="" onSelectMajor={() => {}} />);
    expect(screen.getByText('لا توجد تخصصات متاحة')).toBeDefined();
  });
});
