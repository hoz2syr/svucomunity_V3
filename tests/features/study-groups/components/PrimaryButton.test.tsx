import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/src/components/ui/Button';

describe('Button component', () => {
  it('should render children', () => {
    render(<Button variant="primary">إنشاء</Button>);
    expect(screen.getByText('إنشاء')).toBeTruthy();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button variant="primary" onClick={onClick}>انقر</Button>);
    fireEvent.click(screen.getByText('انقر'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('should not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button variant="primary" onClick={onClick} disabled>مُعطّل</Button>);
    fireEvent.click(screen.getByText('مُعطّل'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should render with icon', () => {
    render(<Button variant="primary" icon={<span data-testid="icon">+</span>}>إضافة</Button>);
    expect(screen.getByTestId('icon')).toBeTruthy();
  });

  it('should apply default classes', () => {
    render(<Button variant="primary">زر</Button>);
    const button = screen.getByText('زر');
    expect(button.className).toContain('from-[var(--color-primary-500)]');
    expect(button.className).toContain('rounded-[var(--radius-button)]');
  });

  it('should merge custom className', () => {
    render(<Button variant="primary" className="custom-class">زر</Button>);
    const button = screen.getByText('زر');
    expect(button.className).toContain('custom-class');
  });

  it('should render as submit type when specified', () => {
    render(<Button variant="primary" type="submit">إرسال</Button>);
    const button = screen.getByText('إرسال');
    expect(button.getAttribute('type')).toBe('submit');
  });
});
