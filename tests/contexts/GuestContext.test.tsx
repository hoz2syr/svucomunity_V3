import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { GuestProvider, useGuest } from '../../src/contexts/GuestContext';

const ENCRYPTION_KEY = 'svu-community-guest-v3-2026';

const toUint8Array = (str: string): Uint8Array => new TextEncoder().encode(str);

const fromUint8Array = (arr: Uint8Array): string => new TextDecoder().decode(arr);

const uint8ToBase64 = (arr: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary);
};

const encrypt = (data: string): string => {
  const keyBytes = toUint8Array(ENCRYPTION_KEY);
  const dataBytes = toUint8Array(data);
  const result = new Uint8Array(dataBytes.length);
  for (let i = 0; i < dataBytes.length; i++) {
    result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  return uint8ToBase64(result);
};

const decrypt = (encoded: string): string => {
  const keyBytes = toUint8Array(ENCRYPTION_KEY);
  const binary = atob(encoded);
  const dataBytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    dataBytes[i] = binary.charCodeAt(i);
  }
  const result = new Uint8Array(dataBytes.length);
  for (let i = 0; i < dataBytes.length; i++) {
    result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  return fromUint8Array(result);
};

const renderWithProvider = () =>
  renderHook(() => useGuest(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <GuestProvider>{children}</GuestProvider>
    ),
  });

describe('GuestContext', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('starts with isGuest false and no profile', () => {
    const { result } = renderWithProvider();
    expect(result.current.isGuest).toBe(false);
    expect(result.current.guestProfile).toBeNull();
  });

  it('enableGuestMode sets isGuest true with default profile', () => {
    const { result } = renderWithProvider();
    act(() => {
      result.current.enableGuestMode();
    });
    expect(result.current.isGuest).toBe(true);
    expect(result.current.guestProfile).not.toBeNull();
    expect(result.current.guestProfile?.name).toBe('زائر');
    expect(result.current.guestProfile?.email).toContain('@local');
  });

  it('enableGuestMode accepts custom profile', () => {
    const { result } = renderWithProvider();
    act(() => {
      result.current.enableGuestMode({ name: 'مستخدم تجريبي', email: 'test@local' });
    });
    expect(result.current.isGuest).toBe(true);
    expect(result.current.guestProfile?.name).toBe('مستخدم تجريبي');
    expect(result.current.guestProfile?.email).toBe('test@local');
  });

  it('disableGuestMode resets state', () => {
    const { result } = renderWithProvider();
    act(() => {
      result.current.enableGuestMode();
    });
    expect(result.current.isGuest).toBe(true);
    act(() => {
      result.current.disableGuestMode();
    });
    expect(result.current.isGuest).toBe(false);
    expect(result.current.guestProfile).toBeNull();
  });

  it('persists profile as encrypted data in sessionStorage', () => {
    const { result } = renderWithProvider();
    act(() => {
      result.current.enableGuestMode({ name: 'مخزن', email: 'stored@local' });
    });
    const raw = sessionStorage.getItem('svu-guest-profile');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(decrypt(raw!));
    expect(parsed.name).toBe('مخزن');
    expect(parsed.email).toBe('stored@local');
  });

  it('restores guest state from encrypted sessionStorage on mount', () => {
    sessionStorage.setItem('svu-guest-mode', 'true');
    sessionStorage.setItem(
      'svu-guest-profile',
      encrypt(JSON.stringify({ name: 'محفوظ', email: 'saved@local' }))
    );

    const { result } = renderWithProvider();
    expect(result.current.isGuest).toBe(true);
    expect(result.current.guestProfile?.name).toBe('محفوظ');
  });

  it('throws when used outside GuestProvider', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    let thrown = false;
    let message = '';
    try {
      renderHook(() => useGuest());
    } catch (e) {
      thrown = true;
      message = (e as Error).message;
    }
    consoleError.mockRestore();
    expect(thrown).toBe(true);
    expect(message).toBe('useGuest must be used within GuestProvider');
  });
});
