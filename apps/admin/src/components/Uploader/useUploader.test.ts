import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { uploadFile, validateSelectedFile } from './uploadTaskManager';
import { useUploader } from './useUploader';

vi.mock('antd', () => ({
  App: { useApp: () => ({ message: { error: vi.fn() } }) },
}));

vi.mock('./uploadTaskManager', () => ({
  abortUploadSession: vi.fn(),
  newUploadToken: vi.fn(() => crypto.randomUUID()),
  uploadFile: vi.fn(),
  validateSelectedFile: vi.fn(),
}));

describe('useUploader URL values', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateSelectedFile).mockResolvedValue(undefined);
  });

  it('emits one URL string for a single-file field', async () => {
    const onChange = vi.fn();
    vi.mocked(uploadFile).mockResolvedValue({
      id: 9,
      originalName: 'avatar.png',
      mimeType: 'image/png',
      size: 128,
      url: '/api/v1/uploads/files/avatar-uuid',
    });
    const { result } = renderHook(() =>
      useUploader({ multiple: false, value: '/old-avatar.png', onChange }),
    );

    expect(result.current.files[0]?.url).toBe('/old-avatar.png');
    await act(() =>
      result.current.addFiles([new File(['avatar'], 'avatar.png')]),
    );
    await waitFor(() =>
      expect(result.current.files[0]?.url).toContain('avatar-uuid'),
    );

    expect(onChange).toHaveBeenLastCalledWith(
      '/api/v1/uploads/files/avatar-uuid',
    );
  });

  it('counts existing URL values when enforcing a multi-file limit', async () => {
    const value = ['/existing.png'];
    vi.mocked(uploadFile).mockResolvedValue({
      id: 10,
      originalName: 'new.png',
      mimeType: 'image/png',
      size: 64,
      url: '/api/v1/uploads/files/new-uuid',
    });
    const { result } = renderHook(() =>
      useUploader({ multiple: true, maxCount: 2, value }),
    );

    await act(() =>
      result.current.addFiles([
        new File(['one'], 'one.png'),
        new File(['two'], 'two.png'),
      ]),
    );
    await waitFor(() => expect(result.current.files).toHaveLength(2));

    expect(uploadFile).toHaveBeenCalledOnce();
  });
});
