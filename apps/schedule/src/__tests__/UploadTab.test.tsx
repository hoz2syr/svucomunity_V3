import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UploadTab } from '../components/UploadTab';

beforeEach(() => { vi.clearAllMocks(); });



vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
}));

vi.mock('@/components/ui/Card', () => ({
  Card: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
}));

vi.mock('@/lib/utils', () => ({ cn: (...args: any[]) => args.filter(Boolean).join(' ') }));

vi.mock('lucide-react', () => ({
  Upload: (props: any) => <span data-testid="upload-icon" {...props} />,
  Loader2: (props: any) => <span data-testid="loader-icon" {...props} />,
  AlertCircle: (props: any) => <span data-testid="alert-icon" {...props} />,
  Info: (props: any) => <span data-testid="info-icon" {...props} />,
}));

describe('UploadTab', () => {
  it('renders upload text when not uploading', () => {
    render(<UploadTab isUploading={false} error={null} onFileUpload={() => {}} />);
    expect(screen.getByText('Upload your schedule image')).toBeDefined();
  });

  it('renders processing text when uploading', () => {
    render(<UploadTab isUploading={true} error={null} onFileUpload={() => {}} />);
    expect(screen.getByText('Processing your schedule...')).toBeDefined();
  });

  it('renders error alert when error is set', () => {
    render(<UploadTab isUploading={false} error="Something went wrong" onFileUpload={() => {}} />);
    expect(screen.getByText('Something went wrong')).toBeDefined();
  });

  it('renders How it works info section', () => {
    render(<UploadTab isUploading={false} error={null} onFileUpload={() => {}} />);
    expect(screen.getByText('How it works')).toBeDefined();
  });

  it('file input is disabled during upload', () => {
    render(<UploadTab isUploading={true} error={null} onFileUpload={() => {}} />);
    const input = document.querySelector('input[type="file"]');
    expect((input as HTMLInputElement).disabled).toBe(true);
  });

  it('file input is enabled when idle', () => {
    render(<UploadTab isUploading={false} error={null} onFileUpload={() => {}} />);
    const input = document.querySelector('input[type="file"]');
    expect((input as HTMLInputElement).disabled).toBe(false);
  });
});
