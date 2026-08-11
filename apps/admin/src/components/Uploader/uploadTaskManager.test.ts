import { webcrypto } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  Attachment,
  UploadConfig,
  UploadSession,
} from '@/services/upload';
import {
  getUploadConfig,
  requestJson,
  uploadExternalWithProgress,
  uploadWithProgress,
} from '@/services/upload';
import { resetUploadConfigCache, uploadFile } from './uploadTaskManager';

vi.mock('@/services/upload', () => ({
  getUploadConfig: vi.fn(),
  requestJson: vi.fn(),
  uploadExternalWithProgress: vi.fn(),
  uploadWithProgress: vi.fn(),
}));

const config: UploadConfig = {
  allowedExtensions: ['png', 'zip'],
  maxBytes: {
    image: 100,
    video: 100,
    audio: 100,
    document: 100,
    archive: 100,
    other: 100,
  },
  normalThreshold: 4,
  chunkSize: 3,
  concurrency: 2,
  maxRetries: 1,
  maxCount: 20,
  temporaryTtlHours: 24,
  defaultDisk: 'local',
  directUploadEnabled: false,
  directUploadProvider: null,
};

const attachment = {
  id: 1,
  originalName: 'file.bin',
  status: 'temporary',
} as Attachment;

const task = (file: File) => ({
  id: 'task-id',
  file,
  uploadToken: 'upload_token',
  progress: 0,
  status: 'waiting' as const,
  uploadedChunks: [],
  createdAt: Date.now(),
});

describe('uploadTaskManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    resetUploadConfigCache();
    vi.mocked(getUploadConfig).mockResolvedValue(config);
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: webcrypto,
    });
  });

  it('uses normal upload below the server threshold', async () => {
    const file = new File(['1234'], 'small.bin', {
      type: 'application/octet-stream',
    });
    vi.mocked(uploadWithProgress).mockResolvedValue(attachment);
    const update = vi.fn();

    await expect(
      uploadFile(task(file), {
        signal: new AbortController().signal,
        update,
      }),
    ).resolves.toBe(attachment);

    expect(uploadWithProgress).toHaveBeenCalledOnce();
    expect(requestJson).not.toHaveBeenCalled();
  });

  it('resumes a multipart upload and sends only missing chunks', async () => {
    const file = new File(['123456789'], 'large.bin', {
      type: 'application/octet-stream',
      lastModified: 100,
    });
    localStorage.setItem(
      'cx-cms-upload-sessions',
      JSON.stringify({
        'large.bin:9:100:application/octet-stream': 'resume-id',
      }),
    );
    const session: UploadSession = {
      uploadId: 'resume-id',
      uploadToken: 'upload_token',
      attachmentId: 1,
      originalName: 'large.bin',
      fileSize: 9,
      mimeType: 'application/octet-stream',
      chunkSize: 3,
      chunkTotal: 3,
      uploadedChunks: [0, 2],
      missingChunks: [1],
      uploadMode: 'multipart',
      status: 'uploading',
      progress: 67,
      expiresAt: '2026-01-01T00:00:00Z',
    };
    vi.mocked(requestJson)
      .mockResolvedValueOnce(session)
      .mockResolvedValueOnce(attachment);
    vi.mocked(uploadWithProgress).mockResolvedValue(session);

    await expect(
      uploadFile(task(file), {
        signal: new AbortController().signal,
        update: vi.fn(),
      }),
    ).resolves.toBe(attachment);

    expect(uploadWithProgress).toHaveBeenCalledOnce();
    expect(requestJson).toHaveBeenLastCalledWith(
      '/api/v1/admin/uploads/resume-id/complete',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('uploads directly to Qiniu and completes through the API', async () => {
    const file = new File(['1234'], 'direct.png', { type: 'image/png' });
    vi.mocked(getUploadConfig).mockResolvedValue({
      ...config,
      defaultDisk: 'qiniu',
      directUploadEnabled: true,
      directUploadProvider: 'qiniu',
    });
    vi.mocked(requestJson)
      .mockResolvedValueOnce({
        attachmentId: 8,
        provider: 'qiniu',
        objectKey: 'images/2026/08/example.png',
        uploadUrl: 'https://upload.example.test',
        providerToken: 'provider-token',
        expiresIn: 600,
      })
      .mockResolvedValueOnce(attachment);
    vi.mocked(uploadExternalWithProgress).mockResolvedValue({});
    const update = vi.fn();

    await expect(
      uploadFile(
        task(file),
        { signal: new AbortController().signal, update },
        'qiniu-direct',
      ),
    ).resolves.toBe(attachment);

    expect(uploadExternalWithProgress).toHaveBeenCalledWith(
      'https://upload.example.test',
      expect.any(FormData),
      expect.any(AbortSignal),
      expect.any(Function),
    );
    expect(requestJson).toHaveBeenLastCalledWith(
      '/api/v1/admin/uploads/direct/8/complete',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ uploadToken: 'upload_token' }),
      }),
    );
  });
});
