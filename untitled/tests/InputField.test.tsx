import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InputField } from '../src/components/ui/InputField';

describe('InputField', () => {
  it('renders label and input', () => {
    render(<InputField label="البريد الإلكتروني" type="email" id="email" />);
    expect(screen.getByLabelText('البريد الإلكتروني')).toBeDefined();
  });

  it('shows error message when provided', () => {
    render(<InputField label="البريد" type="text" id="name" error="مطلوب" />);
    expect(screen.getByText('مطلوب')).toBeDefined();
  });

  it('respects disabled state', () => {
    render(<InputField label="مؤمن" type="text" id="x" disabled />);
    const input = screen.getByLabelText('مؤمن') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
