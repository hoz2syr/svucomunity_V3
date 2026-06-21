import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../../src/contexts/AuthContext';

describe('AuthContext', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should export useAuth hook', async () => {
    const mod = await import('../../src/contexts/AuthContext');
    expect(typeof mod.useAuth).toBe('function');
  });

  it('should export AuthProvider component', async () => {
    const mod = await import('../../src/contexts/AuthContext');
    expect(typeof mod.AuthProvider).toBe('function');
  });

  it('should throw when useAuth is used outside AuthProvider', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    let thrown = false;
    let message = '';
    try {
      renderHook(() => useAuth());
    } catch (e) {
      thrown = true;
      message = (e as Error).message;
    }
    consoleError.mockRestore();
    expect(thrown).toBe(true);
    expect(message).toBe('useAuth must be used within AuthProvider');
  });

  it('should have correct context value shape when provided', async () => {
    const mod = await import('../../src/contexts/AuthContext');
    const { AuthProvider, useAuth } = mod;

    const { render } = await import('@testing-library/react');

    let capturedValue: unknown;
    const Consumer = () => {
      capturedValue = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    const ctx = capturedValue as Record<string, unknown>;
    expect(ctx).toHaveProperty('session');
    expect(ctx).toHaveProperty('profile');
    expect(ctx).toHaveProperty('loading');
    expect(ctx).toHaveProperty('refreshProfile');
    expect(ctx).toHaveProperty('envMissing');
    expect(ctx).toHaveProperty('error');
    expect(ctx).toHaveProperty('clearError');
  });
});
