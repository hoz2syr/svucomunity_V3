import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';

describe('PrimaryButton component', () => {
  it('should render children', () => {
    render(<PrimaryButton>إنشاء</PrimaryButton>);
    expect(screen.getByText('إنشاء')).toBeTruthy();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<PrimaryButton onClick={onClick}>انقر</PrimaryButton>);
    fireEvent.click(screen.getByText('انقر'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('should not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<PrimaryButton onClick={onClick} disabled>مُعطّل</PrimaryButton>);
    fireEvent.click(screen.getByText('مُعطّل'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should render with icon', () => {
    render(<PrimaryButton icon={<span data-testid="icon">+</span>}>إضافة</PrimaryButton>);
    expect(screen.getByTestId('icon')).toBeTruthy();
  });

  it('should apply default classes', () => {
    render(<PrimaryButton>زر</PrimaryButton>);
    const button = screen.getByText('زر');
    expect(button.className).toContain('from-[var(--color-primary-500)]');
    expect(button.className).toContain('rounded-xl');
  });

  it('should merge custom className', () => {
    render(<PrimaryButton className="custom-class">زر</PrimaryButton>);
    const button = screen.getByText('زر');
    expect(button.className).toContain('custom-class');
  });

  it('should render as submit type when specified', () => {
    render(<PrimaryButton type="submit">إرسال</PrimaryButton>);
    const button = screen.getByText('إرسال');
    expect(button.getAttribute('type')).toBe('submit');
  });
});
