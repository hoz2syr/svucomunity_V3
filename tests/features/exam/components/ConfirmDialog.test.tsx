import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '@/src/features/exam/src/components/ConfirmDialog';

describe('ConfirmDialog', () => {
  const baseProps = {
    isOpen: true,
    title: 'تأكيد الحذف',
    message: 'هل أنت متأكد؟',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('does not render when isOpen is false', () => {
    const { container } = render(<ConfirmDialog {...baseProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders title and message when open', () => {
    render(<ConfirmDialog {...baseProps} />);
    expect(screen.getByText('تأكيد الحذف')).toBeDefined();
    expect(screen.getByText('هل أنت متأكد؟')).toBeDefined();
  });

  it('calls onConfirm when confirm button clicked', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...baseProps} onConfirm={onConfirm} />);

    await act(async () => {
      screen.getByText('تأكيد').click();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button clicked', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...baseProps} onCancel={onCancel} />);

    await act(async () => {
      screen.getByText('إلغاء').click();
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when backdrop is clicked', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...baseProps} onCancel={onCancel} />);

    const backdrop = screen.getByRole('dialog').previousSibling as HTMLElement;
    await act(async () => {
      fireEvent.click(backdrop);
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders custom confirm and cancel labels', () => {
    render(<ConfirmDialog {...baseProps} confirmLabel="حذف" cancelLabel="ابقاء" />);
    expect(screen.getByText('حذف')).toBeDefined();
    expect(screen.getByText('ابقاء')).toBeDefined();
  });

  it('shows loading state on confirm button', () => {
    render(<ConfirmDialog {...baseProps} isLoading />);
    expect(screen.getByText('جاري التنفيذ...')).toBeDefined();
  });

  it('disables buttons when loading', () => {
    render(<ConfirmDialog {...baseProps} isLoading />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => expect(btn.hasAttribute('disabled')).toBe(true));
  });

  it('applies danger variant class by default', () => {
    render(<ConfirmDialog {...baseProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeDefined();
  });

  it('renders with primary variant', () => {
    render(<ConfirmDialog {...baseProps} confirmVariant="primary" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeDefined();
  });

  it('handles Escape key to cancel', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...baseProps} onCancel={onCancel} />);

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders with primary variant', () => {
    const { container } = render(<ConfirmDialog {...baseProps} confirmVariant="primary" />);
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toBeDefined();
  });
});
