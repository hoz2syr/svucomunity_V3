import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/src/components/ui/Button';

describe('Button component', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDefined();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should render with primary variant by default', () => {
    const { container } = render(<Button>Click me</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('from-[var(--color-primary-500)]');
    expect(button?.className).toContain('to-[var(--color-secondary-400)]');
  });

  it('should render with secondary variant', () => {
    const { container } = render(<Button variant="secondary">Click me</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-slate-700');
  });

  it('should render with danger variant', () => {
    const { container } = render(<Button variant="danger">Click me</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-rose-600');
  });

  it('should render icon when provided', () => {
    render(<Button icon={<span data-testid="icon">icon</span>}>Click me</Button>);
    expect(screen.getByTestId('icon')).toBeDefined();
  });

  it('should render as link when to prop is provided', () => {
    render(<Button to="/test">Click me</Button>);
    const link = screen.getByText('Click me').closest('a');
    expect(link).toBeDefined();
    expect(link?.getAttribute('href')).toBe('/test');
  });

  it('should apply custom className', () => {
    const { container } = render(<Button className="custom-class">Click me</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('custom-class');
  });

  it('should support submit type', () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByText('Submit');
    expect(button.getAttribute('type')).toBe('submit');
  });
});