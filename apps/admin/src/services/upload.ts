import { request } from '@umijs/max';
import { clearAdminToken, getAdminToken } from '@/utils/adminAuth';

export type AttachmentFileType =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'archive'
  | 'other';

export type AttachmentStatus =
  | 'uploading'
  | 'temporary'
  | 'active'
  | 'pending_delete'
  | 'deleted'
  | 'failed';

export interface Attachment {
  id: number;
  uuid: string;
  originalName: string;
  fileName: string;
  storageDisk: 'local' | 'oss' | 's3';
  extension: string;
  mimeType: string;
  fileType: AttachmentFileType;
  size: number;
  hash: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  status: AttachmentStatus;
  uploadMode: 'normal' | 'multipart' | 'direct';
  uploadToken: string;
  uploaderId: number;
  isComplete: boolean;
  url: string | null;
  previewUrl: string | null;
  downloadUrl: string | null;
  progress: number;
  errorMessage: string | null;
  referenceCount: number;
  createdAt: string;
  updatedAt: string;
  boundAt: string | null;
  expiresAt: string | null;
  deletedAt: string | null;
  references?: Array<{
    businessType: string;
    businessId: string;
    fieldName: string;
    sort: number;
    createdAt: string;
  }>;
}

export interface UploadConfig {
  allowedExtensions: readonly string[];
  maxBytes: Record<AttachmentFileType, number>;
  normalThreshold: number;
  chunkSize: number;
  concurrency: number;
  maxRetries: number;
  maxCount: number;
  temporaryTtlHours: number;
  defaultDisk: 'local' | 'oss' | 's3';
  directUploadEnabled: boolean;
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

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
  };
}

const api = '/api/v1/admin';

export const getUploadConfig = () =>
  request<UploadConfig>(`${api}/upload-config`);

export const listAttachments = (params: Record<string, unknown>) =>
  request<Paginated<Attachment>>(`${api}/attachments`, { params });

export const getAttachment = (id: number) =>
  request<Attachment>(`${api}/attachments/${id}`);

export const deleteAttachment = (id: number) =>
  request<Attachment>(`${api}/attachments/${id}`, { method: 'DELETE' });

export const bindAttachments = (payload: {
  attachmentIds: number[];
  businessType: string;
  businessId: string;
  fieldName: string;
}) =>
  request<Attachment[]>(`${api}/attachments/bind`, {
    method: 'POST',
    data: payload,
  });

export const sortAttachments = (payload: {
  attachmentIds: number[];
  businessType: string;
  businessId: string;
  fieldName: string;
}) =>
  request<{ attachmentIds: number[] }>(`${api}/attachments/sort`, {
    method: 'POST',
    data: payload,
  });

export const listUploadSessions = (params: Record<string, unknown>) =>
  request<Paginated<UploadSession>>(`${api}/uploads`, { params });

export const cleanupUploads = () =>
  request<{
    sessionsCleaned: number;
    attachmentsCleaned: number;
    errors: Array<{ type: string; id: string | number; message: string }>;
  }>(`${api}/uploads/cleanup`, { method: 'POST' });

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
