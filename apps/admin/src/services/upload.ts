import { request } from '@umijs/max';
import { clearAdminToken, getAdminToken } from '@/utils/adminAuth';

export type UploadFileType =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'archive'
  | 'other';

export type UploadStatus =
  | 'uploading'
  | 'temporary'
  | 'active'
  | 'pending_delete'
  | 'deleted'
  | 'failed';

export interface UploadedFile {
  id: number | string;
  uuid?: string;
  originalName: string;
  fileName?: string;
  storageDisk?: 'local' | 'qiniu' | 'oss' | 's3';
  extension?: string;
  mimeType: string;
  fileType?: UploadFileType;
  size: number;
  hash?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  status?: UploadStatus;
  uploadMode?: 'normal' | 'multipart' | 'direct';
  url: string;
}

export interface UploadConfig {
  allowedExtensions: readonly string[];
  maxBytes: Record<UploadFileType, number>;
  normalThreshold: number;
  chunkSize: number;
  concurrency: number;
  maxRetries: number;
  maxCount: number;
  temporaryTtlHours: number;
  defaultDisk: 'local' | 'qiniu' | 'oss' | 's3';
  directUploadEnabled: boolean;
  directUploadProvider: 'qiniu' | null;
}

export interface DirectUploadAuthorization {
  attachmentId: number;
  provider: 'qiniu';
  objectKey: string;
  uploadUrl: string;
  providerToken: string;
  expiresIn: number;
}

export interface UploadSession {
  uploadId: string;
  uploadToken: string;
  attachmentId: number;
  originalName: string;
  fileSize: number;
  mimeType: string;
  chunkSize: number;
  chunkTotal: number;
  uploadedChunks: number[];
  missingChunks: number[];
  uploadMode: 'multipart';
  status:
    | 'initialized'
    | 'uploading'
    | 'completed'
    | 'aborted'
    | 'expired'
    | 'failed';
  progress: number;
  expiresAt: string;
}

const api = '/api/v1/admin';

export const getUploadConfig = () =>
  request<UploadConfig>(`${api}/upload-config`);

export const requestJson = async <T>(
  path: string,
  init: RequestInit = {},
): Promise<T> => {
  const response = await fetch(path, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...(getAdminToken()
        ? { Authorization: `Bearer ${getAdminToken()}` }
        : {}),
      ...init.headers,
    },
  });
  const result = await response.json().catch(() => ({}));
  if (response.status === 401) {
    clearAdminToken();
    window.location.href = '/admin/user/login';
  }
  if (!response.ok) {
    throw new Error(result.message || `Upload request failed (${response.status})`);
  }
  return result as T;
};

export const uploadWithProgress = <T>(
  path: string,
  formData: FormData,
  signal: AbortSignal,
  onProgress: (percent: number) => void,
) =>
  new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', path);
    xhr.setRequestHeader('Accept', 'application/json');
    const token = getAdminToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      let result: { message?: string } = {};
      try {
        result = JSON.parse(xhr.responseText || '{}');
      } catch {
        result = {};
      }
      if (xhr.status === 401) {
        clearAdminToken();
        window.location.href = '/admin/user/login';
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(result as T);
      else reject(new Error(result.message || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.onabort = () => reject(new DOMException('Upload canceled', 'AbortError'));
    signal.addEventListener('abort', () => xhr.abort(), { once: true });
    xhr.send(formData);
  });

export const uploadExternalWithProgress = <T>(
  path: string,
  formData: FormData,
  signal: AbortSignal,
  onProgress: (percent: number) => void,
) =>
  new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', path);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      let result: { error?: string; message?: string } = {};
      try {
        result = JSON.parse(xhr.responseText || '{}');
      } catch {
        result = {};
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(result as T);
      else
        reject(
          new Error(
            result.error ||
              result.message ||
              `Cloud upload failed (${xhr.status})`,
          ),
        );
    };
    xhr.onerror = () => reject(new Error('Cloud upload network error'));
    xhr.onabort = () =>
      reject(new DOMException('Upload canceled', 'AbortError'));
    signal.addEventListener('abort', () => xhr.abort(), { once: true });
    xhr.send(formData);
  });
