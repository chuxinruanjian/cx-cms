import type { Attachment, AttachmentFileType } from '@/services/upload';

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
  fileType?: AttachmentFileType;
  initialPreviewUrl?: string;
  maxCount?: number;
  multiple?: boolean;
  sortable?: boolean;
  previewShape?: 'circle' | 'square';
  value?: Attachment[];
  onChange?: (attachments: Attachment[]) => void;
}

export interface UploaderProps extends UploaderOptions {
  title?: React.ReactNode;
  hint?: React.ReactNode;
  compact?: boolean;
}
