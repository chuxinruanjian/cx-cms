import type {
  Attachment,
  AttachmentFileType,
  UploadConfig,
  UploadSession,
} from '@/services/upload';
import {
  getUploadConfig,
  requestJson,
  uploadWithProgress,
} from '@/services/upload';
import type { UploadTask } from './types';

const api = '/api/v1/admin';
const resumeKey = 'cx-cms-upload-sessions';
let configPromise: Promise<UploadConfig> | undefined;

export const loadUploadConfig = () => {
  if (!configPromise) configPromise = getUploadConfig();
  return configPromise;
};

export const resetUploadConfigCache = () => {
  configPromise = undefined;
};

export const fileFingerprint = (file: File) =>
  `${file.name}:${file.size}:${file.lastModified}:${file.type}`;

export const newUploadToken = () =>
  globalThis.crypto?.randomUUID?.() ??
  `upload_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const extensionType = (extension: string): AttachmentFileType => {
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'].includes(extension))
    return 'image';
  if (['mp4', 'webm', 'mov'].includes(extension)) return 'video';
  if (['mp3', 'wav', 'ogg'].includes(extension)) return 'audio';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'archive';
  if (
    ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'].includes(
      extension,
    )
  )
    return 'document';
  return 'other';
};

export const validateSelectedFile = async (
  file: File,
  expectedType?: AttachmentFileType,
) => {
  const config = await loadUploadConfig();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!config.allowedExtensions.includes(extension)) {
    throw new Error(`.${extension || '?'} files are not allowed`);
  }
  const actualType = extensionType(extension);
  if (expectedType && actualType !== expectedType) {
    throw new Error(`Expected a ${expectedType} file`);
  }
  if (file.size > config.maxBytes[actualType]) {
    throw new Error(
      `${file.name} exceeds the ${(config.maxBytes[actualType] / 1024 / 1024).toFixed(0)} MB limit`,
    );
  }
};

const digest = async (blob: Blob) => {
  const buffer = await blob.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const readResumeMap = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(resumeKey) || '{}');
  } catch {
    return {};
  }
};

const saveResume = (file: File, uploadId?: string) => {
  const map = readResumeMap();
  const key = fileFingerprint(file);
  if (uploadId) map[key] = uploadId;
  else delete map[key];
  localStorage.setItem(resumeKey, JSON.stringify(map));
};

const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const retry = async <T>(action: () => Promise<T>, retries: number) => {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (error instanceof DOMException && error.name === 'AbortError')
        throw error;
      if (attempt < retries) await sleep(300 * 2 ** attempt);
    }
  }
  throw lastError;
};

export interface UploadRuntime {
  signal: AbortSignal;
  update: (patch: Partial<UploadTask>) => void;
}

const normalUpload = async (
  task: UploadTask,
  runtime: UploadRuntime,
): Promise<Attachment> => {
  const data = new FormData();
  data.append('file', task.file);
  data.append('uploadToken', task.uploadToken);
  return uploadWithProgress<Attachment>(
    `${api}/uploads`,
    data,
    runtime.signal,
    (progress) => runtime.update({ progress }),
  );
};

const getOrCreateSession = async (
  task: UploadTask,
  config: UploadConfig,
  runtime: UploadRuntime,
) => {
  const resumedId =
    task.uploadId || readResumeMap()[fileFingerprint(task.file)];
  if (resumedId) {
    try {
      const resumed = await requestJson<UploadSession>(
        `${api}/uploads/${resumedId}`,
        { signal: runtime.signal },
      );
      if (
        resumed.originalName === task.file.name &&
        resumed.fileSize === task.file.size &&
        !['aborted', 'expired', 'completed'].includes(resumed.status)
      ) {
        runtime.update({
          uploadId: resumed.uploadId,
          attachmentId: resumed.attachmentId,
          uploadedChunks: resumed.uploadedChunks,
          progress: resumed.progress,
        });
        return resumed;
      }
    } catch {
      saveResume(task.file);
    }
  }

  const session = await requestJson<UploadSession>(`${api}/uploads/init`, {
    method: 'POST',
    signal: runtime.signal,
    body: JSON.stringify({
      originalName: task.file.name,
      mimeType: task.file.type || 'application/octet-stream',
      fileSize: task.file.size,
      uploadToken: task.uploadToken,
      chunkSize: config.chunkSize,
    }),
  });
  saveResume(task.file, session.uploadId);
  runtime.update({
    uploadId: session.uploadId,
    attachmentId: session.attachmentId,
  });
  return session;
};

const multipartUpload = async (
  task: UploadTask,
  config: UploadConfig,
  runtime: UploadRuntime,
): Promise<Attachment> => {
  const session = await getOrCreateSession(task, config, runtime);
  const completed = new Set(session.uploadedChunks);
  const queue = session.missingChunks.slice();
  let doneBytes = session.uploadedChunks.reduce((total, index) => {
    const start = index * session.chunkSize;
    return total + Math.min(session.chunkSize, task.file.size - start);
  }, 0);

  const worker = async () => {
    while (queue.length > 0) {
      if (runtime.signal.aborted) {
        throw new DOMException('Upload paused', 'AbortError');
      }
      const index = queue.shift();
      if (index === undefined) return;
      const start = index * session.chunkSize;
      const chunk = task.file.slice(
        start,
        Math.min(start + session.chunkSize, task.file.size),
      );
      const chunkHash = await digest(chunk);
      await retry(async () => {
        const data = new FormData();
        data.append('chunk', chunk, `${index}.part`);
        data.append('chunkIndex', String(index));
        data.append('chunkHash', chunkHash);
        await uploadWithProgress<UploadSession>(
          `${api}/uploads/${session.uploadId}/chunks`,
          data,
          runtime.signal,
          (partProgress) => {
            const current = (chunk.size * partProgress) / 100;
            runtime.update({
              progress: Math.min(
                99,
                Math.round(((doneBytes + current) / task.file.size) * 100),
              ),
            });
          },
        );
      }, config.maxRetries);
      if (!completed.has(index)) {
        completed.add(index);
        doneBytes += chunk.size;
        runtime.update({
          uploadedChunks: [...completed].sort((a, b) => a - b),
          progress: Math.min(
            99,
            Math.round((doneBytes / task.file.size) * 100),
          ),
        });
      }
    }
  };

  await Promise.all(
    Array.from(
      { length: Math.max(1, Math.min(config.concurrency, queue.length || 1)) },
      worker,
    ),
  );
  const attachment = await requestJson<Attachment>(
    `${api}/uploads/${session.uploadId}/complete`,
    { method: 'POST', signal: runtime.signal },
  );
  saveResume(task.file);
  return attachment;
};

export const uploadFile = async (
  task: UploadTask,
  runtime: UploadRuntime,
): Promise<Attachment> => {
  const config = await loadUploadConfig();
  if (task.file.size <= config.normalThreshold) {
    return normalUpload(task, runtime);
  }
  return multipartUpload(task, config, runtime);
};

export const abortUploadSession = async (uploadId: string) =>
  requestJson<UploadSession>(`${api}/uploads/${uploadId}/abort`, {
    method: 'POST',
  });
