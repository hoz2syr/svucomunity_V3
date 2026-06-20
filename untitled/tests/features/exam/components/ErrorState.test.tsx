import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ErrorState } from '@/src/features/exam/src/components/ErrorState';

describe('ErrorState', () => {
  it('renders title and message', () => {
    render(<ErrorState title="خطأ" message="وصف الخطأ" />);
    expect(screen.getByText('خطأ')).toBeInTheDocument();
    expect(screen.getByText('وصف الخطأ')).toBeInTheDocument();
  });

  it('renders default title when not provided', () => {
    render(<ErrorState message="رسالة" />);
    expect(screen.getByText('حدث خطأ غير متوقع')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const retry = vi.fn();
    render(<ErrorState message="رسالة" onRetry={retry} />);
    expect(screen.getByText('إعادة المحاولة')).toBeInTheDocument();
  });

  it('does not render retry button when onRetry is absent', () => {
    render(<ErrorState message="رسالة" />);
    expect(screen.queryByText('إعادة المحاولة')).not.toBeInTheDocument();
  });
});
