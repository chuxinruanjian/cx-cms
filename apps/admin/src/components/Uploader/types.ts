import type { UploadedFile, UploadFileType } from '@/services/upload';

export type UploadTaskStatus =
  | 'waiting'
  | 'uploading'
  | 'paused'
  | 'success'
  | 'error'
  | 'canceled';

export interface UploadTask {
  id: string;
  file: File;
  uploadToken: string;
  uploadId?: string;
  attachmentId?: number;
  progress: number;
  status: UploadTaskStatus;
  error?: string;
  uploadedChunks: number[];
  createdAt: number;
}

export interface UploaderOptions {
  accept?: string;
  crop?: boolean;
  cropAspect?: number;
  fallbackText?: React.ReactNode;
  fileType?: UploadFileType;
  initialPreviewUrl?: string;
  maxCount?: number;
  multiple?: boolean;
  sortable?: boolean;
  uploadMode?: 'auto' | 'qiniu-direct';
  previewShape?: 'circle' | 'square';
  value?: string | string[] | null;
  onChange?: (value: string | string[] | null) => void;
}

export interface UploaderStateFile extends UploadedFile {
  persisted: boolean;
}

export interface UploaderProps extends UploaderOptions {
  title?: React.ReactNode;
  hint?: React.ReactNode;
  compact?: boolean;
}
