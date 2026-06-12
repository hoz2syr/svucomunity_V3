import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '../components/ErrorBoundary'

const ThrowError = () => { throw new Error('Test crash') }

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(<ErrorBoundary><div data-testid="child">OK</div></ErrorBoundary>)
    expect(screen.getByTestId('child')).toBeDefined()
  })

  it('renders fallback when error occurs', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      render(<ErrorBoundary><ThrowError /></ErrorBoundary>)
      expect(screen.getByText('Something went wrong')).toBeDefined()
    } finally {
      spy.mockRestore()
    }
  })

  it('renders custom fallback when provided', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      render(<ErrorBoundary fallback={<div data-testid="custom">Custom fallback</div>}><ThrowError /></ErrorBoundary>)
      expect(screen.getByTestId('custom')).toBeDefined()
    } finally {
      spy.mockRestore()
    }
  })

  it('shows Refresh Page button', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      render(<ErrorBoundary><ThrowError /></ErrorBoundary>)
      expect(screen.getByText('Refresh Page')).toBeDefined()
    } finally {
      spy.mockRestore()
    }
  })
})
