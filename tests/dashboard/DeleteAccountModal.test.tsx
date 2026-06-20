import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { DeleteAccountModal } from '../../src/components/dashboard/DeleteAccountModal';

describe('DeleteAccountModal', () => {
  it('keeps the destructive submit disabled until username confirmation matches', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(<DeleteAccountModal username="student" onClose={onClose} onConfirm={onConfirm} />);

    const submit = screen.getByRole('button', { name: 'حذف نهائي' });
    expect(submit.hasAttribute('disabled')).toBe(true);

    fireEvent.change(screen.getByPlaceholderText('student'), { target: { value: 'student' } });

    expect(submit.hasAttribute('disabled')).toBe(false);
    fireEvent.click(submit);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('closes without confirming when cancelled', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(<DeleteAccountModal username="student" onClose={onClose} onConfirm={onConfirm} />);

    screen.getByRole('button', { name: 'إلغاء' }).click();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
