import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const queryClient = new QueryClient();

function useTest() {
  return { value: 42 };
}

describe('minimal test', () => {
  it('renders', () => {
    const { result } = renderHook(() => useTest(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    expect(result.current.value).toBe(42);
  });
});
