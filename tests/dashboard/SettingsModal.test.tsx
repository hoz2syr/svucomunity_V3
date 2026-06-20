import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SettingsModal } from '../../src/components/dashboard/SettingsModal';

const user = { id: '1', name: 'طالب', username: 'student', email: 'a@example.com' };

describe('SettingsModal', () => {
  it('renders profile fields and records tab changes', () => {
    const onClose = vi.fn();
    const setTab = vi.fn();
    const { rerender } = render(
      <SettingsModal user={user} tab="profile" setTab={setTab} onClose={onClose} />
    );

    expect(screen.getByLabelText('الاسم الكامل')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'الأمان' }));

    expect(setTab).toHaveBeenCalledWith('security');

    rerender(
      <SettingsModal user={user} tab="security" setTab={setTab} onClose={onClose} />
    );

    expect(screen.getByLabelText('كلمة المرور الحالية')).toBeTruthy();
  });

  it('calls close when the modal overlay is clicked', () => {
    const onClose = vi.fn();
    const setTab = vi.fn();

    render(
      <SettingsModal user={user} tab="profile" setTab={setTab} onClose={onClose} />
    );

    fireEvent.click(screen.getByRole('dialog').parentElement!.firstElementChild as Element);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
