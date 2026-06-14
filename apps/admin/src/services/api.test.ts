import { describe, expect, it } from 'vitest';
import { vi } from 'vitest';

let mockFrom = vi.fn();

vi.mock('@svu-community/supabase-client', () => ({
  supabase: { from: (...args: unknown[]) => mockFrom(...args) },
}));

import { fetchSettings, updateSettings, testSupabaseConnection, DEFAULT_SETTINGS } from '../services/api';

describe('api.fetchSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom = vi.fn();
  });

  it('returns defaults when no row exists', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
      }),
    });

    const result = await fetchSettings();
    expect(result).toEqual(DEFAULT_SETTINGS);
  });

  it('returns stored settings', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        maybeSingle: () =>
          Promise.resolve({
            data: {
              site_name: 'My App',
              site_description: 'Desc',
              default_theme: 'dark',
              allow_new_registrations: false,
              maintenance_mode: true,
            },
            error: null,
          }),
      }),
    });

    const result = await fetchSettings();
    expect(result.siteName).toBe('My App');
    expect(result.defaultTheme).toBe('dark');
    expect(result.allowNewRegistrations).toBe(false);
    expect(result.maintenanceMode).toBe(true);
  });

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        maybeSingle: () => Promise.resolve({ data: null, error: { message: 'DB error' } }),
      }),
    });

    await expect(fetchSettings()).rejects.toThrow('Failed to fetch settings');
  });
});

describe('api.updateSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom = vi.fn();
  });

  it('upserts and returns updated settings', async () => {
    const savedData = {
      site_name: 'New Name',
      site_description: 'New Desc',
      default_theme: 'light',
      allow_new_registrations: true,
      maintenance_mode: false,
    };
    mockFrom.mockReturnValue({
      upsert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: savedData, error: null }),
        }),
      }),
    });

    const result = await updateSettings({ siteName: 'New Name' });
    expect(result.siteName).toBe('New Name');
  });

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      upsert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'upsert error' } }),
        }),
      }),
    });

    await expect(updateSettings({ siteName: 'X' })).rejects.toThrow('Failed to update settings');
  });
});

describe('api.testSupabaseConnection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom = vi.fn();
  });

  it('returns success with latency on successful query', async () => {
    mockFrom.mockReturnValue({
      select: () => ({ limit: () => Promise.resolve({ error: null }) }),
    });

    const result = await testSupabaseConnection();
    expect(result.success).toBe(true);
    expect(typeof result.latency).toBe('number');
    expect(result.latency).toBeGreaterThanOrEqual(0);
    expect(result.timestamp).toBeTruthy();
  });

  it('returns success false on database error', async () => {
    mockFrom.mockReturnValue({
      select: () => ({ limit: () => Promise.resolve({ error: { message: 'timeout' } }) }),
    });

    const result = await testSupabaseConnection();
    expect(result.success).toBe(false);
    expect(typeof result.latency).toBe('number');
  });
});
