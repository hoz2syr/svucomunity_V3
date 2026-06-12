import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthLoader } from '../components/AuthLoader';

vi.mock('lucide-react', () => ({ Loader2: (props: any) => <span data-testid="loader" {...props} /> }));

describe('AuthLoader', () => {
  it('renders loading spinner', () => {
    render(<AuthLoader />);
    expect(screen.getByTestId('loader')).toBeDefined();
  });

  it('centers content in full viewport', () => {
    const { container } = render(<AuthLoader />);
    const div = container.querySelector('.min-h-screen');
    expect(div).toBeDefined();
    expect(div?.className).toContain('items-center');
    expect(div?.className).toContain('justify-center');
  });

  it('has loading aria-label', () => {
    render(<AuthLoader />);
    const loader = screen.getByTestId('loader');
    expect(loader.getAttribute('aria-label')).toBe('Loading');
  });
});
