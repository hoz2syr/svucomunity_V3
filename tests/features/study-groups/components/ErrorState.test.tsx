import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorState } from '@/src/features/study-groups/components/ErrorState';

describe('ErrorState component', () => {
  it('should render default title', () => {
    render(<ErrorState message="خطأ في التحميل" />);
    expect(screen.getByText('حدث خطأ في التحميل')).toBeTruthy();
  });

  it('should render custom title when provided', () => {
    render(<ErrorState title="خطأ مخصص" message="رسالة الخطأ" />);
    expect(screen.getByText('خطأ مخصص')).toBeTruthy();
  });

  it('should render message', () => {
    render(<ErrorState message="فشل تحميل البيانات" />);
    expect(screen.getByText('فشل تحميل البيانات')).toBeTruthy();
  });

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="خطأ" onRetry={onRetry} />);
    expect(screen.getByText('إعادة المحاولة')).toBeTruthy();
  });

  it('should call onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="خطأ" onRetry={onRetry} />);
    fireEvent.click(screen.getByText('إعادة المحاولة'));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('should render custom retry label', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="خطأ" onRetry={onRetry} retryLabel="حاول مرة أخرى" />);
    expect(screen.getByText('حاول مرة أخرى')).toBeTruthy();
  });

  it('should not render retry button when onRetry is not provided', () => {
    render(<ErrorState message="خطأ" />);
    expect(screen.queryByText('إعادة المحاولة')).toBeNull();
  });
});
