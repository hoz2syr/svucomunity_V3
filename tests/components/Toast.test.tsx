import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ToastProvider, useToast } from '@/src/components/ui/Toast';

function TestConsumer() {
  const { toast } = useToast();
  return (
    <div>
      <button onClick={() => toast('نجاح', 'success')}>success</button>
      <button onClick={() => toast('خطأ', 'error')}>error</button>
      <button onClick={() => toast('معلومات', 'info')}>info</button>
    </div>
  );
}

describe('Toast component', () => {
  it('should not render any toast initially', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    expect(screen.queryByText('نجاح')).toBeNull();
  });

  it('should render success toast', async () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    await act(async () => {
      screen.getByText('success').click();
    });
    expect(screen.getByText('نجاح')).toBeDefined();
  });

  it('should render error toast', async () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    await act(async () => {
      screen.getByText('error').click();
    });
    expect(screen.getByText('خطأ')).toBeDefined();
  });

  it('should render info toast', async () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    await act(async () => {
      screen.getByText('info').click();
    });
    expect(screen.getByText('معلومات')).toBeDefined();
  });

  it('should auto-dismiss after timeout', async () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    await act(async () => {
      screen.getByText('success').click();
    });
    expect(screen.getByText('نجاح')).toBeDefined();
    await act(async () => {
      vi.advanceTimersByTime(4100);
    });
    expect(screen.queryByText('نجاح')).toBeNull();
    vi.useRealTimers();
  });

  it('should dismiss on close button click', async () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    await act(async () => {
      screen.getByText('success').click();
    });
    expect(screen.getByText('نجاح')).toBeDefined();
    const closeBtn = screen.getByRole('button', { name: '' });
    const buttons = screen.getAllByRole('button');
    const dismissBtn = buttons.find((btn) => btn.querySelector('svg'));
    if (dismissBtn) {
      await act(async () => {
        dismissBtn.click();
      });
    }
    await waitFor(() => expect(screen.queryByText('نجاح')).toBeNull());
  });

  it('should stack multiple toasts', async () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    await act(async () => {
      screen.getByText('success').click();
      screen.getByText('error').click();
      screen.getByText('info').click();
    });
    expect(screen.getByText('نجاح')).toBeDefined();
    expect(screen.getByText('خطأ')).toBeDefined();
    expect(screen.getByText('معلومات')).toBeDefined();
  });
});
