import type { UploadFunction } from './index';

export const demoImageUpload: UploadFunction = (
  file,
  onProgress,
  abortSignal,
) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    const cleanup = () => abortSignal?.removeEventListener('abort', abort);
    const abort = () => {
      reader.abort();
      cleanup();
      reject(new DOMException('Upload canceled', 'AbortError'));
    };

    if (abortSignal?.aborted) {
      abort();
      return;
    }

    abortSignal?.addEventListener('abort', abort, { once: true });
    onProgress?.({ progress: 0 });
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.({
          progress: Math.min(
            99,
            Math.round((event.loaded / event.total) * 100),
          ),
        });
      }
    };
    reader.onerror = () => {
      cleanup();
      reject(reader.error || new Error('Unable to read the image'));
    };
    reader.onload = () => {
      cleanup();
      onProgress?.({ progress: 100 });
      resolve(String(reader.result));
    };
    reader.readAsDataURL(file);
  });
