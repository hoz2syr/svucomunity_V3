import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PrivacyBadge } from '@/src/features/exam/src/components/PrivacyBadge';

describe('PrivacyBadge', () => {
  it('shows published (public) badge when published is true', () => {
    render(<PrivacyBadge published={true} />);
    expect(screen.getByText('منشور')).toBeDefined();
  });

  it('shows private badge when published is false', () => {
    render(<PrivacyBadge published={false} />);
    expect(screen.getByText('خاص')).toBeDefined();
  });

  it('renders without crashing for published=true', () => {
    const { container } = render(<PrivacyBadge published={true} />);
    expect(container.querySelector('[class*="success"]')).not.toBeNull();
  });

  it('renders without crashing for published=false', () => {
    const { container } = render(<PrivacyBadge published={false} />);
    expect(container.querySelector('[class*="secondary"]')).not.toBeNull();
  });
});
