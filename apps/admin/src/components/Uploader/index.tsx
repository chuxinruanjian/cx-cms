import { BaseUploader } from './BaseUploader';
import type { UploaderProps } from './types';

export { BaseUploader, downloadUploadedFile } from './BaseUploader';
export type { UploaderOptions, UploaderProps, UploadTask } from './types';
export { useUploader } from './useUploader';

export const AvatarUploader = (props: UploaderProps) => (
  <BaseUploader
    {...props}
    accept="image/*"
    fileType="image"
    maxCount={1}
    multiple={false}
    compact
    crop
    cropAspect={1}
    previewShape="circle"
  />
);

export const SquareImageUploader = (props: UploaderProps) => (
  <BaseUploader
    {...props}
    accept="image/*"
    fileType="image"
    maxCount={1}
    multiple={false}
  />
);

export const CoverImageUploader = (props: UploaderProps) => (
  <BaseUploader
    {...props}
    accept="image/*"
    fileType="image"
    maxCount={1}
    multiple={false}
  />
);

export const MultiImageUploader = (props: UploaderProps) => (
  <BaseUploader
    {...props}
    accept="image/*"
    fileType="image"
    multiple
    sortable
  />
);

export const VideoUploader = (props: UploaderProps) => (
  <BaseUploader
    {...props}
    accept="video/*"
    fileType="video"
    maxCount={1}
    multiple={false}
  />
);

export const FileUploader = (props: UploaderProps) => (
  <BaseUploader multiple {...props} />
);
