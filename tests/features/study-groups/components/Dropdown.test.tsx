import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Dropdown } from '@/src/components/ui/Dropdown';

const mockOptions = [
  { value: 'cs', label: 'Computer Science' },
  { value: 'eng', label: 'Engineering' },
  { value: 'med', label: 'Medicine' },
];

describe('Dropdown component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with placeholder when no value selected', () => {
    render(<Dropdown value="" onChange={vi.fn()} options={mockOptions} placeholder="Select major" />);
    expect(screen.getByText('Select major')).toBeDefined();
  });

  it('should render selected option label', () => {
    render(<Dropdown value="cs" onChange={vi.fn()} options={mockOptions} placeholder="Select major" />);
    expect(screen.getByText('Computer Science')).toBeDefined();
  });

  it('should call onChange when option is clicked', async () => {
    const onChange = vi.fn();
    render(<Dropdown value="" onChange={onChange} options={mockOptions} placeholder="Select major" />);
    
    const button = screen.getByRole('button', { name: /Select major/i });
    fireEvent.click(button);
    expect(screen.getByText('Computer Science')).toBeDefined();
    fireEvent.click(screen.getByText('Computer Science'));
    expect(onChange).toHaveBeenCalledWith('cs');
  });

  it('should filter options when searchable and typing', async () => {
    render(
      <Dropdown
        searchable
        value=""
        onChange={vi.fn()}
        options={mockOptions}
        placeholder="Select major"
        searchPlaceholder="Search..."
      />
    );
    
    fireEvent.click(screen.getByText('Select major'));
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'Eng' } });
    await waitFor(() => expect(screen.getByText('Engineering')).toBeDefined());
    expect(screen.queryByText('Computer Science')).toBeNull();
  });

  it('should show error message when provided', () => {
    render(<Dropdown value="" onChange={vi.fn()} options={mockOptions} placeholder="Select" error="required" />);
    expect(screen.getByText('required')).toBeDefined();
  });

  it('should show no results message when searchable has no matches', async () => {
    render(
      <Dropdown
        searchable
        value=""
        onChange={vi.fn()}
        options={[]}
        placeholder="Select"
      />
    );
    fireEvent.click(screen.getByText('Select'));
    await waitFor(() => expect(screen.getByText('لا توجد نتائج')).toBeDefined());
  });

  it('should close on Escape key', async () => {
    render(<Dropdown value="" onChange={vi.fn()} options={mockOptions} placeholder="Select" />);
    fireEvent.click(screen.getByRole('button', { name: /Select/i }));
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByText('Computer Science')).toBeNull());
  });

  it('should render sublabel when provided', async () => {
    const optionsWithSublabel = [
      { value: 'cs101', label: 'Intro CS', sublabel: 'CS101' },
    ];
    render(<Dropdown value="" onChange={vi.fn()} options={optionsWithSublabel} placeholder="Select" />);
    fireEvent.click(screen.getByRole('button', { name: /Select/i }));
    await waitFor(() => expect(screen.getByText('Intro CS')).toBeDefined());
    expect(screen.getByText('CS101')).toBeDefined();
  });
});
