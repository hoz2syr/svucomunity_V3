import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileUpload } from '../hooks/useFileUpload';

describe('useFileUpload', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('initial state has isUploading false', () => {
    const { result } = renderHook(() => useFileUpload(vi.fn(), vi.fn()));
    expect(result.current.isUploading).toBe(false);
  });

  it('returns early with invalid mime type', async () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useFileUpload(vi.fn(), onError));

    const fakeEvent = {
      target: { files: [new File(['x'], 'test.bin', { type: 'application/octet-stream' })] },
    } as any;

    await act(async () => { result.current.handleFileUpload(fakeEvent); });
    expect(onError).toHaveBeenCalled();
  });

  it('returns early if file is over 10MB', async () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useFileUpload(vi.fn(), onError));

    const bigContent = new Uint8Array(11 * 1024 * 1024);
    const bigFile = new File([bigContent], 'big.jpg', { type: 'image/jpeg' });
    const fakeEvent = { target: { files: [bigFile] } } as any;

    await act(async () => { result.current.handleFileUpload(fakeEvent); });
    expect(onError).toHaveBeenCalled();
  });

  it('returns early if no file selected', async () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useFileUpload(vi.fn(), onError));
    await act(async () => { result.current.handleFileUpload({ target: { files: undefined } } as any); });
    expect(onError).not.toHaveBeenCalled();
  });

  it('calls onSuccess for valid image file', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const { result } = renderHook(() => useFileUpload(onSuccess, onError));
    const bytes = new Uint8Array([0xFF, 0xD8, 0xFF])
    const blob = new Blob([bytes], { type: 'image/jpeg' })
    const file = new File([blob], 'valid.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: bytes.length })
    await act(async () => { result.current.handleFileUpload({ target: { files: [file] } } as any); })
    expect(onSuccess).toHaveBeenCalled()
  });

  it('calls onError when magic bytes mismatch file type', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const { result } = renderHook(() => useFileUpload(onSuccess, onError));
    const bytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47])
    const blob = new Blob([bytes], { type: 'image/png' })
    const file = new File([blob], 'fake.png', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: bytes.length })
    await act(async () => { result.current.handleFileUpload({ target: { files: [file] } } as any); })
    expect(onError).toHaveBeenCalledWith('File is not a valid image')
  });
});
