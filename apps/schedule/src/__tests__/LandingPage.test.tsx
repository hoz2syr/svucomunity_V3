import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LandingPage } from '../components/LandingPage'

vi.mock('motion/react', () => ({
  motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div>, h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1> },
}))

vi.mock('@/components/ui/Card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => <button onClick={onClick} {...props}>{children}</button>,
}))

describe('LandingPage', () => {
  const mockOnLogin = vi.fn()

  it('renders main headline', () => {
    render(<LandingPage onLogin={mockOnLogin} />)
    expect(screen.getByText(/Find Your Perfect Study Group/)).toBeDefined()
  })

  it('renders feature cards', () => {
    render(<LandingPage onLogin={mockOnLogin} />)
    expect(screen.getByText('Snap & Upload')).toBeDefined()
    expect(screen.getByText('AI Extraction')).toBeDefined()
    expect(screen.getByText('Join Groups')).toBeDefined()
  })

  it('calls onLogin when button clicked', () => {
    render(<LandingPage onLogin={mockOnLogin} />)
    fireEvent.click(screen.getByText('Get Started Now'))
    expect(mockOnLogin).toHaveBeenCalledOnce()
  })

  it('renders AI explanation paragraph', () => {
    render(<LandingPage onLogin={mockOnLogin} />)
    expect(screen.getByText(/AI extracts course codes/)).toBeDefined()
  })
})
