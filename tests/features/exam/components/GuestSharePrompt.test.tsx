import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { GuestSharePrompt } from '@/src/features/exam/src/components/GuestSharePrompt';
import { BrowserRouter } from 'react-router-dom';

const renderWithRouter = (ui: React.ReactElement) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

describe('GuestSharePrompt', () => {
  it('does not render when open is false', () => {
    const { container } = renderWithRouter(<GuestSharePrompt open={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders login prompt by default when open is true', () => {
    renderWithRouter(<GuestSharePrompt open />);
    expect(screen.getByText('تسجيل الدخول للمشاركة')).toBeDefined();
  });

  it('renders login prompt for a specific test title', () => {
    const { container } = renderWithRouter(<GuestSharePrompt open testTitle="اختبار علمي" />);
    const paragraph = container.querySelector('p');
    expect(paragraph?.textContent).toContain('اختبار علمي');
    expect(screen.getByText('تسجيل الدخول للمشاركة')).toBeDefined();
  });

  it('renders generic message when testTitle is not provided', () => {
    renderWithRouter(<GuestSharePrompt open />);
    expect(screen.getByText(/محفوظ على هذا الجهاز فقط/)).toBeDefined();
  });

  it('renders inline version (without modal backdrop) when onClose is not provided', () => {
    const { container } = renderWithRouter(<GuestSharePrompt open />);
    const fixedOverlay = container.querySelector('.fixed.inset-0');
    expect(fixedOverlay).toBeNull();
  });

  it('renders modal version when onClose is provided', () => {
    const onClose = vi.fn();
    const { container } = renderWithRouter(<GuestSharePrompt open onClose={onClose} />);
    expect(container.querySelector('.fixed.inset-0')).not.toBeNull();
  });

  it('calls onClose when backdrop is clicked (modal version)', async () => {
    const onClose = vi.fn();
    const { container } = renderWithRouter(<GuestSharePrompt open onClose={onClose} />);

    const backdrop = container.querySelector('[class*="bg-black/60"]') as HTMLElement;
    await act(async () => {
      fireEvent.click(backdrop);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked (modal version)', async () => {
    const onClose = vi.fn();
    renderWithRouter(<GuestSharePrompt open onClose={onClose} />);

    await act(async () => {
      screen.getByLabelText('إغلاق').click();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
