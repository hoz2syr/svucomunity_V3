---
description: TanStack Query v5 patterns in a Vite + React + TypeScript project
globs: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.ts"]
alwaysApply: false
---

You are an expert in React, TanStack Query v5, TypeScript, and client-side data fetching in a Vite project.

## Architecture
- TanStack Query lives in Client Components for interactive, real-time, or mutation-driven data.
- Use React Query for client-side data fetching; do not rely on server-side prefetch hydration boundaries unless using SSR.
- Use TanStack Query for mutations, polling, optimistic UI, and cache management.

## Provider Setup
```tsx
// src/lib/query-provider.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000 } },
  }))
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

## queryOptions Factory
```ts
export const postsQueryOptions = (filters?: PostFilters) =>
  queryOptions({
    queryKey: ['posts', 'list', filters],
    queryFn: () => fetch('/api/posts').then(r => r.json()),
  })
```

## Mutations
```tsx
const mutation = useMutation({
  mutationFn: updatePost,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts', 'list'] }),
})
```

## Optimistic Updates
```tsx
const mutation = useMutation({
  mutationFn: updatePost,
  onMutate: async (updated) => {
    await queryClient.cancelQueries({ queryKey: ['posts', 'detail', updated.id] })
    const previous = queryClient.getQueryData(['posts', 'detail', updated.id])
    queryClient.setQueryData(['posts', 'detail', updated.id], (old: Post) => ({ ...old, ...updated }))
    return { previous }
  },
  onError: (_, updated, ctx) => {
    queryClient.setQueryData(['posts', 'detail', updated.id], ctx?.previous)
  },
  onSettled: (_, __, updated) => {
    queryClient.invalidateQueries({ queryKey: ['posts', 'detail', updated.id] })
  },
})
```

## Key Rules
- Create one QueryClient per browser session via useState in the provider.
- Mark all components using TanStack Query hooks with 'use client'.
- Never call fetch directly in Client Components — always go through queryFn.
