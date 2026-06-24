import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ErrorBoundary } from '@/src/features/study-groups/components/ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary component', () => {
  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Normal content')).toBeDefined();
  });

  it('should render fallback UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText('حدث خطأ في عرض المجموعات')).toBeDefined();
    expect(screen.getByText('Test error')).toBeDefined();
  });

  it('should render custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom fallback')).toBeDefined();
  });

  it('should reset error state when retry button is clicked', async () => {
    const { unmount } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText('حدث خطأ في عرض المجموعات')).toBeDefined();
    
    await act(async () => {
      fireEvent.click(screen.getByText('إعادة المحاولة'));
    });
    
    unmount();
    render(
      <ErrorBoundary>
        <div>Recovered content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Recovered content')).toBeDefined();
  });
});
