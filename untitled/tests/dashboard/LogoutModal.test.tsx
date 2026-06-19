import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LogoutModal } from '../../src/components/dashboard/LogoutModal';

describe('LogoutModal', () => {
  it('calls confirm when the user confirms logout', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(<LogoutModal onClose={onClose} onConfirm={onConfirm} />);

    screen.getByRole('heading', { name: 'تسجيل الخروج' });
    screen.getByRole('button', { name: 'تأكيد الخروج' }).click();

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls close when the user cancels logout', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(<LogoutModal onClose={onClose} onConfirm={onConfirm} />);

    screen.getByRole('button', { name: 'إلغاء' }).click();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
