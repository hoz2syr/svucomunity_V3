import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../components/layout/Header';

describe('Header', () => {
  it('renders title and subtitle', () => {
    render(<Header />);
    expect(screen.getByText('المواد الدراسية')).toBeDefined();
    expect(screen.getByText('مجتمع طلاب الجامعة')).toBeDefined();
  });

  it('renders header element', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeDefined();
  });
});
