import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { PublishConfirmDialog } from '@/src/features/exam/src/components/PublishConfirmDialog';

describe('PublishConfirmDialog', () => {
  const baseProps = {
    isOpen: true,
    testTitle: 'اختبار النشر',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('does not render when isOpen is false', () => {
    const { container } = render(<PublishConfirmDialog {...baseProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the dialog title when open', () => {
    render(<PublishConfirmDialog {...baseProps} />);
    expect(screen.getByText('تأكيد نشر الاختبار')).toBeDefined();
  });

  it('renders the test title inside the dialog', () => {
    const { container } = render(<PublishConfirmDialog {...baseProps} />);
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog?.textContent).toContain('اختبار النشر');
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    render(<PublishConfirmDialog {...baseProps} onConfirm={onConfirm} />);

    await act(async () => {
      screen.getByText('نشر ومشاركة').click();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn();
    render(<PublishConfirmDialog {...baseProps} onCancel={onCancel} />);

    await act(async () => {
      screen.getByText('إلغاء').click();
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel on Escape key press', async () => {
    const onCancel = vi.fn();
    render(<PublishConfirmDialog {...baseProps} onCancel={onCancel} />);

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows loading text on confirm button when isLoading is true', () => {
    render(<PublishConfirmDialog {...baseProps} isLoading />);
    expect(screen.getByText('جاري النشر...')).toBeDefined();
  });

  it('disables buttons when isLoading is true', () => {
    render(<PublishConfirmDialog {...baseProps} isLoading />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect(btn.hasAttribute('disabled')).toBe(true));
  });

  it('has correct ARIA dialog attributes', () => {
    render(<PublishConfirmDialog {...baseProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });
});
