import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModalShell } from '@/src/features/study-groups/components/ModalShell';

describe('ModalShell component', () => {
  it('should render when isOpen is true', () => {
    render(
      <ModalShell isOpen={true} onClose={vi.fn()}>
        <div>Modal content</div>
      </ModalShell>
    );
    expect(screen.getByText('Modal content')).toBeDefined();
  });

  it('should not render when isOpen is false', () => {
    render(
      <ModalShell isOpen={false} onClose={vi.fn()}>
        <div>Modal content</div>
      </ModalShell>
    );
    expect(screen.queryByText('Modal content')).toBeNull();
  });

  it('should render close button when closeButton is true', () => {
    render(
      <ModalShell isOpen={true} onClose={vi.fn()} closeButton>
        <div>Modal content</div>
      </ModalShell>
    );
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeDefined();
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <ModalShell isOpen={true} onClose={onClose}>
        <div>Modal content</div>
      </ModalShell>
    );
    const backdrop = screen.getByText('Modal content').closest('.fixed');
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('should not close when clicking inside the modal container', () => {
    const onClose = vi.fn();
    render(
      <ModalShell isOpen={true} onClose={onClose}>
        <button>Inside button</button>
      </ModalShell>
    );
    fireEvent.click(screen.getByText('Inside button'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should apply custom maxWidth', () => {
    const { container } = render(
      <ModalShell isOpen={true} onClose={vi.fn()} maxWidth="max-w-2xl">
        <div>Content</div>
      </ModalShell>
    );
    const modal = container.querySelector('.max-w-2xl');
    expect(modal).toBeTruthy();
  });
});
