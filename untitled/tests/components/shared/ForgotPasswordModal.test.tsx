import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

const mockResetPassword = vi.fn();
vi.mock('@/src/services/auth.service', () => ({
  resetPassword: (...args: any[]) => mockResetPassword(...args),
}));

describe('ForgotPasswordModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/shared/ForgotPasswordModal');
    expect(mod.ForgotPasswordModal).toBeDefined();
  });

  it('should not render when isOpen is false', async () => {
    const { ForgotPasswordModal } = await import('@/src/components/shared/ForgotPasswordModal');
    render(<ForgotPasswordModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should call onClose when cancel button clicked', async () => {
    const onClose = vi.fn();
    const { ForgotPasswordModal } = await import('@/src/components/shared/ForgotPasswordModal');
    render(<ForgotPasswordModal isOpen={true} onClose={onClose} />);
    const closeBtn = screen.queryByLabelText('إغلاق');
    if (closeBtn) fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
